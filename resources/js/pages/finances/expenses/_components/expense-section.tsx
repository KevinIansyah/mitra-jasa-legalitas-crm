import { CircleDollarSign, Receipt, ReceiptText, Wallet } from 'lucide-react';
import { useState } from 'react';

import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { formatRupiah } from '@/lib/service';
import type { Expense } from '@/types/expenses';
import type { Paginator } from '@/types/paginator';
import type { ExpenseSummary } from '../index';
import { DataTable } from './datatable';

type ExpenseSectionProps = {
    expenses: Paginator<Expense>;
    summary: ExpenseSummary;
    filters: { search?: string; category?: string; is_billable?: string; is_billed?: string };
}

export function ExpenseSection({ expenses, summary, filters }: ExpenseSectionProps) {
    const { data, current_page, last_page, per_page, total } = expenses;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS = [
        {
            label: 'Total Pengeluaran',
            value: summary.total,
            badge: 'bg-secondary/50 text-white px-2.5 py-1.5',
            icon: <Receipt className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">{formatRupiah(Number(summary.total_amount))} total</p>
                    <p className="text-muted-foreground">Seluruh pengeluaran tercatat</p>
                </>
            ),
        },
        {
            label: 'Dapat Ditagihkan',
            value: formatRupiah(Number(summary.billable_amount)),
            badge: 'bg-blue-600 text-white dark:bg-blue-600/15 dark:text-blue-600 px-2.5 py-1.5',
            icon: <ReceiptText className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Pengeluaran billable</p>
                    <p className="text-muted-foreground">Dapat dibebankan ke klien</p>
                </>
            ),
        },
        {
            label: 'Sudah Ditagihkan',
            value: formatRupiah(Number(summary.billed_amount)),
            badge: 'bg-emerald-500 text-white dark:bg-emerald-500/15 dark:text-emerald-500 px-2.5 py-1.5',
            icon: <CircleDollarSign className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Terhubung ke invoice</p>
                    <p className="text-muted-foreground">Sudah masuk tagihan klien</p>
                </>
            ),
        },
        {
            label: 'Belum Ditagihkan',
            value: summary.unbilled_count,
            badge: 'bg-yellow-500 text-white dark:bg-yellow-500/15 dark:text-yellow-500 px-2.5 py-1.5',
            icon: <Wallet className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Item menunggu ditagihkan</p>
                    <p className="text-muted-foreground">Perlu dimasukkan ke invoice</p>
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
                            <CardTitle className="text-2xl font-semibold tabular-nums">{value}</CardTitle>
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
