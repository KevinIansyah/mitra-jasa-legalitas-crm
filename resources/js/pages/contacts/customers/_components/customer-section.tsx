import { Building2, CheckCircle2, UserCheck, Users } from 'lucide-react';
import { useState } from 'react';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Customer, CustomerSummary } from '@/types/contacts';
import type { Paginator } from '@/types/paginator';
import { DataTable } from './datatable';

interface CustomerSectionProps {
    customers: Paginator<Customer>;
    summary: CustomerSummary;
    filters: { search?: string };
}

export function CustomerSection({ customers, summary, filters }: CustomerSectionProps) {
    const { data, current_page, last_page, per_page, total } = customers;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS = [
        {
            label: 'Total Pelanggan',
            value: summary.total,
            badge: 'bg-slate-500 text-white',
            icon: <Users className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Semua pelanggan terdaftar</p>
                    <p className="text-muted-foreground">Seluruh data pelanggan</p>
                </>
            ),
        },
        {
            label: 'Aktif',
            value: summary.active,
            badge: 'bg-emerald-500 text-white',
            icon: <CheckCircle2 className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Pelanggan berstatus aktif</p>
                    <p className="text-muted-foreground">{summary.total - summary.active} tidak aktif</p>
                </>
            ),
        },
        {
            label: 'Memiliki Akun',
            value: summary.with_account,
            badge: 'bg-blue-600 text-white',
            icon: <UserCheck className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Terhubung dengan akun sistem</p>
                    <p className="text-muted-foreground">{summary.total - summary.with_account} belum terdaftar</p>
                </>
            ),
        },
        {
            label: 'Terhubung Perusahaan',
            value: summary.with_company,
            badge: 'bg-purple-500 text-white',
            icon: <Building2 className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Pelanggan dengan perusahaan (PIC)</p>
                    <p className="text-muted-foreground">{summary.total - summary.with_company} belum terhubung</p>
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
