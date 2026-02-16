import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Project',
        href: '#',
    },
];

export default function Page() {
    // const { services, categories, filters } = usePage<{
    //     services: Paginator<Service>;
    //     categories: ServiceCategory[];
    //     filters: { search?: string };
    // }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Project" />
            <div className="p-4 md:p-6">
                <Heading title="Manajemen Project" description="Kelola data dan informasi project secara terpusat" />

                {/* <ServiceSection services={services} categories={categories} filters={filters} /> */}
            </div>
        </AppLayout>
    );
}
