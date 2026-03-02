import { File, FileCheck, FileClock, FileX } from 'lucide-react';
import { useState } from 'react';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Paginator } from '@/types/paginator';
import type { ProjectDocument, ProjectDocumentSummary } from '@/types/project';
import { DataTable } from './datatable';

interface DocumentSectionProps {
    documents: Paginator<ProjectDocument>;
    summary: ProjectDocumentSummary;
    filters: { search?: string };
}

export function DocumentSection({ documents, summary, filters }: DocumentSectionProps) {
    const { data, current_page, last_page, per_page, total } = documents;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS_BADGE = [
        {
            label: 'Total',
            value: summary.total,
            color: 'text-foreground',
            badge: 'bg-slate-500 text-white',
            icon: <File className="size-3.5" />,
        },
        {
            label: 'Terverifikasi',
            value: summary.verified,
            color: 'text-foreground',
            badge: 'bg-emerald-500 text-white',
            icon: <FileCheck className="size-3.5" />,
        },
        {
            label: 'Menunggu Review',
            value: summary.pending_review,
            color: 'text-foreground',
            badge: 'bg-yellow-500 text-white',
            icon: <FileClock className="size-3.5" />,
        },
        {
            label: 'Ditolak',
            value: summary.rejected,
            color: 'text-foreground',
            badge: 'bg-red-500 text-white',
            icon: <FileX className="size-3.5" />,
        },
    ];

    return (
        <div className="space-y-4">
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

                        <CardFooter className="flex-col items-start text-sm">
                            <div className="font-medium">Jumlah dokumen {label.toLowerCase()}</div>
                            <div className="text-muted-foreground">Berdasarkan seluruh project</div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <div className="w-full rounded-xl bg-sidebar p-4">
                <DataTable data={data} pageIndex={pageIndex} setPageIndex={setPageIndex} totalPages={last_page} totalItems={total} perPage={per_page} initialFilters={filters} />
            </div>
        </div>
    );
}
