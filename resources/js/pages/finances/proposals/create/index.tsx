import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';

import finances from '@/routes/finances';
import type { BreadcrumbItem } from '@/types';
import CreateSection from './_components/create-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Keuangan', href: '#' },
    { title: 'Proposals', href: finances.proposals.index().url },
    { title: 'Tambah', href: '#' },
];

export default function Page() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Proposal" />
            <div className="p-4 md:p-6">
                <Heading title="Buat Proposal" description="Buat proposal penawaran untuk customer" />
                
                <CreateSection />
            </div>
        </AppLayout>
    );
}
