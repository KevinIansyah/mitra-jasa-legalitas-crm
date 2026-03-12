import { Link, usePage } from '@inertiajs/react';
import { Eye, FolderOpen } from 'lucide-react';

import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

import { formatDate } from '@/lib/utils';
import projects from '@/routes/projects';
import staffRoutes from '@/routes/staff';
import type { BreadcrumbItem } from '@/types';
import type { Paginator } from '@/types/paginator';
import type { Project } from '@/types/project';
import { PROJECT_STATUSES_MAP } from '@/types/project';

export default function Page() {
    const { staff, myProjects } = usePage<{
        staff: { id: number; name: string };
        myProjects: Paginator<Project>;
    }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Staff', href: staffRoutes.index().url },
        { title: 'My Projects', href: '#' },
    ];

    const { data, current_page, last_page, total } = myProjects;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-4 md:p-6">
                <Heading title="My Projects" description={`Daftar project yang sedang ditangani oleh ${staff.name}`} />

                <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Total <span className="font-semibold text-foreground">{total}</span> project
                        </p>
                        {last_page > 1 && (
                            <p className="text-sm text-muted-foreground">
                                Halaman {current_page} dari {last_page}
                            </p>
                        )}
                    </div>

                    {data.length === 0 ? (
                        <div className="flex min-h-40 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border p-8 text-muted-foreground">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                <FolderOpen className="size-5 text-primary" />
                            </div>
                            <p className="text-sm">Belum ada project yang ditugaskan</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {data.map((project) => {
                                const statusInfo = PROJECT_STATUSES_MAP[project.status];
                                return (
                                    <Card key={project.id} className="border-none bg-sidebar shadow dark:shadow-none">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="space-y-1">
                                                    <p className="font-semibold leading-snug">{project.name}</p>
                                                    {project.customer && (
                                                        <p className="text-xs text-muted-foreground">{project.customer.name}</p>
                                                    )}
                                                </div>
                                                <Badge className={statusInfo?.classes ?? 'bg-muted text-muted-foreground'}>
                                                    {statusInfo?.label ?? project.status}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {project.service && (
                                                <p className="text-xs text-muted-foreground">
                                                    Layanan: <span className="text-foreground">{project.service.name}</span>
                                                </p>
                                            )}
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                <span>Mulai: {formatDate(project.start_date)}</span>
                                                <span>Selesai: {formatDate(project.planned_end_date)}</span>
                                            </div>
                                            {project.progress_percentage !== undefined && (
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-muted-foreground">Progress</span>
                                                        <span className="font-medium">{project.progress_percentage}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className="h-full rounded-full bg-primary transition-all"
                                                            style={{ width: `${project.progress_percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="pt-1">
                                                <Button asChild variant="secondary" size="sm" className="w-full gap-1.5">
                                                    <Link href={projects.show(project.id).url}>
                                                        <Eye className="size-3.5" />
                                                        Lihat Detail
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {last_page > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-4">
                            {current_page > 1 && (
                                <Button asChild variant="secondary" size="sm">
                                    <Link href={staffRoutes.myProjects(staff.id).url + `?page=${current_page - 1}`}>
                                        Sebelumnya
                                    </Link>
                                </Button>
                            )}
                            {current_page < last_page && (
                                <Button asChild variant="secondary" size="sm">
                                    <Link href={staffRoutes.myProjects(staff.id).url + `?page=${current_page + 1}`}>
                                        Selanjutnya
                                    </Link>
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
