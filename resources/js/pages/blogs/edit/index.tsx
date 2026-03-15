import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import blogs from '@/routes/blogs';
import type { BreadcrumbItem } from '@/types';
import type { Blog, BlogCategory, BlogRelatedService, BlogTag } from '@/types/blogs';
import { EditSection } from './_components/edit-section';

export default function Page() {
    const { blog, categories, tags, services } = usePage<{
        blog: Blog;
        categories: BlogCategory[];
        tags: BlogTag[];
        services: BlogRelatedService[];
    }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Blog',
            href: blogs.index().url,
        },
        {
            title: blog.title ?? 'Edit',
            href: '#',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Blog - ${blog.title}`} />
            <div className="p-4 md:p-6">
                <Heading title="Edit Blog" description={`Mengedit blog: ${blog.title}`} />
                <EditSection blog={blog} categories={categories} tags={tags} services={services} />
            </div>
        </AppLayout>
    );
}
