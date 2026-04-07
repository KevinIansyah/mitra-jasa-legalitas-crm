import { router } from '@inertiajs/react';
import { AlertCircle, Calendar, ChevronDown, Pencil, Tag } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { getInitials } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import type { TaskPriority } from '@/types/projects';
import { TASK_PRIORITIES, TASK_PRIORITIES_MAP, TASK_STATUSES, TASK_STATUSES_MAP, type ProjectTask, type TaskStatus } from '@/types/projects';
import { TaskForm, type TaskFormData } from './task-form';
import projects from '@/routes/projects';

type MemberOption = { id: number; name: string };
type MilestoneOption = { id: number; title: string };

type TaskCardProps = {
    task: ProjectTask;
    projectId: number;
    members: MemberOption[];
    milestones: MilestoneOption[];
};

export function TaskCard({ task, projectId, members, milestones }: TaskCardProps) {
    const R2_PUBLIC_URL = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL;
    const [mode, setMode] = useState<'view' | 'edit'>('view');
    const [loading, setLoading] = useState(false);

    const [editData, setEditData] = useState<TaskFormData>({
        title: task.title,
        description: task.description ?? '',
        priority: task.priority,
        status: task.status,
        due_date: task.due_date ?? '',
        assigned_to: task.assigned_to ? String(task.assigned_to) : '',
        project_milestone_id: task.project_milestone_id ? String(task.project_milestone_id) : '',
    });
    const set = (val: Partial<TaskFormData>) => setEditData((prev) => ({ ...prev, ...val }));

    const statusInfo = TASK_STATUSES_MAP[task.status];
    const priorityInfo = TASK_PRIORITIES_MAP[task.priority];
    const isCompleted = task.status === 'completed';
    const isCancelled = task.status === 'cancelled';
    const isDone = isCompleted || isCancelled;
    const isOverdue = task.due_date && !isDone && new Date(task.due_date) < new Date();

    function handleStatusChange(status: TaskStatus) {
        setLoading(true);
        const toastId = toast.loading('Memproses...', { description: 'Status tugas sedang diperbarui.' });

        router.patch(
            projects.tasks.updateStatus({ project: projectId, task: task.id }).url,
            { status },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Status berhasil diperbarui.' });
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

    function handlePriorityChange(priority: TaskPriority) {
        setLoading(true);
        const toastId = toast.loading('Memproses...', { description: 'Prioritas tugas sedang diperbarui.' });

        router.patch(
            projects.tasks.updatePriority({ project: projectId, task: task.id }).url,
            { priority },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Prioritas berhasil diperbarui.' });
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui prioritas, coba lagi.';
                    toast.error('Gagal', { description: String(msg) });
                },
                onFinish: () => {
                    setLoading(false);
                    toast.dismiss(toastId);
                },
            },
        );
    }

    function handleEditSubmit() {
        if (!editData.title.trim()) return;
        setLoading(true);
        const toastId = toast.loading('Memproses...', { description: 'Tugas sedang diperbarui.' });

        router.put(
            projects.tasks.update({ project: projectId, task: task.id }).url,
            {
                ...editData,
                assigned_to: editData.assigned_to || null,
                project_milestone_id: editData.project_milestone_id || null,
                due_date: editData.due_date || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Tugas berhasil diperbarui.' });
                    setMode('view');
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui tugas, coba lagi.';
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
            <div className={`rounded-xl bg-sidebar shadow dark:shadow-none ${isDone ? 'opacity-60' : ''}`}>
                {mode === 'edit' ? (
                    <div className="p-4 md:p-6">
                        <TaskForm
                            data={editData}
                            processing={loading}
                            members={members}
                            milestones={milestones}
                            onChange={set}
                            onSubmit={handleEditSubmit}
                            onCancel={() => setMode('view')}
                        />
                    </div>
                ) : (
                    <div className="space-y-4 p-4 md:p-6">
                        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-start">
                            {/* Left - title + meta */}
                            <div className="flex-1 space-y-2">
                                <p className={`leading-snug font-semibold ${isDone ? 'text-muted-foreground line-through' : ''}`}>{task.title}</p>

                                {/* Badges row */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Priority badge */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button>
                                                <Badge className={`px-3 py-1 ${priorityInfo.classes}`}>
                                                    {priorityInfo.label}
                                                    {!isDone && (
                                                        <HasPermission permission="edit-project-tasks">
                                                            <ChevronDown className="size-3" />
                                                        </HasPermission>
                                                    )}
                                                </Badge>
                                            </button>
                                        </DropdownMenuTrigger>
                                        {!isDone && (
                                            <HasPermission permission="edit-project-tasks">
                                                <DropdownMenuContent align="end">
                                                    {TASK_PRIORITIES.map((priority) => (
                                                        <DropdownMenuItem
                                                            key={priority.value}
                                                            disabled={priority.value === task.priority || loading}
                                                            onSelect={() => handlePriorityChange(priority.value as TaskPriority)}
                                                        >
                                                            <span className={`mr-2 inline-block h-2 w-2 rounded-full ${priority.classes.replace('text-white', '')}`} />
                                                            {priority.label}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </HasPermission>
                                        )}
                                    </DropdownMenu>

                                    {/* Milestone */}
                                    {task.milestone && (
                                        <div className="flex items-center gap-1 text-xs">
                                            <Tag className="mb-1 size-3.5 text-muted-foreground" />
                                            <span className="text-foreground">{task.milestone.title}</span>
                                        </div>
                                    )}

                                    {/* Due date */}
                                    {task.due_date && (
                                        <div className="flex items-center gap-1 text-xs">
                                            <AlertCircle className={`mb-1 size-3.5 text-muted-foreground ${isOverdue ? 'block' : 'hidden'}`} />
                                            <Calendar className={`mb-1 size-3.5 text-muted-foreground ${isOverdue ? 'hidden' : 'block'}`} />

                                            <span className={`${isOverdue ? 'font-medium text-destructive' : 'text-foreground'}`}>
                                                {isOverdue ? 'Lewat: ' : ''}
                                                {formatDate(task.due_date)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Assignee */}
                                    {task.assignee && (
                                        <span className="flex items-center gap-1 text-xs text-foreground">
                                            <Avatar className="h-5 w-5">
                                                <AvatarImage src={`${R2_PUBLIC_URL}/${task.assignee.avatar}`} alt={task.assignee.name} />
                                                <AvatarFallback className="bg-primary/10 text-[10px] text-primary">{getInitials(task.assignee.name)}</AvatarFallback>
                                            </Avatar>
                                            {task.assignee.name}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Right - status + actions */}
                            <div className="flex shrink-0 items-center gap-1">
                                <HasPermission permission="edit-project-tasks">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="secondary" className="h-8 w-8" disabled={loading || isDone} onClick={() => setMode('edit')}>
                                                <Pencil className="size-3.5" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Edit Tugas</TooltipContent>
                                    </Tooltip>
                                </HasPermission>

                                {/* Delete */}
                                <HasPermission permission="delete-project-tasks">
                                    <DialogDelete
                                        description={`Tindakan ini tidak dapat dibatalkan. Data tugas "${task.title}" akan dihapus secara permanen dari sistem.`}
                                        deleteUrl={projects.tasks.destroy({ project: projectId, task: task.id }).url}
                                        tooltipText="Hapus Anggota Tim"
                                        isDisabled={loading || isDone}
                                    />
                                </HasPermission>

                                {/* Status dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button>
                                            <Badge className={`px-3 py-1 ${statusInfo.classes}`}>
                                                {statusInfo.label}
                                                {!isDone && (
                                                    <HasPermission permission="edit-project-tasks">
                                                        <ChevronDown className="size-3" />
                                                    </HasPermission>
                                                )}
                                            </Badge>
                                        </button>
                                    </DropdownMenuTrigger>
                                    {!isDone && (
                                        <HasPermission permission="edit-project-tasks">
                                            <DropdownMenuContent align="end">
                                                {TASK_STATUSES.map((status) => (
                                                    <DropdownMenuItem
                                                        key={status.value}
                                                        disabled={status.value === task.status || loading}
                                                        onSelect={() => handleStatusChange(status.value as TaskStatus)}
                                                    >
                                                        <span className={`mr-2 inline-block h-2 w-2 rounded-full ${status.classes.replace('text-white', '')}`} />
                                                        {status.label}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </HasPermission>
                                    )}
                                </DropdownMenu>
                            </div>
                        </div>

                        {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                    </div>
                )}
            </div>
        </>
    );
}
