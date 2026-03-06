import { router } from '@inertiajs/react';
import { AlertTriangle, ChevronDown, FileCheck, Pencil, Plus, Wallet } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { formatRupiah } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import type { PaymentStatus, ProjectInvoice, ProjectPayment } from '@/types/project';
import { PAYMENT_METHODS_MAP, PAYMENT_STATUSES, PAYMENT_STATUSES_MAP } from '@/types/project';
import { PaymentAddDrawer } from './payment-add-drawer';
import { PaymentEditDrawer } from './payment-edit-drawer';
import invoices from '@/routes/finances/invoices';

type PaymentCardProps = {
    invoice: ProjectInvoice;
};

export function PaymentCard({ invoice }: PaymentCardProps) {
    const [addingPayment, setAddingPayment] = useState(false);
    const [editingPayment, setEditingPayment] = useState<ProjectPayment | null>(null);
    const [confirmStatus, setConfirmStatus] = useState<PaymentStatus | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<ProjectPayment | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState(false);

    const payments = invoice.payments ?? [];
    const targetStatus = confirmStatus ? PAYMENT_STATUSES_MAP[confirmStatus] : null;

    function handleView(filePath: string) {
        window.open(`/files/${filePath}`, '_blank', 'noopener,noreferrer');
    }

    function handleStatusConfirm() {
        if (!confirmStatus) return;
        const isRejecting = confirmStatus === 'rejected';
        setConfirmStatus(null);
        setLoading(true);

        const toastId = toast.loading('Memproses...', { description: 'Status pembayaran sedang diperbarui.' });

        router.patch(
            invoices.payments.updateStatus({ invoice: invoice.id, payment: selectedPayment!.id }).url,
            {
                status: confirmStatus,
                ...(isRejecting ? { rejection_reason: rejectionReason } : {}),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Status pembayaran berhasil diperbarui.' });
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui status, coba lagi.';
                    toast.error('Gagal', { description: String(msg) });
                },
                onFinish: () => {
                    setLoading(false);
                    setRejectionReason('');
                    setSelectedPayment(null);
                    toast.dismiss(toastId);
                },
            },
        );
    }

    return (
        <>
            <div className="space-y-4">
                {payments.length === 0 ? (
                    <div className="space-y-4 pt-2 pb-4">
                        <p className="text-sm font-medium">Pembayaran</p>

                        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border py-16 text-muted-foreground">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                <Wallet className="size-5 text-primary" />
                            </div>
                            <p className="text-sm">Belum ada pembayaran di invoice ini</p>
                            {invoice.status !== 'paid' && (
                                <HasPermission permission="create-finance-expenses">
                                    <Button type="button" onClick={() => setAddingPayment(true)}>
                                        <Plus className="size-4" />
                                        Tambah Pembayaran Pertama
                                    </Button>
                                </HasPermission>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 pt-2 pb-4">
                        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                            <p className="text-sm font-medium">Pembayaran</p>
                            {invoice.status !== 'paid' && (
                                <HasPermission permission="create-finance-expenses">
                                    <Button type="button" className="min-w-30" onClick={() => setAddingPayment(true)}>
                                        <Plus className="size-4" />
                                        Tambah
                                    </Button>
                                </HasPermission>
                            )}
                        </div>

                        <div className="space-y-4 overflow-hidden">
                            {payments.map((payment, index) => {
                                const status = PAYMENT_STATUSES_MAP[payment.status];
                                const method = payment.payment_method ? PAYMENT_METHODS_MAP[payment.payment_method as keyof typeof PAYMENT_METHODS_MAP] : null;
                                const isVerified = payment.status === 'verified';
                                const isRejected = payment.status === 'rejected';

                                return (
                                    <div key={payment.id} className={`space-y-4 rounded-lg bg-primary/5 p-4 text-sm dark:bg-input/50 ${index !== payments.length - 1 ? '' : ''}`}>
                                        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
                                            <div className="order-2 space-y-2 lg:order-1">
                                                {/* Amount & Status */}
                                                <div className="flex items-center gap-2">
                                                    <p className="text-base font-semibold tabular-nums">{formatRupiah(Number(payment.amount))}</p>
                                                    <Badge className={status.classes}>{status.label}</Badge>
                                                </div>

                                                {/* Meta */}
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                    <span>
                                                        Tgl Bayar: <span className="text-foreground">{formatDate(payment.payment_date)}</span>
                                                    </span>
                                                    {method && (
                                                        <span>
                                                            Metode: <span className="text-foreground">{method.label}</span>
                                                        </span>
                                                    )}
                                                    {payment.reference_number && (
                                                        <span>
                                                            Ref: <span className="text-foreground">{payment.reference_number}</span>
                                                        </span>
                                                    )}
                                                    {isVerified && payment.verified_at && (
                                                        <span>
                                                            Diverifikasi: <span className="text-foreground">{formatDate(payment.verified_at)}</span>
                                                        </span>
                                                    )}
                                                    {payment.verifier && (
                                                        <span>
                                                            Oleh: <span className="text-foreground">{payment.verifier.name}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="order-1 flex shrink-0 flex-wrap items-center gap-1 lg:order-2">
                                                {/* Proof file */}
                                                {payment.proof_file && (
                                                    <HasPermission permission="view-finance-payments">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="secondary"
                                                                    className="h-8 w-8"
                                                                    onClick={() => {
                                                                        if (payment.proof_file) {
                                                                            handleView(payment.proof_file);
                                                                        }
                                                                    }}
                                                                >
                                                                    <FileCheck className="size-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Lihat File</TooltipContent>
                                                        </Tooltip>
                                                    </HasPermission>
                                                )}

                                                {/* Edit */}
                                                <HasPermission permission="edit-finance-payments">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                className="h-8 w-8"
                                                                disabled={loading || isVerified}
                                                                onClick={() => setEditingPayment(payment)}
                                                            >
                                                                <Pencil className="size-3.5" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Edit</TooltipContent>
                                                    </Tooltip>
                                                </HasPermission>

                                                {/* Delete */}
                                                <HasPermission permission="delete-finance-payments">
                                                    <DialogDelete
                                                        description={`Pembayaran sebesar ${formatRupiah(Number(payment.amount))} akan dihapus secara permanen.`}
                                                        deleteUrl={invoices.payments.destroy({ invoice: invoice.id, payment: payment.id }).url}
                                                        tooltipText="Hapus Pembayaran"
                                                        isDisabled={loading || isVerified}
                                                    />
                                                </HasPermission>

                                                {/* Status */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button>
                                                            <Badge className={`${status?.classes} px-3 py-1`}>
                                                                {status?.label}
                                                                {!isVerified && !isRejected && (
                                                                    <HasPermission permission="edit-finance-payments">
                                                                        <ChevronDown className="size-3" />
                                                                    </HasPermission>
                                                                )}
                                                            </Badge>
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    {!isVerified && !isRejected && (
                                                        <HasPermission permission="edit-finance-payments">
                                                            <DropdownMenuContent align="end">
                                                                {PAYMENT_STATUSES.map((s) => (
                                                                    <DropdownMenuItem
                                                                        key={s.value}
                                                                        disabled={s.value === payment.status || isVerified || isRejected}
                                                                        onSelect={() => {
                                                                            setSelectedPayment(payment);
                                                                            setConfirmStatus(s.value);
                                                                        }}
                                                                    >
                                                                        <span className={`mr-2 inline-block h-2 w-2 rounded-full ${s.classes.replace('text-white', '')}`} />
                                                                        {s.label}
                                                                    </DropdownMenuItem>
                                                                ))}
                                                            </DropdownMenuContent>
                                                        </HasPermission>
                                                    )}
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        {/* Rejection reason */}
                                        {payment.status === 'rejected' && payment.rejection_reason && (
                                            <Alert className="border-destructive bg-destructive/10 text-destructive">
                                                <AlertTriangle />
                                                <AlertTitle>Alasan Penolakan:</AlertTitle>
                                                <AlertDescription>{payment.rejection_reason}</AlertDescription>
                                            </Alert>
                                        )}

                                        {/* Notes */}
                                        {payment.notes && (
                                            <div className="space-y-1 text-sm text-foreground">
                                                <p className="text-xs text-muted-foreground">Catatan</p>
                                                <p>{payment.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Drawer */}
            {addingPayment && <PaymentAddDrawer invoice={invoice} open={addingPayment} onOpenChange={setAddingPayment} />}

            {/* Edit Drawer */}
            {editingPayment && (
                <PaymentEditDrawer
                    invoice={invoice}
                    payment={editingPayment}
                    open={!!editingPayment}
                    onOpenChange={(open) => {
                        if (!open) setEditingPayment(null);
                    }}
                />
            )}

            {/* Confirm Status Modal */}
            <Dialog
                open={!!confirmStatus}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmStatus(null);
                        setRejectionReason('');
                        setSelectedPayment(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ubah Status Dokumen</DialogTitle>

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
                                placeholder="Jelaskan alasan dokumen ini ditolak..."
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
