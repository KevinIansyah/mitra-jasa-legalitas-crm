import { FileCheck, FileClock, FileX, Files } from 'lucide-react';
import { useState } from 'react';

import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Paginator } from '@/types/paginator';
import type { Quote, QuoteSummary } from '@/types/quotes';
import { DataTable } from './datatable';

interface QuoteSectionProps {
    quotes: Paginator<Quote>;
    summary: QuoteSummary;
    filters: { search?: string; status?: string; timeline?: string; source?: string };
}

export function QuoteSection({ quotes, summary, filters }: QuoteSectionProps) {
    const { data, current_page, last_page, per_page, total } = quotes;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS = [
        {
            label: 'Total Permintaan',
            value: summary.total,
            badge: 'bg-slate-500 text-white',
            icon: <Files className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Semua permintaan penawaran terdaftar</p>
                    <p className="text-muted-foreground">{summary.converted} dikonversi ke project</p>
                </>
            ),
        },
        {
            label: 'Menunggu',
            value: summary.pending,
            badge: 'bg-yellow-500 text-white',
            icon: <FileClock className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Belum diproses</p>
                    <p className="text-muted-foreground">Perlu tindak lanjut segera</p>
                </>
            ),
        },
        {
            label: 'Diterima',
            value: summary.accepted,
            badge: 'bg-emerald-500 text-white',
            icon: <FileCheck className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Quote disetujui</p>
                    <p className="text-muted-foreground">Siap dikonversi ke project</p>
                </>
            ),
        },
        {
            label: 'Ditolak',
            value: summary.rejected,
            badge: 'bg-red-500 text-white',
            icon: <FileX className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Quote tidak dilanjutkan</p>
                    <p className="text-muted-foreground">{summary.contacted} sedang dihubungi</p>
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
