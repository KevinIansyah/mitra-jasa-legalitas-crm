import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import finances from '@/routes/finances';
import type { BreadcrumbItem } from '@/types';
import type { Quote } from '@/types/quote';
import CreateSection from './_components/create-section';

export default function Page() {
    const { selectedQuote, fromQuote } = usePage<{
        selectedQuote: Quote | null;
        fromQuote: boolean;
    }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Keuangan', href: '#' },
        { title: 'Quotes', href: finances.quotes.index().url },
        { title: 'Tambah', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Estimate" />
            <div className="p-4 md:p-6">
                <Heading title="Buat Estimate" description={`Buat estimasi biaya untuk ${selectedQuote ? selectedQuote.project_name : ''}`} />
                
                <CreateSection selectedQuote={selectedQuote} fromQuote={fromQuote} />
            </div>
        </AppLayout>
    );
}
