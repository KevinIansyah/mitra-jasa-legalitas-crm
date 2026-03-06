import { router } from '@inertiajs/react';
import { Circle, CircleCheck, ClipboardList, Clock, Info, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { HasPermission } from '@/components/has-permission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import projects from '@/routes/projects';
import { TASK_STATUSES, type Project } from '@/types/project';
import { TaskCard } from './_components/task-card';
import { TaskForm, type TaskFormData } from './_components/task-form';

type TasksProps = {
    project: Project;
};

const EMPTY_FORM: TaskFormData = {
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    due_date: '',
    assigned_to: '',
    project_milestone_id: '',
};

export default function Tasks({ project }: TasksProps) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [addFormData, setAddFormData] = useState<TaskFormData>(EMPTY_FORM);
    const [processing, setProcessing] = useState(false);

    const tasks = project.tasks ?? [];
    const members = (project.members ?? []).map((m) => ({ id: m.user!.id, name: m.user!.name }));
    const milestones = (project.milestones ?? []).map((m) => ({ id: m.id, title: m.title }));

    const summary = {
        total: tasks.length,
        todo: tasks.filter((t) => t.status === 'todo').length,
        in_progress: tasks.filter((t) => t.status === 'in_progress').length,
        completed: tasks.filter((t) => t.status === 'completed').length,
        overdue: tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed' && t.status !== 'cancelled').length,
    };

    const STATS_BADGE = [
        {
            label: 'Total',
            value: summary.total,
            color: 'text-foreground',
            badge: 'bg-slate-500 text-white',
            icon: <Circle className="size-3.5" />,
        },
        {
            label: 'Selesai',
            value: summary.completed,
            color: 'text-foreground',
            badge: 'bg-emerald-500 text-white',
            icon: <CircleCheck className="size-3.5" />,
        },
        {
            label: 'Sedang Berjalan',
            value: summary.in_progress,
            color: 'text-foreground',
            badge: 'bg-yellow-500 text-white',
            icon: <Clock className="size-3.5" />,
        },
        {
            label: 'Terlambat',
            value: summary.overdue,
            color: 'text-foreground',
            badge: 'bg-red-500 text-white',
            icon: <Info className="size-3.5" />,
        },
    ];

    function handleCreateSubmit() {
        if (!addFormData.title.trim()) return;
        setProcessing(true);
        const toastId = toast.loading('Menyimpan...', { description: 'Tugas sedang ditambahkan.' });

        router.post(
            projects.tasks.store(project.id).url,
            {
                ...addFormData,
                assigned_to: addFormData.assigned_to || null,
                project_milestone_id: addFormData.project_milestone_id || null,
                due_date: addFormData.due_date || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Tugas berhasil ditambahkan.' });
                    setShowAddForm(false);
                    setAddFormData(EMPTY_FORM);
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat menambahkan tugas, coba lagi.';
                    toast.error('Gagal', { description: String(msg) });
                },
                onFinish: () => {
                    setProcessing(false);
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
        <div className="space-y-4">
            {/* Header + stats */}
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <h2 className="text-xl font-bold">Tugas</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">Kelola dan pantau tugas-tugas dalam project ini.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 *:data-[slot=card]:border-none *:data-[slot=card]:bg-sidebar *:data-[slot=card]:shadow md:grid-cols-4 *:data-[slot=card]:dark:shadow-none">
                {STATS_BADGE.map(({ label, value, color, badge, icon }) => (
                    <Card key={label}>
                        <CardHeader>
                            <CardDescription>{label}</CardDescription>
                            <CardTitle className={`text-3xl font-semibold tabular-nums ${color}`}>{value}</CardTitle>

                            {label !== 'Total' && (
                                <CardAction>
                                    <div className={`rounded-full px-3 py-1 ${badge}`}>{icon}</div>
                                </CardAction>
                            )}
                        </CardHeader>
                    </Card>
                ))}
            </div>

            {/* Add button */}
            {!showAddForm && tasks.length > 0 && (
                <HasPermission permission="create-project-tasks">
                    <div className="flex w-full justify-end">
                        <Button type="button" className="w-full md:w-30" onClick={() => setShowAddForm(true)}>
                            <Plus className="size-4" />
                            Tambah
                        </Button>
                    </div>
                </HasPermission>
            )}

            {/* Add form */}
            {showAddForm && (
                <div className="rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                    <h3 className="mb-4 font-semibold">Tugas Baru</h3>
                    <TaskForm
                        data={addFormData}
                        processing={processing}
                        members={members}
                        milestones={milestones}
                        onChange={(v) => setAddFormData((prev) => ({ ...prev, ...v }))}
                        onSubmit={handleCreateSubmit}
                        onCancel={() => {
                            setShowAddForm(false);
                            setAddFormData(EMPTY_FORM);
                        }}
                    />
                </div>
            )}

            {/* Grouped list */}
            {tasks.length === 0 && !showAddForm ? (
                <div className="min-h-40 rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                    <div className="flex w-full flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border py-16 text-muted-foreground">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                            <ClipboardList className="size-5 text-primary" />
                        </div>
                        <p className="text-sm">Belum ada tugas untuk project ini</p>
                        <HasPermission permission="create-project-tasks">
                            <Button type="button" size="sm" onClick={() => setShowAddForm(true)} className="gap-1.5">
                                <Plus className="size-4" />
                                Tambah Tugas Pertama
                            </Button>
                        </HasPermission>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {grouped.map((group) => {
                        if (group.tasks.length === 0) return null;

                        return (
                            <div key={group.value} className="space-y-4">
                                {/* Group header */}
                                <div className="flex items-center gap-4">
                                    <Badge className={group.classes}>{group.label}</Badge>
                                    <span className="text-xs text-muted-foreground">{group.tasks.length} tugas</span>
                                    <div className="flex-1 border-t border-border" />
                                </div>

                                {/* Task cards */}
                                {group.tasks.map((task) => (
                                    <TaskCard key={task.id} task={task} projectId={project.id} members={members} milestones={milestones} />
                                ))}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
