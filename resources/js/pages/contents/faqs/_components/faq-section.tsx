import { Eye, EyeOff, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Faq, FaqSummary } from '@/types/contents';
import type { Paginator } from '@/types/paginator';
import { DataTable } from './datatable';

interface FaqSectionProps {
    faqs: Paginator<Faq>;
    summary: FaqSummary;
    filters: { search?: string; per_page?: number; published?: string };
}

export function FaqSection({ faqs, summary, filters }: FaqSectionProps) {
    const { data, current_page, last_page, per_page, total } = faqs;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS = [
        {
            label: 'Total FAQ',
            value: summary.total,
            badge: 'bg-slate-500 text-white',
            icon: <HelpCircle className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Semua entri</p>
                    <p className="text-muted-foreground">Termasuk dipublikasikan & disembunyikan</p>
                </>
            ),
        },
        {
            label: 'Dipublikasikan',
            value: summary.published,
            badge: 'bg-emerald-500 text-white',
            icon: <Eye className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Tampil di situs</p>
                    <p className="text-muted-foreground">Pengunjung dapat melihat jawaban</p>
                </>
            ),
        },
        {
            label: 'Disembunyikan',
            value: summary.draft,
            badge: 'bg-amber-500 text-white',
            icon: <EyeOff className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Belum tayang</p>
                    <p className="text-muted-foreground">Disimpan sebagai draf</p>
                </>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:border-none *:data-[slot=card]:bg-sidebar *:data-[slot=card]:shadow md:grid-cols-3 *:data-[slot=card]:dark:shadow-none">
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
