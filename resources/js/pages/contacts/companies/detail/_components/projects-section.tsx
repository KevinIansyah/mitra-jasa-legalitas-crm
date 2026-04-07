import { Link } from '@inertiajs/react';
import { FolderOpen } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { usePermission } from '@/hooks/use-permission';
import { formatDate } from '@/lib/utils';
import companies from '@/routes/contacts/companies';
import projects from '@/routes/projects';
import type { Paginator } from '@/types/paginator';
import type { Project } from '@/types/projects';
import { PROJECT_STATUSES_MAP } from '@/types/projects';

type ProjectsSectionProps = {
    companyId: number;
    projectsPage: Paginator<Project>;
};

export function ProjectsSection({ companyId, projectsPage }: ProjectsSectionProps) {
    const { hasPermission } = usePermission();
    const canViewProject = hasPermission('view-projects');

    const { data: projectRows, current_page, last_page, total, per_page } = projectsPage;

    const pageQuery = (page: number) =>
        companies.show(companyId, {
            query: { page, ...(per_page !== 12 ? { per_page } : {}) },
        }).url;

    return (
        <section>
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold">Riwayat project</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Project yang mengaitkan perusahaan ini sebagai klien.</p>
                    </div>

                    <div className="space-y-4">
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

                        {projectRows.length === 0 ? (
                            <div className="flex min-h-40 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border p-8 text-muted-foreground">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                    <FolderOpen className="size-5 text-primary" />
                                </div>
                                <p className="text-sm">Belum ada project untuk perusahaan ini</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {projectRows.map((project) => {
                                    const statusInfo = PROJECT_STATUSES_MAP[project.status];
                                    const projectCard = (
                                        <Card
                                            className={`border-none bg-primary/10 shadow dark:bg-muted/40 dark:shadow-none ${canViewProject ? 'transition-colors hover:bg-sidebar/80' : ''}`}
                                        >
                                            <CardHeader className="gap-0">
                                                <div className="space-y-2">
                                                    <div className="space-y-1">
                                                        <p className="leading-snug font-semibold">{project.name}</p>
                                                        {project.customer && <p className="text-xs text-muted-foreground">{project.customer.name}</p>}
                                                    </div>
                                                    <Badge className={statusInfo?.classes ?? 'bg-muted text-muted-foreground'}>{statusInfo?.label ?? project.status}</Badge>
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
                                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10 dark:bg-muted/40">
                                                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${project.progress_percentage}%` }} />
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                    return <div key={project.id}>{canViewProject ? <Link href={projects.show(project.id).url}>{projectCard}</Link> : projectCard}</div>;
                                })}
                            </div>
                        )}

                        {last_page > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-2">
                                {current_page > 1 && (
                                    <Button asChild variant="secondary" size="sm">
                                        <Link href={pageQuery(current_page - 1)}>Sebelumnya</Link>
                                    </Button>
                                )}
                                {current_page < last_page && (
                                    <Button asChild variant="secondary" size="sm">
                                        <Link href={pageQuery(current_page + 1)}>Selanjutnya</Link>
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
