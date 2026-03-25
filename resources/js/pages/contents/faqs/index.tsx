import { Head, usePage } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Faq, FaqSummary } from '@/types/contents';
import type { Paginator } from '@/types/paginator';

import { FaqSection } from './_components/faq-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Konten & SEO', href: '#' },
    { title: 'FAQ', href: '#' },
];

export default function Page() {
    const { faqs, summary, filters } = usePage<{
        faqs: Paginator<Faq>;
        summary: FaqSummary;
        filters: { search?: string; per_page?: number; published?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="FAQ" />
            <div className="p-4 md:p-6">
                <Heading title="Manajemen FAQ" description="Kelola pertanyaan dan jawaban yang ditampilkan di situs" />

                <FaqSection faqs={faqs} summary={summary} filters={filters} />
            </div>
        </AppLayout>
    );
}
