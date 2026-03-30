import { Building2, CheckCircle, Tags, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Paginator } from '@/types/paginator';

import type { Vendor } from '@/types/vendors';
import type { VendorSummary } from '../index';
import { DataTable } from './datatable';

interface VendorSectionProps {
    vendors: Paginator<Vendor>;
    summary: VendorSummary;
    filters: { search?: string; category?: string; status?: string };
}

export function VendorSection({ vendors, summary, filters }: VendorSectionProps) {
    const { data, current_page, last_page, per_page, total } = vendors;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS = [
        {
            label: 'Total Vendor',
            value: summary.total,
            badge: 'bg-secondary/50 text-white px-2.5 py-1.5',
            icon: <Building2 className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Seluruh vendor terdaftar</p>
                    <p className="text-muted-foreground">Aktif dan nonaktif</p>
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
                    <p className="font-medium">Vendor aktif</p>
                    <p className="text-muted-foreground">Dapat digunakan pada transaksi</p>
                </>
            ),
        },
        {
            label: 'Nonaktif',
            value: summary.inactive,
            badge: 'bg-secondary/50 text-white dark:bg-secondary/50 dark:text-secondary-foreground px-2.5 py-1.5',
            icon: <XCircle className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Vendor dinonaktifkan</p>
                    <p className="text-muted-foreground">Tidak tersedia untuk transaksi baru</p>
                </>
            ),
        },
        {
            label: 'Kategori',
            value: 9,
            badge: 'bg-indigo-500 text-white dark:bg-indigo-500/15 dark:text-indigo-500 px-2.5 py-1.5',
            icon: <Tags className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Kategori vendor</p>
                    <p className="text-muted-foreground">Jenis layanan atau penyedia</p>
                </>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:border-none *:data-[slot=card]:bg-sidebar *:data-[slot=card]:shadow md:grid-cols-4 *:data-[slot=card]:dark:shadow-none">
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
