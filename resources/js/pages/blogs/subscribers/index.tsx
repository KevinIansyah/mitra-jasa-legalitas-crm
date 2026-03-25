import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import blogs from '@/routes/blogs';
import type { BreadcrumbItem } from '@/types';
import type { BlogSubscriber, BlogSubscriberSummary } from '@/types/blogs';
import type { Paginator } from '@/types/paginator';
import { BlogSubscriberSection } from './_components/subscriber-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Blog',
        href: '#',
    },
    {
        title: 'Subscriber',
        href: blogs.subscribers.index().url,
    },
];

export default function Page() {
    const { subscribers, summary, filters } = usePage<{
        subscribers: Paginator<BlogSubscriber>;
        summary: BlogSubscriberSummary;
        filters: { search?: string; verified?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscriber Blog" />
            <div className="p-4 md:p-6">
                <Heading title="Subscriber Blog" description="Daftar email yang berlangganan notifikasi artikel blog dan status verifikasi" />

                <BlogSubscriberSection subscribers={subscribers} summary={summary} filters={filters} />
            </div>
        </AppLayout>
    );
}
