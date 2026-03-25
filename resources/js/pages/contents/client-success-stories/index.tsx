import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { ClientSuccessStory, ClientSuccessStorySummary } from '@/types/contents';
import type { Paginator } from '@/types/paginator';
import { StorySection } from './_components/story-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Konten & SEO', href: '#' },
    { title: 'Kisah Sukses Klien', href: '#' },
];

export default function Page() {
    const { stories, summary, filters } = usePage<{
        stories: Paginator<ClientSuccessStory>;
        summary: ClientSuccessStorySummary;
        filters: { search?: string; per_page?: number; published?: string; industry?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kisah Sukses Klien" />
            <div className="p-4 md:p-6">
                <Heading title="Kisah Sukses Klien" description="Studi kasus, metrik, dan dampak untuk ditampilkan di situs" />

                <StorySection stories={stories} summary={summary} filters={filters} />
            </div>
        </AppLayout>
    );
}
