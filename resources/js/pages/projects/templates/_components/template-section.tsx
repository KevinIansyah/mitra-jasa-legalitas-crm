import { CheckCircle2, FileText, LayoutTemplate, Wrench } from 'lucide-react';
import { useState } from 'react';

import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import type { Paginator } from '@/types/paginator';
import type { ProjectTemplate, ProjectTemplateSummary } from '@/types/project-templates';
import type { Service } from '@/types/services';
import { DataTable } from './datatable';

type TemplateSectionProps = {
    templates: Paginator<ProjectTemplate>;
    summary: ProjectTemplateSummary;
    services: Service[];
    filters: { search?: string };
}

export function TemplateSection({ templates, summary, services, filters }: TemplateSectionProps) {
    const { data, current_page, last_page, per_page, total } = templates;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS = [
        {
            label: 'Total Template',
            value: summary.total,
            badge: 'bg-secondary/50 text-white',
            icon: <LayoutTemplate className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Semua template terdaftar</p>
                    <p className="text-muted-foreground">Aktif &amp; tidak aktif</p>
                </>
            ),
        },
        {
            label: 'Aktif',
            value: summary.active,
            badge: 'bg-emerald-500 text-white dark:bg-emerald-500/15 dark:text-emerald-500 px-2.5 py-1.5',
            icon: <CheckCircle2 className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Template siap digunakan</p>
                    <p className="text-muted-foreground">{summary.inactive} tidak aktif</p>
                </>
            ),
        },
        {
            label: 'Dengan Konten',
            value: summary.with_content,
            badge: 'bg-blue-600 text-white dark:bg-blue-600/15 dark:text-blue-600 px-2.5 py-1.5',
            icon: <FileText className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Memiliki milestone / dokumen</p>
                    <p className="text-muted-foreground">Siap dijadikan dasar project</p>
                </>
            ),
        },
        {
            label: 'Layanan / Custom',
            value: summary.service_based + summary.custom,
            badge: 'bg-purple-500 text-white dark:bg-purple-500/15 dark:text-purple-500 px-2.5 py-1.5',
            icon: <Wrench className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">
                        {summary.service_based} berbasis layanan · {summary.custom} custom
                    </p>
                    <p className="text-muted-foreground">Tipe pembuatan template</p>
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
