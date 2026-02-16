import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import services from '@/routes/services';
import type { BreadcrumbItem } from '@/types';
import type { Paginator } from '@/types/paginator';
import type { ServiceCategory } from '@/types/service';
import { CategorySection } from './_components/category-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Layanan',
        href: services.index().url,
    },
    {
        title: 'Kategori',
        href: '#',
    },
];

export default function Page() {
    const { categories, filters } = usePage<{
        categories: Paginator<ServiceCategory>;
        filters: { search?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kategori Layanan" />
            <div className="p-4 md:p-6">
                <Heading title="Manajemen Kategori Layanan" description="Kelola daftar kategori layanan secara terpusat" />

                <CategorySection categories={categories} filters={filters} />
            </div>
        </AppLayout>
    );
}
