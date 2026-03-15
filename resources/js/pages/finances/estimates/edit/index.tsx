import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import finances from '@/routes/finances';
import type { BreadcrumbItem } from '@/types';
import type { Estimate, Quote } from '@/types/quotes';
import EditSection from './_components/edit-section';

export default function Page() {
    const { estimate, selectedQuote, fromQuote, isEdit } = usePage<{
        estimate: Estimate;
        selectedQuote: Quote | null;
        fromQuote: boolean;
        isEdit: boolean;
    }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Keuangan', href: '#' },
        { title: 'Quotes', href: finances.quotes.index().url },
        { title: 'Edit', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Estimasi`} />
            <div className="p-4 md:p-6">
                <Heading title="Edit Estimasi" description={`Perbarui estimasi ${selectedQuote ? selectedQuote.reference_number : ''} versi ${estimate.version_label}`} />

                <EditSection estimate={estimate} selectedQuote={selectedQuote} fromQuote={fromQuote} isEdit={isEdit} />
            </div>
        </AppLayout>
    );
}
