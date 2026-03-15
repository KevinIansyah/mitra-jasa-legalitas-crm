import { Ban, CheckCircle2, Clock, FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Company, Customer } from '@/types/contacts';
import type { Paginator } from '@/types/paginator';
import type { Project, ProjectSummary } from '@/types/projects';
import type { Service } from '@/types/service';
import { DataTable } from './datatable';

interface ProjectSectionProps {
    projects: Paginator<Project>;
    summary: ProjectSummary;
    customers: Customer[];
    companies: Company[];
    services: Service[];
    filters: { search?: string };
}

export function ProjectSection({ projects, summary, customers, companies, services, filters }: ProjectSectionProps) {
    const { data, current_page, last_page, per_page, total } = projects;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS = [
        {
            label: 'Total Project',
            value: summary.total,
            badge: 'bg-slate-500 text-white',
            icon: <FolderOpen className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Semua project terdaftar</p>
                    <p className="text-muted-foreground">Seluruh status project</p>
                </>
            ),
        },
        {
            label: 'Berjalan',
            value: summary.in_progress,
            badge: 'bg-yellow-500 text-white',
            icon: <Clock className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Project sedang dikerjakan</p>
                    <p className="text-muted-foreground">Status: In Progress</p>
                </>
            ),
        },
        {
            label: 'Selesai',
            value: summary.completed,
            badge: 'bg-emerald-500 text-white',
            icon: <CheckCircle2 className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Project telah selesai</p>
                    <p className="text-muted-foreground">Status: Completed</p>
                </>
            ),
        },
        {
            label: 'Ditunda / Dibatalkan',
            value: summary.on_hold + summary.cancelled,
            badge: 'bg-red-500 text-white',
            icon: <Ban className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">
                        {summary.on_hold} ditunda · {summary.cancelled} dibatalkan
                    </p>
                    <p className="text-muted-foreground">On Hold &amp; Cancelled</p>
                </>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:border-none *:data-[slot=card]:bg-sidebar *:data-[slot=card]:shadow md:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:dark:shadow-none">
                {STATS.map(({ label, value, badge, icon, footer }) => (
                    <Card key={label}>
                        <CardHeader>
                            <CardDescription>{label}</CardDescription>
                            <CardTitle className="text-3xl font-semibold tabular-nums">{value}</CardTitle>
                            <CardAction>
                                <div className={`rounded-full px-3 py-1 ${badge}`}>{icon}</div>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start text-sm">{footer}</CardFooter>
                    </Card>
                ))}
            </div>

            <div className="w-full rounded-xl bg-sidebar p-4">
                <DataTable
                    data={data}
                    customers={customers}
                    companies={companies}
                    services={services}
                    pageIndex={pageIndex}
                    setPageIndex={setPageIndex}
                    totalPages={last_page}
                    totalItems={total}
                    perPage={per_page}
                    initialFilters={filters}
                />
            </div>
        </div>
    );
}
