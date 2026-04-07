import { Building2, Star } from 'lucide-react';
import { useState } from 'react';

import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import type { ClientCompany, ClientCompanySummary } from '@/types/contents';
import type { Paginator } from '@/types/paginator';
import { DataTable } from './datatable';

type ClientCompanySectionProps = {
    clientCompanies: Paginator<ClientCompany>;
    summary: ClientCompanySummary;
    filters: { search?: string; per_page?: number; published?: string };
}

export function ClientCompanySection({ clientCompanies, summary, filters }: ClientCompanySectionProps) {
    const { data, current_page, last_page, per_page, total } = clientCompanies;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS = [
        {
            label: 'Total',
            value: summary.total,
            badge: 'bg-secondary/50 text-white px-2.5 py-1.5',
            icon: <Building2 className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Semua entri</p>
                    <p className="text-muted-foreground">Termasuk dipublikasikan & draf</p>
                </>
            ),
        },
        {
            label: 'Dipublikasikan',
            value: summary.published,
            badge: 'bg-emerald-500 text-white dark:bg-emerald-500/15 dark:text-emerald-500 px-2.5 py-1.5',
            icon: <Star className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Tampil di situs</p>
                    <p className="text-muted-foreground">Logo ditampilkan ke pengunjung</p>
                </>
            ),
        },
        {
            label: 'Draf',
            value: summary.draft,
            badge: 'bg-amber-500 text-white dark:bg-amber-500/15 dark:text-amber-500 px-2.5 py-1.5',
            icon: <Star className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Belum tayang</p>
                    <p className="text-muted-foreground">Disembunyikan sementara</p>
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
                <DataTable
                    data={data}
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
