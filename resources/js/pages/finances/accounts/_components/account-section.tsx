import { BookOpen, CheckCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Account, AccountSummary } from '@/types/accounts';
import type { Paginator } from '@/types/paginator';
import { DataTable } from './datatable';

interface AccountSectionProps {
    accounts: Paginator<Account>;
    summary: AccountSummary;
    filters: { search?: string; type?: string; status?: string };
}

export function AccountSection({ accounts, summary, filters }: AccountSectionProps) {
    const { data, current_page, last_page, per_page, total } = accounts;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS = [
        {
            label: 'Total Akun',
            value: summary.total,
            badge: 'bg-secondary/50 text-white',
            icon: <BookOpen className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Semua akun terdaftar</p>
                    <p className="text-muted-foreground">Aktif & tidak aktif</p>
                </>
            ),
        },
        {
            label: 'Aktif',
            value: summary.active,
            badge: 'bg-emerald-500 text-white dark:bg-emerald-500/15 dark:text-emerald-500 px-2.5 py-1.5',
            icon: <CheckCircle className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Akun siap digunakan</p>
                    <p className="text-muted-foreground">{summary.inactive} tidak aktif</p>
                </>
            ),
        },
        {
            label: 'Pendapatan',
            value: summary.revenue,
            badge: 'bg-emerald-600 text-white dark:bg-emerald-600/15 dark:text-emerald-600 px-2.5 py-1.5',
            icon: <TrendingUp className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">{summary.asset} akun aset</p>
                    <p className="text-muted-foreground">
                        {summary.liability} kewajiban · {summary.equity} ekuitas
                    </p>
                </>
            ),
        },
        {
            label: 'Beban',
            value: summary.expense,
            badge: 'bg-orange-500 text-white dark:bg-orange-500/15 dark:text-orange-500 px-2.5 py-1.5',
            icon: <TrendingDown className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Akun biaya operasional</p>
                    <p className="text-muted-foreground">Pencatatan pengeluaran</p>
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
