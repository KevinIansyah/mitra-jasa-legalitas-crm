import { router } from '@inertiajs/react';
import { ArchiveRestore, ArrowDownToLine, Printer, RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatRupiah } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import finances from '@/routes/finances';
import type { ProjectInvoice } from '@/types/projects';
import { INVOICE_TYPES_MAP } from '@/types/projects';
import type { SiteSetting } from '@/types/site-setting';

const R2_PUBLIC_URL = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL;

type DetailSectionProps = {
    invoice: ProjectInvoice;
    settings: SiteSetting;
};

export function DetailSection({ invoice, settings }: DetailSectionProps) {
    const customer = invoice.customer ?? invoice.project?.customer;
    const company = invoice.project?.company;
    const typeInfo = INVOICE_TYPES_MAP?.[invoice.type];

    const [regenerating, setRegenerating] = useState(false);

    const handleRegeneratePdf = () => {
        setRegenerating(true);

        const id = toast.loading('Memproses...', {
            description: 'Invoice sedang di generate ulang.',
        });

        router.post(
            finances.invoices.regeneratePdf(invoice.id),
            {},
            {
                onSuccess: () => {
                    toast.success('Berhasil', {
                        description: 'Invoice berhasil di generate ulang.',
                    });
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat generate ulang invoice, coba lagi.';
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
        if (!invoice.file_path) return;
        window.location.href = finances.invoices.download(invoice.id).url;
    };

    const handleOpen = () => {
        if (!invoice.file_path) return;

        const url = `${R2_PUBLIC_URL}/${invoice.file_path}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handlePrint = () => {
        if (!invoice.file_path) return;

        const url = `${R2_PUBLIC_URL}/${invoice.file_path}`;
        const win = window.open(url, '_blank');

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
                {invoice.file_path && (
                    <>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" onClick={handleDownload}>
                                    <ArrowDownToLine className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Unduh PDF</p>
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

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="secondary" size="icon" onClick={handleRegeneratePdf} disabled={regenerating}>
                            {regenerating ? <RefreshCcw className="size-4 animate-spin direction-[reverse]" /> : <RefreshCcw className="size-4" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Generate ulang PDF</p>
                    </TooltipContent>
                </Tooltip>
            </div>

            {/* ───────────────── Invoice Paper ───────────────── */}
            <div
                id="invoice-paper"
                className="mx-auto w-full max-w-[794px] rounded-xl bg-white p-14 shadow-lg dark:bg-sidebar print:max-w-full print:rounded-none print:p-0 print:shadow-none"
            >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-border pb-10">
                    <div className="flex items-start gap-4">
                        {settings.company_logo && (
                            <img src={`${R2_PUBLIC_URL}/${settings.company_logo}`} alt={settings.company_name ?? ''} className="h-16 w-auto object-contain" />
                        )}
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">{settings.company_name ?? 'CV. Mitra Jasa Legalitas'}</h2>
                            {settings.company_tagline && <p className="mt-1 text-sm text-muted-foreground">{settings.company_tagline}</p>}
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
                        <h2 className="text-2xl font-semibold tracking-tight text-foreground">FAKTUR</h2>
                        <p className="text-lg font-semibold text-muted-foreground">{invoice.invoice_number}</p>
                    </div>
                </div>

                {/* Invoice Meta */}
                <div className="mt-10 grid grid-cols-2 gap-8">
                    {/* Tagihan Kepada */}
                    <div>
                        <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Tagihan Kepada</p>
                        <p className="text-sm font-semibold text-foreground">{customer?.name ?? '-'}</p>
                        <div className="text-sm text-muted-foreground">
                            {customer?.email && <p>{customer.email}</p>}
                            {customer?.phone && <p>{customer.phone}</p>}
                            {company && (
                                <p className="mt-2 text-xs">
                                    Perusahaan: <span className="font-medium text-foreground">{company.name}</span>
                                </p>
                            )}
                            {invoice.project && (
                                <p className="text-xs">
                                    Proyek: <span className="font-medium text-foreground">{invoice.project.name}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Detail Invoice */}
                    <div>
                        <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Detail Invoice</p>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Tipe</span>
                                <span className="font-medium text-foreground">{typeInfo?.label ?? invoice.type}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Tanggal Invoice</span>
                                <span className="font-medium text-foreground">{formatDate(invoice.invoice_date)}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Jatuh Tempo</span>
                                <span className="font-medium text-foreground">{formatDate(invoice.due_date)}</span>
                            </div>
                            {invoice.percentage && Number(invoice.percentage) > 0 && (
                                <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">Persentase</span>
                                    <span className="font-medium text-foreground">{invoice.percentage}%</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mt-10">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-900 dark:border-zinc-100">
                                <th className="pb-3 text-left font-semibold text-foreground">Deskripsi</th>
                                <th className="pb-3 text-right font-semibold text-foreground">Qty</th>
                                <th className="pb-3 text-right font-semibold text-foreground">Harga Satuan</th>
                                <th className="pb-3 text-right font-semibold text-foreground">Diskon</th>
                                <th className="pb-3 text-right font-semibold text-foreground">Pajak</th>
                                <th className="pb-3 text-right font-semibold text-foreground">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {invoice.items && invoice.items.length > 0 ? (
                                invoice.items.map((item, i) => (
                                    <tr key={i}>
                                        <td className="py-3 whitespace-normal text-foreground">{item.description}</td>
                                        <td className="py-3 text-right text-muted-foreground">{item.quantity}</td>
                                        <td className="py-3 text-right text-muted-foreground">{formatRupiah(Number(item.unit_price))}</td>
                                        <td className="py-3 text-right text-muted-foreground">{Number(item.discount_percent) > 0 ? `${item.discount_percent}%` : '-'}</td>
                                        <td className="py-3 text-right text-muted-foreground">{Number(item.tax_percent) > 0 ? `${item.tax_percent}%` : '-'}</td>
                                        <td className="py-3 text-right font-medium text-foreground">{formatRupiah(Number(item.total_amount))}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="py-3 whitespace-normal text-foreground">{invoice.project ? invoice.project.name : 'Tagihan'}</td>
                                    <td className="py-3 text-right text-muted-foreground">1</td>
                                    <td className="py-3 text-right text-muted-foreground">{formatRupiah(Number(invoice.subtotal))}</td>
                                    <td className="py-3 text-right text-muted-foreground">{Number(invoice.discount_percent) > 0 ? `${invoice.discount_percent}%` : '-'}</td>
                                    <td className="py-3 text-right text-muted-foreground">{Number(invoice.tax_percent) > 0 ? `${invoice.tax_percent}%` : '-'}</td>
                                    <td className="py-3 text-right font-medium text-foreground">{formatRupiah(Number(invoice.subtotal))}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="mt-6 flex justify-end">
                    <div className="w-72 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="text-foreground">{formatRupiah(Number(invoice.subtotal))}</span>
                        </div>
                        {Number(invoice.discount_amount) > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Diskon ({invoice.discount_percent}%)</span>
                                <span className="text-foreground">-{formatRupiah(Number(invoice.discount_amount))}</span>
                            </div>
                        )}
                        {Number(invoice.tax_amount) > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Pajak ({invoice.tax_percent}%)</span>
                                <span className="text-foreground">{formatRupiah(Number(invoice.tax_amount))}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-t border-zinc-900 pt-2 font-semibold text-zinc-900 dark:border-zinc-100 dark:text-zinc-100">
                            <span>Total</span>
                            <span>{formatRupiah(Number(invoice.total_amount))}</span>
                        </div>
                    </div>
                </div>

                {/* Info Rekening */}
                {(settings.bank_name || settings.bank_account_number) && (
                    <div className="mt-10">
                        <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Info Rekening</p>
                        <div className="space-y-0.5 text-sm">
                            {settings.bank_name && (
                                <p className="font-medium text-foreground">
                                    {settings.bank_name}
                                    {settings.bank_branch ? ` - ${settings.bank_branch}` : ''}
                                </p>
                            )}
                            {settings.bank_account_number && <p className="text-muted-foreground">{settings.bank_account_number}</p>}
                            {settings.bank_account_holder && <p className="text-muted-foreground">a.n. {settings.bank_account_holder}</p>}
                        </div>
                        {settings.bank_name_alt && (
                            <div className="mt-3 space-y-0.5 text-sm">
                                <p className="font-medium text-foreground">
                                    {settings.bank_name_alt}
                                    {settings.bank_branch_alt ? ` - ${settings.bank_branch_alt}` : ''}
                                </p>
                                {settings.bank_account_number_alt && <p className="text-muted-foreground">{settings.bank_account_number_alt}</p>}
                                {settings.bank_account_holder_alt && <p className="text-muted-foreground">a.n. {settings.bank_account_holder_alt}</p>}
                            </div>
                        )}
                    </div>
                )}

                {/* Instruksi Pembayaran */}
                {invoice.payment_instructions && (
                    <div className="mt-6">
                        <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Instruksi Pembayaran</p>
                        <p className="text-sm whitespace-pre-line text-muted-foreground">{invoice.payment_instructions}</p>
                    </div>
                )}

                {/* Catatan */}
                {invoice.notes && (
                    <div className="mt-6">
                        <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Catatan</p>
                        <p className="text-sm whitespace-pre-line text-muted-foreground">{invoice.notes}</p>
                    </div>
                )}

                {/* Syarat & Ketentuan */}
                {settings.document_terms_and_conditions && (
                    <div className="mt-6 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
                        <p className="mb-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Syarat & Ketentuan</p>
                        <p className="text-xs whitespace-pre-line text-muted-foreground">{settings.document_terms_and_conditions}</p>
                    </div>
                )}

                {/* Signature & Stamp */}
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
                        <div className="mt-2 border-t border-zinc-500 pt-1 text-xs">
                            <p className="font-semibold text-foreground">{settings.signer_name ?? settings.company_name}</p>
                            {settings.signer_position && <p className="text-muted-foreground">{settings.signer_position}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
