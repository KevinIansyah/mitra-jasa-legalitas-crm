import { Head, usePage } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';

import type { BreadcrumbItem } from '@/types';
import type { BlogTag } from '@/types/blogs';
import type { Paginator } from '@/types/paginator';
import { TagSection } from './_components/category-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Blog',
        href: '/blogs',
    },
    {
        title: 'Tag',
        href: '#',
    },
];

export default function Page() {
    const { tags, filters } = usePage<{
        tags: Paginator<BlogTag>;
        filters: { search?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tag Blog" />
            <div className="p-4 md:p-6">
                <Heading title="Manajemen Tag Blog" description="Kelola daftar tag blog secara terpusat" />

                <TagSection tags={tags} filters={filters} />
            </div>
        </AppLayout>
    );
}
