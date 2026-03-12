import { router, usePage, Link } from '@inertiajs/react';
import { AlertCircle, Calendar, Circle, CircleCheck, ClipboardList, Clock, Info, Tag, ChevronDown, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import Heading from '@/components/heading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';

import { getInitials } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import projects from '@/routes/projects';
import staffRoutes from '@/routes/staff';
import type { BreadcrumbItem } from '@/types';
import type { ProjectTask, TaskStatus } from '@/types/project';
import { TASK_PRIORITIES_MAP, TASK_STATUSES, TASK_STATUSES_MAP } from '@/types/project';

export default function Page() {
    const { staff, tasks } = usePage<{
        staff: { id: number; name: string };
        tasks: ProjectTask[];
    }>().props;

    const [loadingTaskId, setLoadingTaskId] = useState<number | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Staff', href: staffRoutes.index().url },
        { title: 'My Tasks', href: '#' },
    ];

    const summary = {
        total: tasks.length,
        todo: tasks.filter((t) => t.status === 'todo').length,
        in_progress: tasks.filter((t) => t.status === 'in_progress').length,
        completed: tasks.filter((t) => t.status === 'completed').length,
        overdue: tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed' && t.status !== 'cancelled').length,
    };

    const STATS = [
        {
            label: 'Total',
            value: summary.total,
            badge: 'bg-slate-500 text-white',
            icon: <Circle className="size-3.5" />,
        },
        {
            label: 'Selesai',
            value: summary.completed,
            badge: 'bg-emerald-500 text-white',
            icon: <CircleCheck className="size-3.5" />,
        },
        {
            label: 'Sedang Berjalan',
            value: summary.in_progress,
            badge: 'bg-yellow-500 text-white',
            icon: <Clock className="size-3.5" />,
        },
        {
            label: 'Terlambat',
            value: summary.overdue,
            badge: 'bg-red-500 text-white',
            icon: <Info className="size-3.5" />,
        },
    ];

    function handleStatusChange(task: ProjectTask, status: TaskStatus) {
        setLoadingTaskId(task.id);
        const toastId = toast.loading('Memproses...', { description: 'Status tugas sedang diperbarui.' });

        router.patch(
            projects.tasks.updateStatus({ project: task.project_id, task: task.id }).url,
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
                    setLoadingTaskId(null);
                    toast.dismiss(toastId);
                },
            },
        );
    }

    const grouped = TASK_STATUSES.map((s) => ({
        ...s,
        tasks: tasks.filter((t) => t.status === s.value),
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-4 md:p-6">
                <Heading title="My Tasks" description={`Daftar tugas yang ditugaskan kepada ${staff.name}`} />

                <div className="mt-4 space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:border-none *:data-[slot=card]:bg-sidebar *:data-[slot=card]:shadow md:grid-cols-4 *:data-[slot=card]:dark:shadow-none">
                        {STATS.map(({ label, value, badge, icon }) => (
                            <Card key={label}>
                                <CardHeader>
                                    <CardDescription>{label}</CardDescription>
                                    <CardTitle className="text-3xl font-semibold tabular-nums">{value}</CardTitle>
                                    {label !== 'Total' && (
                                        <CardAction>
                                            <div className={`rounded-full px-3 py-1 ${badge}`}>{icon}</div>
                                        </CardAction>
                                    )}
                                </CardHeader>
                            </Card>
                        ))}
                    </div>

                    {/* Task List */}
                    {tasks.length === 0 ? (
                        <div className="flex min-h-40 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border p-8 text-muted-foreground">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                <ClipboardList className="size-5 text-primary" />
                            </div>
                            <p className="text-sm">Belum ada tugas yang ditugaskan</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {grouped.map((group) => {
                                if (group.tasks.length === 0) return null;

                                return (
                                    <div key={group.value} className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <Badge className={group.classes}>{group.label}</Badge>
                                            <span className="text-xs text-muted-foreground">{group.tasks.length} tugas</span>
                                            <div className="flex-1 border-t border-border" />
                                        </div>

                                        {group.tasks.map((task) => {
                                            const statusInfo = TASK_STATUSES_MAP[task.status];
                                            const priorityInfo = TASK_PRIORITIES_MAP[task.priority];
                                            const isCompleted = task.status === 'completed';
                                            const isCancelled = task.status === 'cancelled';
                                            const isDone = isCompleted || isCancelled;
                                            const isOverdue = task.due_date && !isDone && new Date(task.due_date) < new Date();
                                            const isLoading = loadingTaskId === task.id;

                                            return (
                                                <div
                                                    key={task.id}
                                                    className={`rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none ${isDone ? 'opacity-60' : ''}`}
                                                >
                                                    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-start">
                                                        {/* Left */}
                                                        <div className="flex-1 space-y-2">
                                                            <p className={`font-semibold leading-snug ${isDone ? 'text-muted-foreground line-through' : ''}`}>
                                                                {task.title}
                                                            </p>

                                                            {/* Meta badges */}
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <Badge className={`${priorityInfo.classes}`}>
                                                                    {priorityInfo.label}
                                                                </Badge>

                                                                {task.milestone && (
                                                                    <div className="flex items-center gap-1 text-xs">
                                                                        <Tag className="mb-1 size-3.5 text-muted-foreground" />
                                                                        <span className="text-foreground">{task.milestone.title}</span>
                                                                    </div>
                                                                )}

                                                                {task.due_date && (
                                                                    <div className="flex items-center gap-1 text-xs">
                                                                        {isOverdue ? (
                                                                            <AlertCircle className="mb-1 size-3.5 text-muted-foreground" />
                                                                        ) : (
                                                                            <Calendar className="mb-1 size-3.5 text-muted-foreground" />
                                                                        )}
                                                                        <span className={isOverdue ? 'font-medium text-destructive' : 'text-foreground'}>
                                                                            {isOverdue ? 'Lewat: ' : ''}
                                                                            {formatDate(task.due_date)}
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                {task.assignee && (
                                                                    <span className="flex items-center gap-1 text-xs text-foreground">
                                                                        <Avatar className="h-5 w-5">
                                                                            <AvatarImage src={task.assignee.avatar ?? undefined} />
                                                                            <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
                                                                                {getInitials(task.assignee.name)}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        {task.assignee.name}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {task.description && (
                                                                <p className="text-sm text-muted-foreground">{task.description}</p>
                                                            )}

                                                            {/* Project link */}
                                                            {task.project && (
                                                                <div className="pt-1">
                                                                    <Button asChild variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-xs">
                                                                        <Link href={projects.tasks(task.project_id).url}>
                                                                            <ExternalLink className="size-3" />
                                                                            Lihat Detail Project: {task.project.name}
                                                                        </Link>
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Right — status dropdown */}
                                                        <div className="shrink-0">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <button disabled={isDone || isLoading}>
                                                                        <Badge className={`px-3 py-1 ${statusInfo.classes}`}>
                                                                            {statusInfo.label}
                                                                            {!isDone && <ChevronDown className="ml-1 size-3" />}
                                                                        </Badge>
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                {!isDone && (
                                                                    <DropdownMenuContent align="end">
                                                                        {TASK_STATUSES.map((status) => (
                                                                            <DropdownMenuItem
                                                                                key={status.value}
                                                                                disabled={status.value === task.status || isLoading}
                                                                                onSelect={() => handleStatusChange(task, status.value as TaskStatus)}
                                                                            >
                                                                                <span
                                                                                    className={`mr-2 inline-block h-2 w-2 rounded-full ${status.classes.replace('text-white', '')}`}
                                                                                />
                                                                                {status.label}
                                                                            </DropdownMenuItem>
                                                                        ))}
                                                                    </DropdownMenuContent>
                                                                )}
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
