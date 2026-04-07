import { Link, router } from '@inertiajs/react';
import { ChevronDown, ChevronUp, Eye, FileCheck, Pencil } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import finances from '@/routes/finances';
import type { PaymentStatus, ProjectPayment } from '@/types/projects';
import { PAYMENT_STATUSES, PAYMENT_STATUSES_MAP } from '@/types/projects';
import { PaymentEditDrawer } from './payment-edit-drawer';

type ActionsProps = {
    payment: ProjectPayment;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
};

export default function Actions({ payment, isExpanded, onToggleExpand }: ActionsProps) {
    const [editingPayment, setEditingPayment] = useState<ProjectPayment | null>(null);
    const [confirmStatus, setConfirmStatus] = useState<PaymentStatus | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState(false);

    const statusInfo = PAYMENT_STATUSES_MAP[payment.status];
    const targetStatus = confirmStatus ? PAYMENT_STATUSES_MAP[confirmStatus] : null;
    const isVerified = payment.status === 'verified';
    const isRejected = payment.status === 'rejected';

    function handleView(filePath: string) {
        window.open(`/files/${filePath}`, '_blank', 'noopener,noreferrer');
    }

    function handleStatusConfirm() {
        if (!confirmStatus || !payment.invoice) return;
        const isRejecting = confirmStatus === 'rejected';
        setConfirmStatus(null);
        setLoading(true);

        const toastId = toast.loading('Memproses...', { description: 'Status pembayaran sedang diperbarui.' });

        router.patch(
            finances.invoices.payments.updateStatus({ invoice: payment.invoice_id, payment: payment.id }).url,
            {
                status: confirmStatus,
                ...(isRejecting ? { rejection_reason: rejectionReason } : {}),
            },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Berhasil', { description: 'Status pembayaran berhasil diperbarui.' }),
                onError: (errors) => {
                    const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan, coba lagi.';
                    toast.error('Gagal', { description: String(msg) });
                },
                onFinish: () => {
                    setLoading(false);
                    setRejectionReason('');
                    toast.dismiss(toastId);
                },
            },
        );
    }

    return (
        <>
            <div className="flex items-center gap-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="secondary" className="h-8 w-8" onClick={onToggleExpand}>
                            {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isExpanded ? 'Tutup Detail' : 'Lihat Detail'}</TooltipContent>
                </Tooltip>

                <HasPermission permission="view-finance-payments">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="secondary"
                                className="h-8 w-8"
                                disabled={!payment.proof_file}
                                onClick={() => {
                                    if (payment.proof_file) {
                                        handleView(payment.proof_file);
                                    }
                                }}
                            >
                                <FileCheck className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Lihat Bukti Pembayaran</TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="view-finance-payments">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {!isVerified ? (
                                <Button variant="secondary" size="sm" className="h-8 w-8" disabled>
                                    <Eye className="size-3.5" />
                                </Button>
                            ) : (
                                <Button variant="secondary" size="sm" className="h-8 w-8" asChild>
                                    <Link
                                        href={
                                            finances.invoices.payments.show({
                                                invoice: payment.invoice_id,
                                                payment: payment.id,
                                            }).url
                                        }
                                    >
                                        <Eye className="size-3.5" />
                                    </Link>
                                </Button>
                            )}
                        </TooltipTrigger>
                        <TooltipContent>{!isVerified ? 'Pembayaran belum diverifikasi' : 'Lihat Kwitansi'}</TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="edit-finance-payments">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8" disabled={loading || isVerified} onClick={() => setEditingPayment(payment)}>
                                <Pencil className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="delete-finance-payments">
                    <DialogDelete
                        description={`Pembayaran ini akan dihapus secara permanen dari sistem.`}
                        deleteUrl={finances.invoices.payments.destroy({ invoice: payment.invoice_id, payment: payment.id }).url}
                        tooltipText="Hapus Pembayaran"
                        isDisabled={loading || isVerified}
                    />
                </HasPermission>

                <HasPermission permission="edit-finance-payments">
                    {!isVerified && !isRejected && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button>
                                    <Badge className={`${statusInfo?.classes} px-3 py-1`}>
                                        {statusInfo?.label}
                                        <ChevronDown className="size-3" />
                                    </Badge>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {PAYMENT_STATUSES.map((s) => (
                                    <DropdownMenuItem key={s.value} disabled={s.value === payment.status} onSelect={() => setConfirmStatus(s.value as PaymentStatus)}>
                                        <span className={`mr-2 inline-block h-2 w-2 rounded-full ${s.classes}`} />
                                        {s.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </HasPermission>

                {(isVerified || isRejected) && <Badge className={`${statusInfo?.classes} px-3 py-1`}>{statusInfo?.label}</Badge>}
            </div>

            {editingPayment && (
                <PaymentEditDrawer
                    invoice={payment.invoice!}
                    payment={editingPayment}
                    open={!!editingPayment}
                    onOpenChange={(open) => {
                        if (!open) setEditingPayment(null);
                    }}
                />
            )}

            {/* ───────────────── Confirm Status Modal ───────────────── */}
            <Dialog
                open={!!confirmStatus}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmStatus(null);
                        setRejectionReason('');
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ubah Status Pembayaran</DialogTitle>
                        <DialogDescription asChild>
                            <div className="space-y-1">
                                <p>Anda akan mengubah status pembayaran menjadi:</p>
                                <Badge className={targetStatus?.classes ?? 'bg-muted text-muted-foreground'}>{targetStatus?.label}</Badge>
                            </div>
                        </DialogDescription>
                    </DialogHeader>

                    {confirmStatus === 'rejected' && (
                        <div className="space-y-2">
                            <Label htmlFor="rejection_reason" className="text-sm font-medium">
                                Alasan Penolakan <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="rejection_reason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Jelaskan alasan pembayaran ini ditolak..."
                                className="min-h-24 resize-none"
                                rows={3}
                            />
                            <p className="text-xs text-muted-foreground">Alasan ini akan ditampilkan kepada pembuat pembayaran.</p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setConfirmStatus(null);
                                setRejectionReason('');
                            }}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleStatusConfirm}
                            disabled={confirmStatus === 'rejected' && !rejectionReason.trim()}
                            variant={confirmStatus === 'rejected' ? 'destructive' : 'default'}
                        >
                            Ya, Ubah Status
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
