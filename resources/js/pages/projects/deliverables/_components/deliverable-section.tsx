import { File, FileCheck, FileLock, FileText } from 'lucide-react';
import { useState } from 'react';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Paginator } from '@/types/paginator';
import type { ProjectDeliverable, ProjectDeliverableSummary } from '@/types/project';
import { DataTable } from './datatable';

interface DeliverableSectionProps {
    deliverables: Paginator<ProjectDeliverable>;
    summary: ProjectDeliverableSummary;
    filters: { search?: string };
}

export function DeliverableSection({ deliverables, summary, filters }: DeliverableSectionProps) {
    const { data, current_page, last_page, per_page, total } = deliverables;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS = [
        {
            label: 'Total Hasil Akhir',
            value: summary.total,
            badge: 'bg-slate-500 text-white',
            icon: <File className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Semua hasil akhir project</p>
                    <p className="text-muted-foreground">Dari seluruh project aktif</p>
                </>
            ),
        },
        {
            label: 'Versi Final',
            value: summary.final,
            badge: 'bg-emerald-500 text-white',
            icon: <FileCheck className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Hasil akhir bertanda final</p>
                    <p className="text-muted-foreground">{summary.draft} masih dalam draft</p>
                </>
            ),
        },
        {
            label: 'Draft / Revisi',
            value: summary.draft,
            badge: 'bg-yellow-500 text-white',
            icon: <FileText className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Hasil akhir belum final</p>
                    <p className="text-muted-foreground">Masih dalam proses revisi</p>
                </>
            ),
        },
        {
            label: 'Terenkripsi',
            value: summary.encrypted,
            badge: 'bg-blue-600 text-white',
            icon: <FileLock className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">File dilindungi enkripsi</p>
                    <p className="text-muted-foreground">{summary.total - summary.encrypted} tidak terenkripsi</p>
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
                <DataTable data={data} pageIndex={pageIndex} setPageIndex={setPageIndex} totalPages={last_page} totalItems={total} perPage={per_page} initialFilters={filters} />
            </div>
        </div>
    );
}
