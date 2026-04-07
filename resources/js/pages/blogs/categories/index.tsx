import { Head, usePage } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';

import type { BreadcrumbItem } from '@/types';
import type { BlogCategory } from '@/types/blogs';
import type { Paginator } from '@/types/paginator';
import { CategorySection } from './_components/category-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Blog',
        href: '/blogs',
    },
    {
        title: 'Kategori',
        href: '#',
    },
];

export default function Page() {
    const { categories, filters } = usePage<{
        categories: Paginator<BlogCategory>;
        filters: { search?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kategori Blog" />
            <div className="p-4 md:p-6">
                <Heading title="Manajemen Kategori Blog" description="Kelola daftar kategori blog secara terpusat" />

                <CategorySection categories={categories} filters={filters} />
            </div>
        </AppLayout>
    );
}
