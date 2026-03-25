import { CheckCircle2, Globe, MapPin, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { City, CitySummary } from '@/types/cities';
import type { Paginator } from '@/types/paginator';
import { DataTable } from './datatable';

interface CitySectionProps {
    cities: Paginator<City>;
    provinces: string[];
    summary: CitySummary;
    filters: { search?: string; status?: string; province?: string; per_page?: number };
}

export function CitySection({ cities, provinces, summary, filters }: CitySectionProps) {
    const { data, current_page, last_page, per_page, total } = cities;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS = [
        {
            label: 'Total Kota',
            value: summary.total,
            badge: 'bg-slate-500 text-white',
            icon: <MapPin className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Semua kota terdaftar</p>
                    <p className="text-muted-foreground">Seluruh data kota dalam sistem</p>
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
                    <p className="font-medium">Kota berstatus aktif</p>
                    <p className="text-muted-foreground">{summary.inactive} kota tidak aktif</p>
                </>
            ),
        },
        {
            label: 'Memiliki Layanan',
            value: summary.with_city_pages,
            badge: 'bg-blue-600 text-white',
            icon: <Globe className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Kota dengan halaman layanan</p>
                    <p className="text-muted-foreground">{summary.total - summary.with_city_pages} kota belum memiliki halaman</p>
                </>
            ),
        },
        {
            label: 'Total Provinsi',
            value: summary.total_provinces,
            badge: 'bg-purple-500 text-white',
            icon: <XCircle className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Provinsi unik yang tercakup</p>
                    <p className="text-muted-foreground">Dari seluruh kota terdaftar</p>
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
                    pageIndex={pageIndex}
                    setPageIndex={setPageIndex}
                    totalPages={last_page}
                    totalItems={total}
                    perPage={per_page}
                    provinces={provinces}
                    initialFilters={filters}
                />
            </div>
        </div>
    );
}
