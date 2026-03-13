import { router } from '@inertiajs/react';
import { ChevronDown, ChevronUp, GitBranch, Pencil } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import finances from '@/routes/finances';
import type { Estimate, EstimateStatus } from '@/types/quote';
import { ESTIMATE_STATUSES, ESTIMATE_STATUSES_MAP } from '@/types/quote';

type ActionsProps = {
    estimate: Estimate;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
};

export default function Actions({ estimate, isExpanded, onToggleExpand }: ActionsProps) {
    const [confirmStatus, setConfirmStatus] = useState<EstimateStatus | null>(null);
    const [loading, setLoading] = useState(false);

    const statusInfo = ESTIMATE_STATUSES_MAP[estimate.status];
    const targetStatus = confirmStatus ? ESTIMATE_STATUSES_MAP[confirmStatus] : null;
    const isAccepted = estimate.status === 'accepted';
    const isFinalized = isAccepted || estimate.status === 'rejected';

    function handleUpdateStatus() {
        if (!confirmStatus) return;
        setLoading(true);
        const toastId = toast.loading('Memproses...', { description: 'Status estimate sedang diperbarui.' });

        router.patch(
            finances.estimates.updateStatus(estimate.id).url,
            { status: confirmStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Status estimate berhasil diperbarui.' });
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui status, coba lagi.';
                    toast.error('Gagal', { description: String(msg) });
                },
                onFinish: () => {
                    setLoading(false);
                    toast.dismiss(toastId);
                    setConfirmStatus(null);
                },
            },
        );
    }

    function handleRevise() {
        setLoading(true);
        const toastId = toast.loading('Memproses...', { description: 'Membuat revisi estimate.' });

        router.post(
            finances.estimates.revise(estimate.id).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Berhasil', { description: 'Revisi estimate berhasil dibuat.' }),
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

                <HasPermission permission="edit-finance-estimates">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="secondary"
                                className="h-8 w-8"
                                disabled={loading || isAccepted}
                                onClick={() => {
                                    router.visit(finances.estimates.edit(estimate.id).url);
                                }}
                            >
                                <Pencil className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Estimate</TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="edit-finance-estimates">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" className="h-8 w-8" disabled={loading || isAccepted} onClick={handleRevise}>
                                <GitBranch className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Buat Revisi</TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="delete-finance-estimates">
                    <DialogDelete
                        description={`Tindakan ini tidak dapat dibatalkan. Data estimate "${estimate.estimate_number}" akan dihapus secara permanen dari sistem.`}
                        deleteUrl={finances.estimates.destroy(estimate.id).url}
                        tooltipText="Hapus Estimate"
                        isDisabled={loading || isAccepted}
                    />
                </HasPermission>

                <HasPermission permission="edit-finance-estimates">
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
                                {ESTIMATE_STATUSES.map((s) => (
                                    <DropdownMenuItem key={s.value} disabled={s.value === estimate.status} onSelect={() => setConfirmStatus(s.value as EstimateStatus)}>
                                        <span className={`mr-2 inline-block h-2 w-2 rounded-full ${s.classes}`} />
                                        {s.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        )}
                    </DropdownMenu>
                </HasPermission>
            </div>

            <Dialog
                open={!!confirmStatus}
                onOpenChange={(open) => {
                    if (!open) setConfirmStatus(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ubah Status Estimate</DialogTitle>
                        <DialogDescription asChild>
                            <div className="space-y-1">
                                <p>
                                    Anda akan mengubah status <span className="font-medium text-foreground">"{estimate.estimate_number}"</span> menjadi:
                                </p>
                                <Badge className={targetStatus?.classes ?? 'bg-muted text-muted-foreground'}>{targetStatus?.label}</Badge>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setConfirmStatus(null)}>
                            Batal
                        </Button>
                        <Button disabled={loading} onClick={handleUpdateStatus}>
                            Ya, Ubah Status
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
