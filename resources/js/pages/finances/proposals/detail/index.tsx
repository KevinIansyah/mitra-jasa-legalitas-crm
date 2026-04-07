import { Head, usePage } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';

import finances from '@/routes/finances';
import type { BreadcrumbItem } from '@/types';
import type { Proposal } from '@/types/proposals';
import type { SiteSetting } from '@/types/site-setting';
import { DetailSection } from './_components/detail-section';

export default function Page() {
    const { proposal, settings } = usePage<{
        proposal: Proposal;
        settings: SiteSetting;
    }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Keuangan', href: '#' },
        { title: 'Proposal', href: finances.proposals.index().url },
        { title: 'Detail', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Proposal ${proposal.proposal_number}`} />
            <div className="p-4 md:p-6">
                <Heading
                    title={`Detail Proposal ${proposal.proposal_number}`}
                    description="Lihat detail proposal, termasuk informasi klien dan rincian layanan"
                />
                <DetailSection proposal={proposal} settings={settings} />
            </div>
        </AppLayout>
    );
}