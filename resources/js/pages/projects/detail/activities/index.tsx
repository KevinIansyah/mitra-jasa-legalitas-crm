import { router } from '@inertiajs/react';
import { Activity, ChevronLeftIcon, ChevronRightIcon, FilePlus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';
import type { ActivityLog } from '@/types/projects';

type ActivitiesProps = {
    activities: {
        data: ActivityLog[];
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
};

const EVENT_ICONS = {
    created: <FilePlus className="size-4 text-emerald-500" />,
    updated: <Pencil className="size-3.5 text-blue-600" />,
    deleted: <Trash2 className="size-3.5 text-red-500" />,
};

const LOG_NAME_LABELS: Record<string, string> = {
    project: 'Project',
    milestone: 'Milestone',
    task: 'Task',
    invoice: 'Invoice',
    expense: 'Pengeluaran',
    member: 'Anggota Tim',
    document: 'Dokumen',
    deliverable: 'Deliverable',
};

export default function Activities({ activities }: ActivitiesProps) {
    const handlePage = (url: string | null) => {
        if (!url) return;

        router.get(url, {});
    };

    return (
        <div className="space-y-4">
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div>
                    <h2 className="text-xl font-semibold">Aktivitas</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">Riwayat seluruh perubahan yang terjadi pada project ini.</p>
                </div>
            </div>

            {activities.data.length > 0 ? (
                <>
                    <div className="space-y-0">
                        {activities.data.map((activity, index) => {
                            const isLast = index === activities.data.length - 1;

                            return (
                                <div key={activity.id} className="flex gap-4">
                                    {/* Timeline */}
                                    <div className="flex flex-col items-center">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar shadow dark:shadow-none">
                                            {EVENT_ICONS[activity.event] ?? EVENT_ICONS.updated}
                                        </div>
                                        {!isLast && <div className="mt-1 w-px flex-1 bg-border" />}
                                    </div>

                                    {/* Content */}
                                    <div className={`${isLast ? 'mb-0' : 'mb-4'} flex-1 rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none`}>
                                        <div className="flex flex-col items-start justify-between lg:flex-row lg:gap-4">
                                            <div className="order-2 space-y-1 lg:order-1">
                                                <span className="text-xs font-medium text-muted-foreground">{LOG_NAME_LABELS[activity.log_name] ?? activity.log_name}</span>
                                                <p className="text-sm font-medium">{activity.description}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    oleh <span className="font-medium text-foreground">{activity.causer?.name ?? 'Sistem'}</span>
                                                </p>
                                            </div>
                                            <span className="order-1 shrink-0 text-xs text-muted-foreground lg:order-2">{formatDateTime(activity.created_at)}</span>
                                        </div>

                                        {/* Detail changes */}
                                        {activity.event === 'updated' && activity.properties.old && (
                                            <div className="mt-4 space-y-1 rounded-lg bg-primary/10 p-4 text-xs dark:bg-muted/40">
                                                {Object.entries(activity.properties.old).map(([field, oldVal]) => (
                                                    <div key={field} className="flex items-center gap-2">
                                                        <span className="text-muted-foreground capitalize">{field.replaceAll('_', ' ')}:</span>
                                                        <span className="text-red-400 line-through">{String(oldVal)}</span>
                                                        <span className="text-muted-foreground">→</span>
                                                        <span className="text-emerald-400">{String(activity.properties.attributes?.[field] ?? null)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {activities.last_page > 1 && (
                        <div className="ml-auto flex w-[calc(100%-3rem)] items-center justify-between rounded-xl bg-sidebar p-4 shadow dark:shadow-none">
                            <span className="text-sm text-muted-foreground">
                                Halaman {activities.current_page} dari {activities.last_page}
                            </span>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" className="h-8 w-8" disabled={!activities.prev_page_url} onClick={() => handlePage(activities.prev_page_url)}>
                                    <ChevronLeftIcon className="size-4" />
                                </Button>
                                <Button variant="secondary" size="sm" className="h-8 w-8" disabled={!activities.next_page_url} onClick={() => handlePage(activities.next_page_url)}>
                                    <ChevronRightIcon className="size-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex min-h-40 flex-col items-center justify-center gap-4 rounded-xl bg-sidebar shadow dark:shadow-none">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Activity className="size-5 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Belum ada aktivitas pada project ini.</p>
                </div>
            )}
        </div>
    );
}
