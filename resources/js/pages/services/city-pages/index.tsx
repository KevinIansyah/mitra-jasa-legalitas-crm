import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import services from '@/routes/services';
import type { BreadcrumbItem } from '@/types';
import type { City } from '@/types/cities';
import type { Paginator } from '@/types/paginator';
import type { Service, ServiceCityPage, ServiceCityPageSummary } from '@/types/service';
import { CityPageSection } from './_components/city-pages-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Layanan', href: services.index().url },
    { title: 'Halaman Kota', href: services.cityPages.index().url },
];

export default function Page() {
    const {
        cityPages,
        summary,
        services: serviceList,
        cities,
        filters,
    } = usePage<{
        cityPages: Paginator<ServiceCityPage>;
        summary: ServiceCityPageSummary;
        services: Pick<Service, 'id' | 'name'>[];
        cities: Pick<City, 'id' | 'name' | 'province'>[];
        filters: Record<string, string>;
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Halaman Kota" />
            <div className="p-4 md:p-6">
                <Heading title="Halaman Kota" description="Kelola halaman layanan per kota untuk optimasi SEO lokal." />

                <CityPageSection cityPages={cityPages} summary={summary} services={serviceList} cities={cities} filters={filters} />
            </div>
        </AppLayout>
    );
}
