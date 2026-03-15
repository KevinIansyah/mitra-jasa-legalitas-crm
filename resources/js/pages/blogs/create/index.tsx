import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import blogs from '@/routes/blogs';
import type { BreadcrumbItem } from '@/types';
import type { BlogCategory, BlogRelatedService, BlogTag } from '@/types/blogs';
import { CreateSection } from './_components/create-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Blog',
        href: blogs.index().url,
    },
    {
        title: 'Tambah',
        href: '#',
    },
];

export default function Page() {
    const { categories, tags, services } = usePage<{
        categories: BlogCategory[];
        tags: BlogTag[];
        services: BlogRelatedService[];
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Blog" />
            <div className="p-4 md:p-6">
                <Heading title="Tambah Blog" description="Tambahkan artikel blog baru untuk ditampilkan di website" />
                <CreateSection categories={categories} tags={tags} services={services} />
            </div>
        </AppLayout>
    );
}
