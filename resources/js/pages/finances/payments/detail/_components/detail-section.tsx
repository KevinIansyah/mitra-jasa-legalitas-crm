import { router } from '@inertiajs/react';
import { ArchiveRestore, ArrowDownToLine, Printer, RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { formatRupiah } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import finances from '@/routes/finances';
import { INVOICE_TYPES_MAP, type ProjectPayment } from '@/types/projects';
import type { SiteSetting } from '@/types/site-setting';

const R2_PUBLIC_URL = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL;

type DetailSectionProps = {
    payment: ProjectPayment;
    settings: SiteSetting;
};

export function DetailSection({ payment, settings }: DetailSectionProps) {
    const [regenerating, setRegenerating] = useState(false);

    const invoice = payment.invoice;
    const customer = invoice?.customer ?? invoice?.project?.customer;
    const company = invoice?.project?.company;

    const allVerifiedPayments = invoice?.payments?.filter((p) => p.status === 'verified') ?? [];
    const totalPaid = allVerifiedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const isFullyPaid = totalPaid >= Number(invoice?.total_amount ?? 0);

    const handleRegenerateReceipt = () => {
        setRegenerating(true);

        const id = toast.loading('Memproses...', {
            description: 'Kwitansi sedang di generate ulang.',
        });

        router.post(
            finances.invoices.payments.regenerateReceipt({ invoice: payment.invoice_id, payment: payment.id }).url,
            {},
            {
                onSuccess: () => {
                    toast.success('Berhasil', {
                        description: 'Kwitansi berhasil di generate ulang.',
                    });
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan, coba lagi.';
                    toast.error('Gagal', { description: String(msg) });
                },
                onFinish: () => {
                    toast.dismiss(id);
                    setRegenerating(false);
                },
            },
        );
    };

    const handleDownload = () => {
        if (!payment.file_path) return;
        window.location.href = finances.invoices.payments.downloadReceipt({ invoice: payment.invoice_id, payment: payment.id }).url;
    };

    const handleOpen = () => {
        if (!payment.file_path) return;
        window.open(`${R2_PUBLIC_URL}/${payment.file_path}`, '_blank', 'noopener,noreferrer');
    };

    const handlePrint = () => {
        if (!payment.file_path) return;
        const win = window.open(`${R2_PUBLIC_URL}/${payment.file_path}`, '_blank');
        if (!win) return;
        win.onload = () => {
            win.focus();
            win.print();
        };
    };

    return (
        <div className="space-y-2">
            {/* ───────────────── Action Bar ───────────────── */}
            <div className="mx-auto flex max-w-[794px] gap-1">
                {payment.file_path && (
                    <>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" onClick={handleDownload}>
                                    <ArrowDownToLine className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Unduh Kwitansi</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="secondary" onClick={handleOpen}>
                                    <ArchiveRestore className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Buka di tab baru</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="secondary" onClick={handlePrint}>
                                    <Printer className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Print</p>
                            </TooltipContent>
                        </Tooltip>
                    </>
                )}

                {payment.status === 'verified' && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="icon" onClick={handleRegenerateReceipt} disabled={regenerating}>
                                <RefreshCcw className={`size-4 ${regenerating ? 'animate-spin direction-[reverse]' : ''}`} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Generate ulang kwitansi</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>

            {/* ───────────────── Receipt Paper ───────────────── */}
            <div className="mx-auto w-full max-w-[794px] rounded-xl bg-white p-14 shadow-lg dark:bg-sidebar print:max-w-full print:rounded-none print:p-0 print:shadow-none">
                {/* Header */}
                <div className="flex items-start justify-between gap-8 border-b border-border pb-10">
                    <div className="flex items-start gap-4">
                        {settings.company_logo && (
                            <img src={`${R2_PUBLIC_URL}/${settings.company_logo}`} alt={settings.company_name ?? ''} className="h-16 w-auto object-contain" />
                        )}
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">{settings.company_name ?? '-'}</h2>
                            {/* {settings.company_tagline && <p className="mt-1 text-sm text-muted-foreground">{settings.company_tagline}</p>} */}
                            <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                                {settings.company_address && <p>{settings.company_address}</p>}
                                {(settings.company_city || settings.company_province) && (
                                    <p>{[settings.company_city, settings.company_province, settings.company_postal_code].filter(Boolean).join(', ')}</p>
                                )}
                                {settings.company_phone && <p>Telp: {settings.company_phone}</p>}
                                {settings.company_email && <p>Email: {settings.company_email}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-semibold tracking-tight text-foreground">KWITANSI</h2>
                        {payment.receipt_number ? (
                            <p className="text-lg font-semibold whitespace-nowrap text-muted-foreground">{payment.receipt_number}</p>
                        ) : (
                            <Badge className="bg-slate-500 text-white">Belum Terverifikasi</Badge>
                        )}
                    </div>
                </div>

                {/* Meta */}
                <div className="mt-10 grid grid-cols-2 gap-8">
                    <div>
                        <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Diterima Dari</p>
                        <p className="text-sm font-semibold text-foreground">{customer?.name ?? '-'}</p>
                        <div className="text-sm text-muted-foreground">
                            {customer?.email && <p>{customer.email}</p>}
                            {customer?.phone && <p>{customer.phone}</p>}
                            {company && (
                                <p className="mt-2 text-xs">
                                    Perusahaan: <span className="font-medium text-foreground">{company.name}</span>
                                </p>
                            )}
                            {invoice?.project && (
                                <p className="text-xs">
                                    Proyek: <span className="font-medium text-foreground">{invoice.project.name}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Detail Kwitansi</p>
                        <div className="space-y-1 text-sm">
                            {payment.receipt_number && (
                                <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">Nomor Kwitansi</span>
                                    <span className="font-medium text-foreground">{payment.receipt_number}</span>
                                </div>
                            )}
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Nomor Invoice</span>
                                <span className="font-medium text-foreground">{invoice?.invoice_number ?? '-'}</span>
                            </div>
                            {payment.verified_at && (
                                <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">Tanggal Verifikasi</span>
                                    <span className="font-medium text-foreground">{formatDate(payment.verified_at)}</span>
                                </div>
                            )}
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Tanggal Bayar</span>
                                <span className="font-medium text-foreground">{formatDate(payment.payment_date)}</span>
                            </div>
                            {payment.payment_method && (
                                <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">Metode</span>
                                    <span className="font-medium text-foreground capitalize">{payment.payment_method.replace('_', ' ')}</span>
                                </div>
                            )}
                            {payment.reference_number && (
                                <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">Referensi</span>
                                    <span className="font-medium text-foreground">{payment.reference_number}</span>
                                </div>
                            )}
                            {payment.verifier && (
                                <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">Diverifikasi Oleh</span>
                                    <span className="font-medium text-foreground">{payment.verifier.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Amount */}
                <div className="mt-10">
                    <p className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Jumlah Pembayaran</p>
                    <div className="rounded-lg border border-foreground p-6">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                <p>
                                    Pembayaran untuk invoice <span className="font-medium text-foreground">{invoice?.invoice_number}</span>
                                </p>
                                {invoice?.type && (
                                    <p className="mt-1">
                                        Tipe: <span className="font-medium text-foreground">{INVOICE_TYPES_MAP[invoice.type]?.label}</span>
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Jumlah Dibayar</p>
                                <p className="text-2xl font-semibold text-foreground">{formatRupiah(Number(payment.amount))}</p>
                            </div>
                        </div>

                        {allVerifiedPayments.length > 1 && (
                            <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Invoice</span>
                                    <span className="text-foreground">{formatRupiah(Number(invoice?.total_amount ?? 0))}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Terbayar</span>
                                    <span className="text-foreground">{formatRupiah(totalPaid)}</span>
                                </div>
                                {isFullyPaid ? (
                                    <div className="flex justify-between font-semibold text-green-600">
                                        <span>Status</span>
                                        <span>LUNAS</span>
                                    </div>
                                ) : (
                                    <div className="flex justify-between font-medium">
                                        <span className="text-muted-foreground">Sisa</span>
                                        <span className="text-foreground">{formatRupiah(Number(invoice?.total_amount ?? 0) - totalPaid)}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Catatan */}
                {payment.notes && (
                    <div className="mt-6">
                        <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Catatan</p>
                        <p className="text-sm whitespace-pre-line text-muted-foreground">{payment.notes}</p>
                    </div>
                )}

                {/* Syarat & Ketentuan */}
                {settings.document_terms_and_conditions && (
                    <div className="mt-6 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
                        <p className="mb-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Syarat & Ketentuan</p>
                        <p className="text-xs whitespace-pre-line text-muted-foreground">{settings.document_terms_and_conditions}</p>
                    </div>
                )}

                {/* Signature */}
                <div className="mt-10 flex items-end justify-between">
                    <div className="text-xs text-muted-foreground">
                        {settings.document_footer_text && <p>{settings.document_footer_text}</p>}
                        {settings.legal_npwp && <p>NPWP: {settings.legal_npwp}</p>}
                    </div>
                    <div className="text-center">
                        <p className="mb-3 text-xs text-muted-foreground">Hormat kami,</p>
                        <div className="relative inline-block min-h-[64px] min-w-[128px]">
                            {settings.stamp_image && (
                                <img src={`${R2_PUBLIC_URL}/${settings.stamp_image}`} alt="Stempel" className="absolute -top-4 -left-8 h-20 w-20 object-contain opacity-80" />
                            )}
                            {settings.signature_image && (
                                <img src={`${R2_PUBLIC_URL}/${settings.signature_image}`} alt="Tanda Tangan" className="mx-auto h-16 w-32 object-contain" />
                            )}
                        </div>
                        <div className="mt-2 border-t border-zinc-900 pt-1 text-xs dark:border-zinc-100">
                            <p className="font-semibold text-foreground">{settings.signer_name ?? settings.company_name}</p>
                            {settings.signer_position && <p className="text-muted-foreground">{settings.signer_position}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
