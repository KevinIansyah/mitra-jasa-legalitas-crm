import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import services from '@/routes/services';
import type { BreadcrumbItem } from '@/types';
import type { Paginator } from '@/types/paginator';
import type { Service, ServiceCategory } from '@/types/service';
import { ServiceSection } from './_components/service-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Layanan',
        href: services.index().url,
    },
];

export default function Page() {
    const { services, categories, filters } = usePage<{
        services: Paginator<Service>;
        categories: ServiceCategory[];
        filters: { search?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Layanan" />
            <div className="p-4 md:p-6">
                <Heading title="Manajemen Layanan" description="Kelola data dan informasi layanan secara terpusat" />

                <ServiceSection services={services} categories={categories} filters={filters} />
            </div>
        </AppLayout>
    );
}
