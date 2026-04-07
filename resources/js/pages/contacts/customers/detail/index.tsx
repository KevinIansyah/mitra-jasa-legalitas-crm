import { Head, usePage } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';

import customers from '@/routes/contacts/customers';
import type { BreadcrumbItem } from '@/types';
import { type CompanyFinanceSummary, type CustomersWithCompanies } from '@/types/contacts';
import type { Paginator } from '@/types/paginator';
import type { Project } from '@/types/projects';
import { DetailSection } from './_components/detail-section';

export default function Page() {
    const { customer, projects, finance_summary } = usePage<{
        customer: CustomersWithCompanies;
        projects: Paginator<Project>;
        finance_summary: CompanyFinanceSummary | null;
    }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Kontak', href: '#' },
        { title: 'Pelanggan', href: customers.index().url },
        { title: 'detail', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Pelanggan" />
            <div className="p-4 md:p-6">
                <Heading title={`Detail Pelanggan ${customer.name}`} description="Profil pelanggan, keuangan agregat, perusahaan terhubung, dan riwayat project." />

                <DetailSection customer={customer} projects={projects} finance_summary={finance_summary} />
            </div>
        </AppLayout>
    );
}
