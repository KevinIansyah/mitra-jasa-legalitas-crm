import { FileSearch, Globe, PenLine, Rocket } from 'lucide-react';
import { useState } from 'react';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { City } from '@/types/cities';
import type { Paginator } from '@/types/paginator';
import type { Service, ServiceCityPage, ServiceCityPageSummary } from '@/types/service';
import { DataTable } from './datatable';

interface CityPageSectionProps {
    cityPages: Paginator<ServiceCityPage>;
    summary: ServiceCityPageSummary;
    services: Pick<Service, 'id' | 'name'>[];
    cities: Pick<City, 'id' | 'name' | 'province'>[];
    filters: Record<string, string>;
}

export function CityPageSection({ cityPages, summary, services, cities, filters }: CityPageSectionProps) {
    const { data, current_page, last_page, per_page, total } = cityPages;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS = [
        {
            label: 'Total Halaman',
            value: summary.total,
            badge: 'bg-slate-500 text-white',
            icon: <FileSearch className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Semua halaman kota</p>
                    <p className="text-muted-foreground">Termasuk draft & publish</p>
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
                    <p className="font-medium">Halaman tampil publik</p>
                    <p className="text-muted-foreground">{summary.total - summary.published} masih draft</p>
                </>
            ),
        },
        {
            label: 'AI Generated',
            value: summary.ai_generated,
            badge: 'bg-purple-500 text-white',
            icon: <Rocket className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Konten hasil generate AI</p>
                    <p className="text-muted-foreground">Siap review & publish</p>
                </>
            ),
        },
        {
            label: 'Draft',
            value: summary.draft,
            badge: 'bg-amber-500 text-white',
            icon: <PenLine className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Belum ada konten</p>
                    <p className="text-muted-foreground">Perlu di-generate atau diisi</p>
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
                    services={services}
                    cities={cities}
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
