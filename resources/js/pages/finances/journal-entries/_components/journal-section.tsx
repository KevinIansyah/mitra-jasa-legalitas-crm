import { BookOpen, CalendarDays, PenLine, Zap } from 'lucide-react';
import { useState } from 'react';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Account } from '@/types/accounts';
import type { JournalEntry, JournalSummary } from '@/types/journal-entries';
import type { Paginator } from '@/types/paginator';
import { DataTable } from './datatable';

interface JournalSectionProps {
    entries: Paginator<JournalEntry>;
    accounts: Account[];
    summary: JournalSummary;
    filters: { search?: string; from?: string; to?: string; reference_type?: string };
}

export function JournalSection({ entries, accounts, summary, filters }: JournalSectionProps) {
    const { data, current_page, last_page, per_page, total } = entries;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS = [
        {
            label: 'Total Jurnal',
            value: summary.total,
            badge: 'bg-secondary/50 text-white px-2.5 py-1.5',
            icon: <BookOpen className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">{summary.this_month} jurnal bulan ini</p>
                    <p className="text-muted-foreground">Seluruh entri jurnal tercatat</p>
                </>
            ),
        },
        {
            label: 'Bulan Ini',
            value: summary.this_month,
            badge: 'bg-blue-600 text-white dark:bg-blue-600/15 dark:text-blue-600 px-2.5 py-1.5',
            icon: <CalendarDays className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Entri di bulan berjalan</p>
                    <p className="text-muted-foreground">Invoice, pembayaran, pengeluaran</p>
                </>
            ),
        },
        {
            label: 'Jurnal Manual',
            value: summary.manual_count,
            badge: 'bg-violet-500 text-white dark:bg-violet-500/15 dark:text-violet-500 px-2.5 py-1.5',
            icon: <PenLine className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Dibuat secara manual</p>
                    <p className="text-muted-foreground">Penyesuaian & koreksi</p>
                </>
            ),
        },
        {
            label: 'Jurnal Otomatis',
            value: summary.auto_count,
            badge: 'bg-emerald-500 text-white dark:bg-emerald-500/15 dark:text-emerald-500 px-2.5 py-1.5',
            icon: <Zap className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Dibuat otomatis oleh sistem</p>
                    <p className="text-muted-foreground">Invoice, pembayaran, pengeluaran</p>
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
                    accounts={accounts}
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
