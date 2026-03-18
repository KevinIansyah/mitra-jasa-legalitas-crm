import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import finances from '@/routes/finances';
import type { BreadcrumbItem } from '@/types';
import type { Customer } from '@/types/contacts';
import type { Estimate } from '@/types/estimates';
import type { Proposal } from '@/types/proposals';
import type { Quote } from '@/types/quotes';
import EditSection from './_components/edit-section';

export default function Page() {
    const { estimate, selectedQuote, fromQuote, selectedProposal, fromProposal, selectedCustomer, isEdit } = usePage<{
        estimate: Estimate;
        selectedQuote: Quote | null;
        fromQuote: boolean;
        selectedProposal: Proposal | null;
        fromProposal: boolean;
        selectedCustomer: Customer | null;
        isEdit: boolean;
    }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Keuangan', href: '#' },
        { title: 'Estimates', href: finances.estimates.index().url },
        { title: 'Edit', href: '#' },
    ];

    const description = fromQuote
        ? `Perbarui estimasi ${selectedQuote?.reference_number ?? ''} versi ${estimate.version_label}`
        : fromProposal
          ? `Perbarui estimasi proposal ${selectedProposal?.proposal_number ?? ''} versi ${estimate.version_label}`
          : `Perbarui estimasi ${estimate.estimate_number} versi ${estimate.version_label}`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Estimasi" />
            <div className="p-4 md:p-6">
                <Heading title="Edit Estimasi" description={description} />
                <EditSection
                    estimate={estimate}
                    selectedQuote={selectedQuote}
                    fromQuote={fromQuote}
                    selectedProposal={selectedProposal}
                    fromProposal={fromProposal}
                    selectedCustomer={selectedCustomer}
                    isEdit={isEdit}
                />
            </div>
        </AppLayout>
    );
}
