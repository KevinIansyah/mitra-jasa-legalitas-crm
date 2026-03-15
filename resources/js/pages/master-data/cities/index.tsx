import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';

import citiesRoute from '@/routes/master-data/cities';
import type { BreadcrumbItem } from '@/types';
import type { City, CitySummary } from '@/types/cities';
import type { Paginator } from '@/types/paginator';
import { CitySection } from './_compnents/city-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Master Data',
        href: '#',
    },
    {
        title: 'Kota',
        href: citiesRoute.index().url,
    },
];

export default function Page() {
    const { cities, provinces, summary, filters } = usePage<{
        cities: Paginator<City>;
        provinces: string[];
        summary: CitySummary;
        filters: { search?: string; status?: string; province?: string; per_page?: number };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kota" />
            <div className="p-4 md:p-6">
                <Heading title="Manajemen Kota" description="Kelola data kota untuk halaman layanan secara terpusat" />
                <CitySection cities={cities} provinces={provinces} summary={summary} filters={filters} />
            </div>
        </AppLayout>
    );
}
