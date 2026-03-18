import { router } from '@inertiajs/react';
import { ArchiveRestore, ArrowDownToLine, Printer, RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatRupiah } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import finances from '@/routes/finances';
import type { Proposal } from '@/types/proposals';
import type { SiteSetting } from '@/types/site-setting';

const R2_PUBLIC_URL = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL;

type DetailSectionProps = {
    proposal: Proposal;
    settings: SiteSetting;
};

export function DetailSection({ proposal, settings }: DetailSectionProps) {
    const [regenerating, setRegenerating] = useState(false);

    const handleRegeneratePdf = () => {
        setRegenerating(true);

        const id = toast.loading('Memproses...', {
            description: 'Proposal sedang di generate ulang.',
        });

        router.post(
            finances.proposals.regeneratePdf(proposal.id),
            {},
            {
                onSuccess: () => {
                    toast.success('Berhasil', {
                        description: 'Proposal berhasil di generate ulang.',
                    });
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat generate ulang proposal, coba lagi.';
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
        if (!proposal.file_path) return;
        window.location.href = finances.proposals.download(proposal.id).url;
    };

    const handleOpen = () => {
        if (!proposal.file_path) return;
        const url = `${R2_PUBLIC_URL}/${proposal.file_path}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handlePrint = () => {
        if (!proposal.file_path) return;
        const url = `${R2_PUBLIC_URL}/${proposal.file_path}`;
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
                {proposal.file_path && (
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

            {/* ───────────────── Proposal Paper ───────────────── */}
            <div className="mx-auto w-full max-w-[794px] rounded-xl bg-white p-14 shadow-lg dark:bg-sidebar print:max-w-full print:rounded-none print:p-0 print:shadow-none">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-border pb-10">
                    <div className="flex items-start gap-4">
                        {settings.company_logo && (
                            <img src={`${R2_PUBLIC_URL}/${settings.company_logo}`} alt={settings.company_name ?? ''} className="h-16 w-auto object-contain" />
                        )}
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">{settings.company_name ?? '-'}</h2>
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
                        <h2 className="text-2xl font-semibold tracking-tight text-foreground">PROPOSAL</h2>
                        <p className="text-lg font-semibold text-muted-foreground">{proposal.proposal_number}</p>
                    </div>
                </div>

                {/* Meta */}
                <div className="mt-10 grid grid-cols-2 gap-8">
                    <div>
                        <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Ditujukan Kepada</p>
                        <p className="text-sm font-semibold text-foreground">{proposal.customer?.name ?? '-'}</p>
                        <div className="text-sm text-muted-foreground">
                            {proposal.customer?.email && <p>{proposal.customer.email}</p>}
                            {proposal.customer?.phone && <p>{proposal.customer.phone}</p>}
                        </div>
                        {proposal.project_name && (
                            <p className="mt-2 text-xs text-muted-foreground">
                                Project: <span className="font-medium text-foreground">{proposal.project_name}</span>
                            </p>
                        )}
                    </div>
                    <div>
                        <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Detail Proposal</p>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Tanggal</span>
                                <span className="font-medium text-foreground">{formatDate(proposal.proposal_date)}</span>
                            </div>
                            {proposal.valid_until && (
                                <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">Berlaku Hingga</span>
                                    <span className="font-medium text-foreground">{formatDate(proposal.valid_until)}</span>
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
                            {proposal.items?.map((item, i) => (
                                <tr key={i}>
                                    <td className="py-3 whitespace-normal text-foreground">{item.description}</td>
                                    <td className="py-3 text-right text-muted-foreground">{item.quantity}</td>
                                    <td className="py-3 text-right text-muted-foreground">{formatRupiah(Number(item.unit_price))}</td>
                                    <td className="py-3 text-right text-muted-foreground">{Number(item.discount_percent) > 0 ? `${item.discount_percent}%` : '-'}</td>
                                    <td className="py-3 text-right text-muted-foreground">{Number(item.tax_percent) > 0 ? `${item.tax_percent}%` : '-'}</td>
                                    <td className="py-3 text-right font-medium text-foreground">{formatRupiah(Number(item.total_amount))}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="mt-6 flex justify-end">
                    <div className="w-72 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="text-foreground">{formatRupiah(Number(proposal.subtotal))}</span>
                        </div>
                        {Number(proposal.discount_amount) > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Diskon ({proposal.discount_percent}%)</span>
                                <span className="text-foreground">-{formatRupiah(Number(proposal.discount_amount))}</span>
                            </div>
                        )}
                        {Number(proposal.tax_amount) > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Pajak ({proposal.tax_percent}%)</span>
                                <span className="text-foreground">{formatRupiah(Number(proposal.tax_amount))}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-t border-zinc-900 pt-2 font-semibold text-zinc-900 dark:border-zinc-100 dark:text-zinc-100">
                            <span>Total</span>
                            <span>{formatRupiah(Number(proposal.total_amount))}</span>
                        </div>
                    </div>
                </div>

                {/* Catatan */}
                {proposal.notes && (
                    <div className="mt-6">
                        <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Catatan</p>
                        <p className="text-sm whitespace-pre-line text-muted-foreground">{proposal.notes}</p>
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
