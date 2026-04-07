import { CircleCheck, CircleDot, CircleX, FileText } from 'lucide-react';
import { useState } from 'react';

import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { formatRupiah } from '@/lib/service';
import type { Estimate, EstimateSummaryData } from '@/types/estimates';
import type { Paginator } from '@/types/paginator';
import { DataTable } from './datatable';

type EstimateSectionProps = {
    estimates: Paginator<Estimate>;
    summary: EstimateSummaryData;
    filters: { search?: string; status?: string };
}

export function EstimateSection({ estimates, summary, filters }: EstimateSectionProps) {
    const { data, current_page, last_page, per_page, total } = estimates;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS = [
        {
            label: 'Total Estimate',
            value: summary.total,
            badge: 'bg-secondary/50 text-white px-2.5 py-1.5',
            icon: <FileText className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">{formatRupiah(Number(summary.accepted_amount))} estimasi disetujui</p>
                    <p className="text-muted-foreground">dari total {formatRupiah(Number(summary.total_amount))}</p>
                </>
            ),
        },
        {
            label: 'Draft / Terkirim',
            value: Number(summary.draft) + Number(summary.sent),
            badge: 'bg-yellow-500 text-white dark:bg-yellow-500/15 dark:text-yellow-500 px-2.5 py-1.5',
            icon: <CircleDot className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">
                        {summary.draft} draft · {summary.sent} terkirim
                    </p>
                    <p className="text-muted-foreground">Menunggu konfirmasi</p>
                </>
            ),
        },
        {
            label: 'Diterima',
            value: summary.accepted,
            badge: 'bg-emerald-500 text-white dark:bg-emerald-500/15 dark:text-emerald-500 px-2.5 py-1.5',
            icon: <CircleCheck className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Estimate disetujui</p>
                    <p className="text-muted-foreground">Siap dikonversi ke project</p>
                </>
            ),
        },
        {
            label: 'Ditolak',
            value: summary.rejected,
            badge: 'bg-red-500 text-white dark:bg-red-500/15 dark:text-red-500 px-2.5 py-1.5',
            icon: <CircleX className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Estimate ditolak</p>
                    <p className="text-muted-foreground">Perlu revisi atau penawaran ulang</p>
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
