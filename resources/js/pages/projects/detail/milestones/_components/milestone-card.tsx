import { router } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Pencil } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { formatDate } from '@/lib/utils';
import projects from '@/routes/projects';
import { MILESTONE_ICONS, MILESTONE_STATUSES, MILESTONE_STATUSES_MAP, UNDELETABLE_MILESTONE_STATUSES } from '@/types/project';
import type { MilestoneStatus, ProjectMilestone } from '@/types/project';
import { MilestoneForm } from './milestone-form';

type MilestoneCardProps = {
    milestone: ProjectMilestone;
    index: number;
    projectId: number;
    isFirst: boolean;
    isLast: boolean;
    onReorderUp: () => void;
    onReorderDown: () => void;
};

export function MilestoneCard({ milestone, index, projectId, isFirst, isLast, onReorderUp, onReorderDown }: MilestoneCardProps) {
    const [mode, setMode] = useState<'view' | 'edit'>('view');
    const [confirmStatus, setConfirmStatus] = useState<MilestoneStatus | null>(null);
    const [loading, setLoading] = useState(false);

    const status = MILESTONE_STATUSES_MAP[milestone.status];
    const icon = MILESTONE_ICONS[milestone.status];
    const isCompleted = milestone.status === 'completed';
    const isBlocked = milestone.status === 'blocked' || milestone.status === 'cancelled';
    const isInProgress = milestone.status === 'in_progress';
    const canDelete = !UNDELETABLE_MILESTONE_STATUSES.includes(milestone.status);
    const targetStatus = confirmStatus ? MILESTONE_STATUSES_MAP[confirmStatus] : null;

    function handleStatusConfirm() {
        if (!confirmStatus) return;
        setConfirmStatus(null);
        setLoading(true);

        const toastId = toast.loading('Memproses...', { description: 'Status milestone sedang diperbarui.' });

        router.patch(
            projects.milestones.updateStatus({ project: projectId, milestone: milestone.id }).url,
            { status: confirmStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Status milestone berhasil diperbarui.' });
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui status, coba lagi.';
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
            <div className="flex gap-4">
                <div className="flex flex-col items-center">
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            isCompleted ? 'bg-emerald-500/10' : isBlocked ? 'bg-red-500/10' : isInProgress ? 'bg-yellow-500/10' : 'bg-secondary/10'
                        }`}
                    >
                        {icon}
                    </div>
                    {!isLast && <div className="w-px flex-1 bg-border" />}
                </div>

                {/* Content */}
                <div className="mb-4 flex-1">
                    {mode === 'edit' ? (
                        <MilestoneForm
                            initial={{
                                project_id: projectId,
                                title: milestone.title,
                                description: milestone.description ?? '',
                                estimated_duration_days: milestone.estimated_duration_days,
                                start_date: milestone.start_date,
                                planned_end_date: milestone.planned_end_date,
                            }}
                            submitUrl={projects.milestones.update({ project: projectId, milestone: milestone.id }).url}
                            method="put"
                            onSuccess={() => setMode('view')}
                            onCancel={() => setMode('view')}
                        />
                    ) : (
                        <div className="space-y-4 rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                            {/* Header */}
                            <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
                                <div className="order-2 space-y-2 lg:order-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-muted-foreground">#{index + 1}</span>
                                        <h3 className="font-semibold">{milestone.title}</h3>
                                    </div>
                                </div>

                                <div className="order-1 flex shrink-0 flex-wrap items-center gap-1 lg:order-2">
                                    <HasPermission permission="edit-project-milestones">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="secondary" className="h-8 w-8" disabled={isFirst || loading} onClick={onReorderUp}>
                                                    <ArrowUp className="size-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Naikkan Urutan</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="secondary" className="h-8 w-8" disabled={isLast || loading} onClick={onReorderDown}>
                                                    <ArrowDown className="size-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Turunkan Urutan</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="secondary" className="h-8 w-8" disabled={loading} onClick={() => setMode('edit')}>
                                                    <Pencil className="size-3.5" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit Milestone</TooltipContent>
                                        </Tooltip>
                                    </HasPermission>

                                    <HasPermission permission="delete-project-milestones">
                                        <DialogDelete
                                            description={`Tindakan ini tidak dapat dibatalkan. Data milestone "${milestone.title}" akan dihapus secara permanen dari sistem.`}
                                            deleteUrl={projects.milestones.destroy({ project: projectId, milestone: milestone.id }).url}
                                            tooltipText="Hapus Milestone"
                                            isDisabled={loading || !canDelete}
                                        />
                                    </HasPermission>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button>
                                                <Badge className={`${status?.classes} px-3 py-1`}>
                                                    {status?.label}
                                                    <HasPermission permission="edit-project-milestones">
                                                        <ChevronDown className="size-3" />
                                                    </HasPermission>
                                                </Badge>
                                            </button>
                                        </DropdownMenuTrigger>
                                        <HasPermission permission="edit-project-milestones">
                                            <DropdownMenuContent align="end">
                                                {MILESTONE_STATUSES.map((s) => (
                                                    <DropdownMenuItem
                                                        key={s.value}
                                                        disabled={s.value === milestone.status}
                                                        onSelect={() => setConfirmStatus(s.value as MilestoneStatus)}
                                                    >
                                                        <span className={`mr-2 inline-block h-2 w-2 rounded-full ${s.classes.replace('text-white', '')}`} />
                                                        {s.label}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </HasPermission>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {milestone.description && <p className="text-sm text-muted-foreground">{milestone.description}</p>}

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Tanggal Mulai</p>
                                    <p>{formatDate(milestone.start_date)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Rencana Selesai</p>
                                    <p>{formatDate(milestone.planned_end_date)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Mulai Aktual</p>
                                    <p>{milestone.actual_start_date ? formatDate(milestone.actual_start_date) : '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Selesai Aktual</p>
                                    <p>{milestone.actual_end_date ? formatDate(milestone.actual_end_date) : '-'}</p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Estimasi:</span>
                                    <span>{milestone.estimated_duration_days} hari</span>

                                    {milestone.days_variance !== null && milestone.days_variance !== undefined && (
                                        <Badge
                                            className={
                                                milestone.days_variance > 0
                                                    ? 'bg-red-500 text-white'
                                                    : milestone.days_variance < 0
                                                      ? 'bg-emerald-500 text-white'
                                                      : 'bg-blue-600 text-white'
                                            }
                                        >
                                            {milestone.days_variance > 0
                                                ? `+${milestone.days_variance} hari terlambat`
                                                : milestone.days_variance < 0
                                                  ? `${Math.abs(milestone.days_variance)} hari lebih cepat`
                                                  : 'Tepat waktu'}
                                        </Badge>
                                    )}
                                </div>

                                {milestone.tasks_count !== undefined && (
                                    <span className="ml-auto flex items-center gap-1 text-sm">
                                        {milestone.tasks_count} <span className="text-muted-foreground">tugas</span>
                                        <ChevronRight className="size-3.5" />
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Status Modal */}
            <Dialog open={!!confirmStatus} onOpenChange={() => setConfirmStatus(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ubah Status Milestone</DialogTitle>
                        <DialogDescription asChild>
                            <div className="space-y-1">
                                <p>
                                    Anda akan mengubah status <span className="font-medium text-foreground">"{milestone.title}"</span> menjadi:
                                </p>
                                <Badge className={targetStatus?.classes ?? 'bg-muted text-muted-foreground'}>{targetStatus?.label}</Badge>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setConfirmStatus(null)}>
                            Batal
                        </Button>
                        <Button onClick={handleStatusConfirm}>Ya, Ubah Status</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
