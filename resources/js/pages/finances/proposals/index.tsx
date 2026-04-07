import { Head, usePage } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';

import finances from '@/routes/finances';
import type { BreadcrumbItem } from '@/types';
import type { Paginator } from '@/types/paginator';
import type { Proposal, ProposalSummaryData } from '@/types/proposals';
import { ProposalSection } from './_components/proposal-section';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Proposals', href: finances.proposals.index().url }];

export default function Page() {
    const { proposals, summary, filters } = usePage<{
        proposals: Paginator<Proposal>;
        summary: ProposalSummaryData;
        filters: { search?: string; status?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Proposals" />
            <div className="p-4 md:p-6">
                <Heading title="Proposals" description="Kelola semua proposal penawaran ke customer" />
                <ProposalSection proposals={proposals} summary={summary} filters={filters} />
            </div>
        </AppLayout>
    );
}
