import { Globe, LayoutTemplate, Star, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Paginator } from '@/types/paginator';
import type { Service, ServiceCategory, ServiceSummary } from '@/types/service';
import { DataTable } from './datatable';

interface ServiceSectionProps {
    services: Paginator<Service>;
    categories: ServiceCategory[];
    summary: ServiceSummary;
    filters: { search?: string };
}

export function ServiceSection({ services, categories, summary, filters }: ServiceSectionProps) {
    const { data, current_page, last_page, per_page, total } = services;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS = [
        {
            label: 'Total Layanan',
            value: summary.total,
            badge: 'bg-slate-500 text-white',
            icon: <LayoutTemplate className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Semua layanan terdaftar</p>
                    <p className="text-muted-foreground">Termasuk draft & publis</p>
                </>
            ),
        },
        {
            label: 'Dipublikasi',
            value: summary.published,
            badge: 'bg-emerald-500 text-white',
            icon: <Globe className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Layanan tampil secara publik</p>
                    <p className="text-muted-foreground">{summary.total - summary.published} masih dalam draft</p>
                </>
            ),
        },
        {
            label: 'Unggulan (Featured)',
            value: summary.featured,
            badge: 'bg-blue-600 text-white',
            icon: <Star className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Layanan prioritas (bintang)</p>
                    <p className="text-muted-foreground">Tampil di halaman depan</p>
                </>
            ),
        },
        {
            label: 'Populer',
            value: summary.popular,
            badge: 'bg-rose-500 text-white',
            icon: <TrendingUp className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Layanan yang paling dicari</p>
                    <p className="text-muted-foreground">Mendapat sorotan khusus</p>
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
                <DataTable data={data} categories={categories} pageIndex={pageIndex} setPageIndex={setPageIndex} totalPages={last_page} totalItems={total} perPage={per_page} initialFilters={filters} />
            </div>
        </div>
    );
}
