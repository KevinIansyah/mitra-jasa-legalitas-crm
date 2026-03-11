import { router } from '@inertiajs/react';
import { Circle, CircleCheck, CircleX, Clock, Plus, Target } from 'lucide-react';
import { useState } from 'react';

import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import projects from '@/routes/projects';
import type { Project, ProjectMilestone } from '@/types/project';
import { MilestoneCard } from './_components/milestone-card';
import { MilestoneForm } from './_components/milestone-form';

type MilestonesProps = {
    project: Project;
};

export default function Milestones({ project }: MilestonesProps) {
    const [showAddForm, setShowAddForm] = useState(false);

    const milestones = project.milestones ?? [];

    const summary = {
        total: milestones.length,
        completed: milestones.filter((m) => m.status === 'completed').length,
        in_progress: milestones.filter((m) => m.status === 'in_progress').length,
        blocked: milestones.filter((m) => m.status === 'blocked').length,
        not_started: milestones.filter((m) => m.status === 'not_started').length,
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
            label: 'Berjalan',
            value: summary.in_progress,
            color: 'text-foreground',
            badge: 'bg-yellow-500 text-white',
            icon: <Clock className="size-3.5" />,
        },
        {
            label: 'Terhambat',
            value: summary.blocked,
            color: 'text-foreground',
            badge: 'bg-red-500 text-white',
            icon: <CircleX className="size-3.5" />,
        },
    ];

    const progressPercent = summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0;

    function handleReorder(milestone: ProjectMilestone, direction: 'up' | 'down') {
        const idx = milestones.indexOf(milestone);
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        const swapWith = milestones[swapIdx];

        if (!swapWith) return;

        router.post(
            projects.milestones.reorder(project.id).url,
            {
                milestones: [
                    { id: milestone.id, sort_order: swapWith.sort_order },
                    { id: swapWith.id, sort_order: milestone.sort_order },
                ],
            },
            { preserveScroll: true },
        );
    }

    return (
        <div className="space-y-4">
            {/* Summary */}
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold">Milestone</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Pantau progres project berdasarkan pencapaian milestone yang telah ditetapkan.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-primary/20">
                            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                        </div>
                        <span className="text-lg font-bold tabular-nums">{progressPercent}%</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:border-none *:data-[slot=card]:bg-sidebar *:data-[slot=card]:shadow md:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:dark:shadow-none">
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

            {!showAddForm && milestones.length > 0 && (
                <HasPermission permission="create-project-milestones">
                    <div className="flex w-full justify-end">
                        <Button type="button" className="w-full md:w-30" onClick={() => setShowAddForm(true)}>
                            <Plus className="size-4" />
                            Tambah
                        </Button>
                    </div>
                </HasPermission>
            )}

            {/* Timeline */}
            <div className="mb-0 space-y-0">
                {/* Add Form */}
                {showAddForm && (
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                <Plus className="size-5 text-primary" />
                            </div>
                        </div>
                        <div className="mb-4 flex-1">
                            <MilestoneForm
                                initial={{
                                    project_id: project.id,
                                    title: '',
                                    description: '',
                                    estimated_duration_days: 1,
                                    start_date: '',
                                    planned_end_date: '',
                                }}
                                submitUrl={projects.milestones.store(project.id).url}
                                method="post"
                                onSuccess={() => setShowAddForm(false)}
                                onCancel={() => setShowAddForm(false)}
                            />
                        </div>
                    </div>
                )}

                {milestones.length > 0
                    ? milestones.map((milestone, index) => (
                          <MilestoneCard
                              key={milestone.id}
                              milestone={milestone}
                              index={index}
                              projectId={project.id}
                              isFirst={index === 0}
                              isLast={index === milestones.length - 1}
                              onReorderUp={() => handleReorder(milestone, 'up')}
                              onReorderDown={() => handleReorder(milestone, 'down')}
                          />
                      ))
                    : !showAddForm && (
                          <div className="min-h-40 rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                              <div className="flex w-full flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border py-16 text-muted-foreground">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                      <Target className="size-5 text-primary" />
                                  </div>
                                  <p className="text-sm">Belum ada milestone untuk project ini</p>
                                  <HasPermission permission="create-project-milestones">
                                      <Button type="button" size="sm" onClick={() => setShowAddForm(true)} className="gap-1.5">
                                          <Plus className="size-4" />
                                          Tambah Milestone Pertama
                                      </Button>
                                  </HasPermission>
                              </div>
                          </div>
                      )}
            </div>
        </div>
    );
}
