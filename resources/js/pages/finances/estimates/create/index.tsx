import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import finances from '@/routes/finances';
import type { BreadcrumbItem } from '@/types';
import type { Proposal } from '@/types/proposals';
import type { Quote } from '@/types/quotes';
import CreateSection from './_components/create-section';

export default function Page() {
    const { selectedQuote, fromQuote, selectedProposal, fromProposal } = usePage<{
        selectedQuote: Quote | null;
        fromQuote: boolean;
        selectedProposal: Proposal | null;
        fromProposal: boolean;
    }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Keuangan', href: '#' },
        { title: 'Estimates', href: finances.estimates.index().url },
        { title: 'Tambah', href: '#' },
    ];

    const description = fromQuote
        ? `Buat estimasi biaya untuk ${selectedQuote?.project_name ?? ''}`
        : fromProposal
          ? `Buat estimasi biaya untuk proposal ${selectedProposal?.proposal_number ?? ''}`
          : 'Buat estimasi biaya untuk customer';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Estimate" />
            <div className="p-4 md:p-6">
                <Heading title="Buat Estimate" description={description} />
                <CreateSection selectedQuote={selectedQuote} fromQuote={fromQuote} selectedProposal={selectedProposal} fromProposal={fromProposal} />
            </div>
        </AppLayout>
    );
}
