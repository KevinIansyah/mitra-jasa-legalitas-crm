import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import blogs from '@/routes/blogs';
import type { BreadcrumbItem } from '@/types';
import type { Blog, BlogCategory, BlogSummary } from '@/types/blogs';
import type { Paginator } from '@/types/paginator';
import { BlogSection } from './_components/blog-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Blog',
        href: blogs.index().url,
    },
];

export default function Page() {
    const { blogs: blogsData, categories, summary, filters } = usePage<{
        blogs: Paginator<Blog>;
        categories: BlogCategory[];
        summary: BlogSummary;
        filters: { search?: string; category?: string; is_published?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Blog" />
            <div className="p-4 md:p-6">
                <Heading title="Manajemen Blog" description="Kelola data dan informasi blog secara terpusat" />
                <BlogSection blogs={blogsData} categories={categories} summary={summary} filters={filters} />
            </div>
        </AppLayout>
    );
}
