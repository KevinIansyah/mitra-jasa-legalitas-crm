import { Link, router } from '@inertiajs/react';
import { AlertTriangle, Briefcase, ClipboardList, FileText, GitBranch, Pencil, User } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { formatRupiah } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import type { Estimate, EstimateStatus, Quote, QuoteStatus } from '@/types/quote';
import { QUOTE_STATUSES, QUOTE_STATUSES_MAP, QUOTE_TIMELINES_MAP, QUOTE_SOURCES_MAP, QUOTE_BUDGET_RANGES_MAP, ESTIMATE_STATUSES, ESTIMATE_STATUSES_MAP } from '@/types/quote';
import finances from '@/routes/finances';

function InfoRow({ label, value, children }: { label: string; value?: string | null; children?: React.ReactNode }) {
    return (
        <>
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-sm">{children ?? value ?? '-'}</span>
        </>
    );
}

export function DetailSection({ quote }: { quote: Quote }) {
    const [confirmStatus, setConfirmStatus] = useState<QuoteStatus | null>(null);
    const [estimateConfirmStatus, setEstimateConfirmStatus] = useState<{ estimate: Estimate; status: EstimateStatus } | null>(null);
    const [rejectedReason, setRejectedReason] = useState('');
    const [estimateRejectedReason, setEstimateRejectedReason] = useState('');
    const [loading, setLoading] = useState(false);

    const statusInfo = QUOTE_STATUSES_MAP[quote.status];
    const timelineInfo = QUOTE_TIMELINES_MAP[quote.timeline];
    const sourceInfo = QUOTE_SOURCES_MAP[quote.source];
    const budgetInfo = quote.budget_range ? QUOTE_BUDGET_RANGES_MAP[quote.budget_range] : null;
    const targetStatus = confirmStatus ? QUOTE_STATUSES_MAP[confirmStatus] : null;
    const isFinalized = quote.status === 'rejected' || quote.status === 'converted';
    const estimates = quote.estimates ?? [];

    function goToCreateEstimates() {
        router.visit(finances.estimates.create().url, { data: { quote_id: quote.id } });
    }

    function goToEditEstimate(estimateId: number) {
        router.visit(finances.estimates.edit(estimateId).url, { data: { quote_id: quote.id, from_quote: true } });
    }

    function handleUpdateStatus() {
        if (!confirmStatus) return;
        setLoading(true);
        const toastId = toast.loading('Memproses...', { description: 'Status permintaan penawaran sedang diperbarui.' });

        router.patch(
            finances.quotes.updateStatus(quote.id).url,
            {
                status: confirmStatus,
                ...(confirmStatus === 'rejected' ? { rejected_reason: rejectedReason } : {}),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Status permintaan penawaran berhasil diperbarui.' });
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui status, coba lagi.';
                    toast.error('Gagal', { description: String(msg) });
                },
                onFinish: () => {
                    setLoading(false);
                    toast.dismiss(toastId);
                    setConfirmStatus(null);
                    setRejectedReason('');
                },
            },
        );
    }

    function handleUpdateEstimateStatus() {
        if (!estimateConfirmStatus) return;
        setLoading(true);
        const toastId = toast.loading('Memproses...', { description: 'Status estimasi sedang diperbarui.' });

        router.patch(
            finances.estimates.updateStatus(estimateConfirmStatus.estimate.id).url,
            {
                status: estimateConfirmStatus.status,
                ...(estimateConfirmStatus.status === 'rejected' ? { rejected_reason: estimateRejectedReason } : {}),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Status estimasi berhasil diperbarui.' });
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui status, coba lagi.';
                    toast.error('Gagal', { description: String(msg) });
                },
                onFinish: () => {
                    setLoading(false);
                    toast.dismiss(toastId);
                    setEstimateConfirmStatus(null);
                    setEstimateRejectedReason('');
                },
            },
        );
    }

    function handleRevise(estimateId: number) {
        setLoading(true);
        const toastId = toast.loading('Memproses...', { description: 'Membuat revisi estimate.' });

        router.post(
            finances.estimates.revise(estimateId).url,
            {
                quote_id: quote.id,
                from_quote: true,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Revisi estimate berhasil dibuat.' });
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat membuat revisi, coba lagi.';
                    toast.error('Gagal', { description: String(msg) });
                },
                onFinish: () => {
                    setLoading(false);
                    toast.dismiss(toastId);
                },
            },
        );
    }

    return (
        <div className="space-y-4">
            {/* Header Card — Status & Actions */}
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-6">
                    <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
                        <div>
                            <h2 className="text-xl font-bold">Ringkasan Permintaan</h2>
                            <p className="mt-0.5 text-sm text-muted-foreground">Informasi umum permintaan mencakup status, deskripsi, layanan, pemohon, project, dan estimasi</p>
                        </div>

                        <div className="flex gap-1">
                            <HasPermission permission="create-finance-estimates">
                                {!isFinalized && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="secondary" className="h-8 w-8" onClick={goToCreateEstimates}>
                                                <FileText className="size-3.5" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Buat Estimasi</TooltipContent>
                                    </Tooltip>
                                )}
                            </HasPermission>

                            <HasPermission permission="create-projects">
                                {quote.is_convertible && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button className="h-8 w-8" asChild>
                                                <Link href={finances.quotes.convert(quote.id).url}>
                                                    <Briefcase className="size-3.5" />
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Convert ke Project</TooltipContent>
                                    </Tooltip>
                                )}
                            </HasPermission>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <Field className="w-fit">
                                <FieldLabel>Status</FieldLabel>
                                <HasPermission permission="edit-finance-quotes">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button>
                                                <Badge className={`${statusInfo?.classes} px-3 py-1`}>
                                                    {statusInfo?.label}
                                                    {!isFinalized && <ChevronDown className="size-3" />}
                                                </Badge>
                                            </button>
                                        </DropdownMenuTrigger>
                                        {!isFinalized && (
                                            <DropdownMenuContent align="end">
                                                {QUOTE_STATUSES.filter((s) => s.value !== 'converted').map((s) => (
                                                    <DropdownMenuItem key={s.value} disabled={s.value === quote.status} onSelect={() => setConfirmStatus(s.value as QuoteStatus)}>
                                                        <span className={`mr-2 inline-block h-2 w-2 rounded-full ${s.classes}`} />
                                                        {s.label}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        )}
                                    </DropdownMenu>
                                </HasPermission>
                            </Field>

                            <Field className="w-fit">
                                <FieldLabel>Timeline</FieldLabel>
                                <Badge className={`${timelineInfo?.classes} px-3 py-1`}>{timelineInfo?.label}</Badge>
                            </Field>
                            <Field className="w-fit">
                                <FieldLabel>Sumber</FieldLabel>
                                <Badge variant="secondary" className="px-3 py-1">
                                    {sourceInfo?.label}
                                </Badge>
                            </Field>
                            {budgetInfo && (
                                <Field className="w-fit">
                                    <FieldLabel>Budget Range</FieldLabel>
                                    <Badge variant="secondary" className="px-3 py-1">
                                        {budgetInfo.label}
                                    </Badge>
                                </Field>
                            )}
                        </div>

                        <Field className="gap-2">
                            <FieldLabel>Nama Project</FieldLabel>
                            <FieldDescription className="text-sm text-muted-foreground">{quote.project_name}</FieldDescription>
                        </Field>

                        {quote.description && (
                            <Field className="gap-2">
                                <FieldLabel>Deskripsi</FieldLabel>
                                <FieldDescription className="text-sm text-muted-foreground">{quote.description}</FieldDescription>
                            </Field>
                        )}

                        {quote.status === 'rejected' && quote.rejected_reason && (
                            <Alert className="border-destructive bg-destructive/10 text-destructive">
                                <AlertTriangle />
                                <AlertTitle>Alasan Penolakan</AlertTitle>
                                <AlertDescription>{quote.rejected_reason}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>
            </div>

            {/* Pemohon & Customer */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="w-full space-y-3 rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <User className="size-5 text-primary" />
                    </div>
                    <FieldLabel>Pemohon</FieldLabel>
                    <div className="grid grid-cols-[130px_1fr] gap-x-2 gap-y-2">
                        <InfoRow label="Nama" value={quote.user?.name} />
                        <InfoRow label="Email" value={quote.user?.email} />
                        <InfoRow label="Waktu Request" value={formatDate(quote.created_at)} />
                        <InfoRow label="Waktu Dihubungi" value={quote.contacted_at ? formatDate(quote.contacted_at) : '-'} />
                        {quote.converted_at && <InfoRow label="Waktu Dikonversi" value={formatDate(quote.converted_at)} />}
                    </div>
                </div>

                <div className="min-40 w-full space-y-3 rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <User className="size-5 text-primary" />
                    </div>
                    <FieldLabel>Customer Terhubung</FieldLabel>
                    {quote.customer ? (
                        <div className="grid grid-cols-[130px_1fr] gap-x-2 gap-y-2">
                            <InfoRow label="Nama" value={quote.customer.name} />
                            <InfoRow label="Email" value={quote.customer.email} />
                            <InfoRow label="Telepon" value={quote.customer.phone} />
                        </div>
                    ) : (
                        <FieldDescription>Belum ada customer terhubung</FieldDescription>
                    )}
                </div>
            </div>

            {/* Layanan & Project */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="min-h-40 w-full space-y-3 rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Briefcase className="size-5 text-primary" />
                    </div>
                    <FieldLabel>Layanan & Bisnis</FieldLabel>
                    {quote.service ? (
                        <div className="grid grid-cols-[130px_1fr] gap-x-2 gap-y-2">
                            <InfoRow label="Layanan" value={quote.service.name} />
                            <InfoRow label="Paket" value={quote.service_package?.name} />
                            <InfoRow label="Tipe Bisnis" value={quote.business_type} />
                            <InfoRow label="Status Legal" value={quote.business_legal_status} />
                            <InfoRow label="Budget Range" value={budgetInfo?.label} />
                        </div>
                    ) : (
                        <FieldDescription>Tidak ada layanan yang dipilih</FieldDescription>
                    )}
                </div>

                <div className="min-h-40 w-full space-y-3 rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <ClipboardList className="size-5 text-primary" />
                    </div>
                    <FieldLabel>Project Terkait</FieldLabel>
                    {quote.project ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-[130px_1fr] gap-x-2 gap-y-2">
                                <InfoRow label="Nama Project" value={quote.project.name} />
                                <InfoRow label="Status">
                                    <Badge variant="secondary">{quote.project.status}</Badge>
                                </InfoRow>
                                <InfoRow label="Dikonversi" value={quote.converted_at ? formatDate(quote.converted_at) : '-'} />
                            </div>
                        </div>
                    ) : (
                        <FieldDescription>Belum ada project terhubung</FieldDescription>
                    )}
                </div>
            </div>

            {/* Estimates */}
            <div className="w-full space-y-4 rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Estimasi Biaya</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            {estimates.length > 0 ? `${estimates.length} versi estimate tersedia` : 'Belum ada estimate untuk quote ini'}
                        </p>
                    </div>
                </div>

                {estimates.length > 0 && (
                    <div className="space-y-2">
                        {estimates.map((estimate) => {
                            const estimateIsAccepted = estimate.status === 'accepted';
                            const estimateIsFinalized = estimate.status === 'accepted' || estimate.status === 'rejected';
                            const estimateStatusInfo = ESTIMATE_STATUSES_MAP[estimate.status];

                            return (
                                <div key={estimate.id} className="space-y-4 rounded-lg bg-primary/10 p-4 dark:bg-muted/40">
                                    <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                                        <div className="space-y-2 order-2 md:oreder-1">
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm font-medium">{estimate.estimate_number}</span>
                                                <Badge className="bg-blue-600 text-white">{estimate.version_label}</Badge>
                                                {estimate.is_active && <Badge className="bg-emerald-500 text-white">Active</Badge>}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                                {estimate.valid_until && (
                                                    <span>
                                                        Berlaku s/d: <span className="font-medium text-foreground">{formatDate(estimate.valid_until)}</span>
                                                    </span>
                                                )}
                                                <span>
                                                    Dibuat: <span className="font-medium text-foreground">{formatDate(estimate.created_at)}</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 order-1 md:order-2">
                                            <HasPermission permission="edit-finance-estimates">
                                                {!estimateIsAccepted && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="secondary" className="h-8 w-8" disabled={loading} onClick={() => handleRevise(estimate.id)}>
                                                                <GitBranch className="size-3.5" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Buat Revisi</TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </HasPermission>

                                            <HasPermission permission="edit-finance-estimates">
                                                {!estimateIsAccepted && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="secondary" className="h-8 w-8" disabled={loading} onClick={() => goToEditEstimate(estimate.id)}>
                                                                <Pencil className="size-3.5" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Edit Estimate</TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </HasPermission>

                                            <HasPermission permission="delete-finance-estimates">
                                                <DialogDelete
                                                    description={`Tindakan ini tidak dapat dibatalkan. Data estimate "${estimate.estimate_number}" akan dihapus secara permanen dari sistem.`}
                                                    deleteUrl={finances.estimates.destroy(estimate.id).url}
                                                    tooltipText="Hapus Estimate"
                                                    isDisabled={loading || estimateIsAccepted}
                                                />
                                            </HasPermission>

                                            <HasPermission permission="edit-finance-estimates">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button>
                                                            <Badge className={`${estimateStatusInfo?.classes} px-3 py-1`}>
                                                                {estimateStatusInfo?.label}
                                                                {!estimateIsFinalized && <ChevronDown className="size-3" />}
                                                            </Badge>
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    {!estimateIsFinalized && (
                                                        <DropdownMenuContent align="end">
                                                            {ESTIMATE_STATUSES.map((s) => (
                                                                <DropdownMenuItem
                                                                    key={s.value}
                                                                    disabled={s.value === estimate.status}
                                                                    onSelect={() => setEstimateConfirmStatus({ estimate, status: s.value as EstimateStatus })}
                                                                >
                                                                    <span className={`mr-2 inline-block h-2 w-2 rounded-full ${s.classes}`} />
                                                                    {s.label}
                                                                </DropdownMenuItem>
                                                            ))}
                                                        </DropdownMenuContent>
                                                    )}
                                                </DropdownMenu>
                                            </HasPermission>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Rincian Item</p>

                                        {estimate.items && estimate.items.length > 0 && (
                                            <div>
                                                {estimate.items.map((item, i) => (
                                                    <div key={i} className="mb-0 flex items-start justify-between gap-4 border-t p-3 text-sm">
                                                        <div className="space-y-0.5">
                                                            <p>{item.description}</p>

                                                            <p className="text-xs text-muted-foreground">
                                                                {item.quantity} × {formatRupiah(Number(item.unit_price))}
                                                                {Number(item.discount_percent) > 0 && (
                                                                    <span className="ml-2 text-destructive">diskon {item.discount_percent}%</span>
                                                                )}
                                                                {Number(item.tax_percent) > 0 && <span className="ml-2">pajak {item.tax_percent}%</span>}
                                                            </p>
                                                        </div>

                                                        <p className="shrink-0 font-semibold tabular-nums">{formatRupiah(Number(item.total_amount))}</p>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between border-t border-b p-3 text-sm font-semibold">
                                                    <span>Total</span>
                                                    <span className="tabular-nums">{formatRupiah(Number(estimate.total_amount))}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {estimate.status === 'rejected' && estimate.rejected_reason && (
                                        <Alert className="border-destructive bg-destructive/10 text-destructive">
                                            <AlertTriangle />
                                            <AlertTitle>Alasan Penolakan</AlertTitle>
                                            <AlertDescription>{estimate.rejected_reason}</AlertDescription>
                                        </Alert>
                                    )}

                                    {estimate.notes && (
                                        <div className="space-y-1 text-sm text-foreground">
                                            <p className="text-xs text-muted-foreground">Catatan</p>
                                            <p>{estimate.notes}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Dialog: Edit Status */}
            <Dialog
                open={!!confirmStatus}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmStatus(null);
                        setRejectedReason('');
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ubah Status Quote</DialogTitle>
                        <DialogDescription asChild>
                            <div className="space-y-1">
                                <p>
                                    Anda akan mengubah status <span className="font-medium text-foreground">"{quote.reference_number}"</span> menjadi:
                                </p>
                                <Badge className={targetStatus?.classes ?? 'bg-muted text-muted-foreground'}>{targetStatus?.label}</Badge>
                            </div>
                        </DialogDescription>
                    </DialogHeader>

                    {confirmStatus === 'rejected' && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                Alasan Penolakan <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                placeholder="Jelaskan alasan penolakan..."
                                className="min-h-24 resize-none"
                                value={rejectedReason}
                                onChange={(e) => setRejectedReason(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Alasan ini akan disimpan sebagai catatan penolakan.</p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setConfirmStatus(null);
                                setRejectedReason('');
                            }}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleUpdateStatus}
                            disabled={loading || (confirmStatus === 'rejected' && !rejectedReason.trim())}
                            variant={confirmStatus === 'rejected' ? 'destructive' : 'default'}
                        >
                            Ya, Ubah Status
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: Edit Status Estimate */}
            <Dialog
                open={!!estimateConfirmStatus}
                onOpenChange={(open) => {
                    if (!open) {
                        setEstimateConfirmStatus(null);
                        setEstimateRejectedReason('');
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ubah Status Estimate</DialogTitle>
                        <DialogDescription asChild>
                            <div className="space-y-1">
                                <p>
                                    Anda akan mengubah status <span className="font-medium text-foreground">"{estimateConfirmStatus?.estimate.estimate_number}"</span> menjadi:
                                </p>
                                <Badge className={ESTIMATE_STATUSES_MAP[estimateConfirmStatus?.status ?? 'draft']?.classes}>
                                    {ESTIMATE_STATUSES_MAP[estimateConfirmStatus?.status ?? 'draft']?.label}
                                </Badge>
                            </div>
                        </DialogDescription>
                    </DialogHeader>

                    {estimateConfirmStatus?.status === 'rejected' && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                Alasan Penolakan <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                placeholder="Jelaskan alasan penolakan estimate..."
                                className="min-h-24 resize-none"
                                value={estimateRejectedReason}
                                onChange={(e) => setEstimateRejectedReason(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Alasan ini akan disimpan sebagai catatan penolakan.</p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setEstimateConfirmStatus(null);
                                setEstimateRejectedReason('');
                            }}
                        >
                            Batal
                        </Button>
                        <Button
                            disabled={loading || (estimateConfirmStatus?.status === 'rejected' && !estimateRejectedReason.trim())}
                            variant={estimateConfirmStatus?.status === 'rejected' ? 'destructive' : 'default'}
                            onClick={handleUpdateEstimateStatus}
                        >
                            Ya, Ubah Status
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
