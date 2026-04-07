import { Head, usePage } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';

import type { BreadcrumbItem } from '@/types';
import type { Paginator } from '@/types/paginator';
import type { Quote, QuoteSummary } from '@/types/quotes';
import { QuoteSection } from './_components/quote-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Keuangan', href: '#' },
    { title: 'Permintaan Penawaran', href: '#' },
];

export default function Page() {
    const { quotes, summary, filters } = usePage<{
        quotes: Paginator<Quote>;
        summary: QuoteSummary;
        filters: { search?: string; status?: string; timeline?: string; source?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permintaan Penawaran" />
            <div className="p-4 md:p-6">
                <Heading title="Permintaan Penawaran" description="Kelola semua permintaan penawaran dari customer dan prospek" />

                <QuoteSection quotes={quotes} summary={summary} filters={filters} />
            </div>
        </AppLayout>
    );
}
