import { router } from '@inertiajs/react';
import { ChevronDown, ChevronUp, Eye, FileText, Pencil } from 'lucide-react';
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
import { PROPOSAL_STATUSES, PROPOSAL_STATUSES_MAP } from '@/types/proposals';
import type { Proposal, ProposalStatus } from '@/types/proposals';

type ActionsProps = {
    proposal: Proposal;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
};

export default function Actions({ proposal, isExpanded, onToggleExpand }: ActionsProps) {
    const [confirmStatus, setConfirmStatus] = useState<ProposalStatus | null>(null);
    const [loading, setLoading] = useState(false);

    const statusInfo = PROPOSAL_STATUSES_MAP[proposal.status];
    const targetStatus = confirmStatus ? PROPOSAL_STATUSES_MAP[confirmStatus] : null;
    const isAccepted = proposal.status === 'accepted';
    const isFinalized = isAccepted || proposal.status === 'rejected';

    function goToCreateEstimates() {
        router.visit(finances.estimates.create().url, { data: { proposal_id: proposal.id } });
    }

    function handleUpdateStatus() {
        if (!confirmStatus) return;
        setLoading(true);
        const toastId = toast.loading('Memproses...', { description: 'Status proposal sedang diperbarui.' });

        router.patch(
            finances.proposals.updateStatus(proposal.id).url,
            { status: confirmStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Status proposal berhasil diperbarui.' });
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

                <HasPermission permission="view-finance-proposals">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" className="h-8 w-8" onClick={() => router.visit(finances.proposals.show(proposal.id).url)}>
                                <Eye className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Detail Proposal</TooltipContent>
                    </Tooltip>
                </HasPermission>    

                <HasPermission permission="create-finance-estimates">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" className="h-8 w-8" disabled={isFinalized} onClick={goToCreateEstimates}>
                                <FileText className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Buat Estimasi</TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="edit-finance-proposals">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" className="h-8 w-8" disabled={loading || isAccepted} onClick={() => router.visit(finances.proposals.edit(proposal.id).url)}>
                                <Pencil className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Proposal</TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="delete-finance-proposals">
                    <DialogDelete
                        description={`Tindakan ini tidak dapat dibatalkan. Data proposal "${proposal.proposal_number}" akan dihapus secara permanen dari sistem.`}
                        deleteUrl={finances.proposals.destroy(proposal.id).url}
                        tooltipText="Hapus Proposal"
                        isDisabled={loading || isAccepted}
                    />
                </HasPermission>

                <HasPermission permission="edit-finance-proposals">
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
                                {PROPOSAL_STATUSES.map((s) => (
                                    <DropdownMenuItem key={s.value} disabled={s.value === proposal.status} onSelect={() => setConfirmStatus(s.value as ProposalStatus)}>
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
                        <DialogTitle>Ubah Status Proposal</DialogTitle>
                        <DialogDescription asChild>
                            <div className="space-y-1">
                                <p>
                                    Anda akan mengubah status <span className="font-medium text-foreground">"{proposal.proposal_number}"</span> menjadi:
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
