import { Head, usePage } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';

import finances from '@/routes/finances';
import type { BreadcrumbItem } from '@/types';
import type { Customer } from '@/types/contacts';
import type { Proposal } from '@/types/proposals';
import EditSection from './_components/edit-section';

export default function Page() {
    const { proposal, selectedCustomer, isEdit } = usePage<{
        proposal: Proposal;
        selectedCustomer: Customer | null;
        isEdit: boolean;
    }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Keuangan', href: '#' },
        { title: 'Proposals', href: finances.proposals.index().url },
        { title: 'Edit', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Proposal" />
            <div className="p-4 md:p-6">
                <Heading title="Edit Proposal" description={`Perbarui proposal ${proposal.proposal_number}`} />
                
                <EditSection proposal={proposal} selectedCustomer={selectedCustomer} isEdit={isEdit} />
            </div>
        </AppLayout>
    );
}
