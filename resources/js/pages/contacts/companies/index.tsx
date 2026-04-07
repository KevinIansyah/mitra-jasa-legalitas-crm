import { Head, usePage } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';

import companies from '@/routes/contacts/companies';
import type { BreadcrumbItem } from '@/types';
import type { CompanySummary, CompanyWithCustomers } from '@/types/contacts';
import type { Paginator } from '@/types/paginator';
import { CompanySection } from './_components/company-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kontak',
        href: '#',
    },
    {
        title: 'Perusahaan',
        href: companies.index().url,
    },
];

export default function Page() {
    const { companies, summary, filters } = usePage<{
        companies: Paginator<CompanyWithCustomers>;
        summary: CompanySummary;
        filters: { search?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perusahaan" />
            <div className="p-4 md:p-6">
                <Heading title="Manajemen Perusahaan" description="Kelola data dan informasi perusahaan secara terpusat" />

                <CompanySection companies={companies} summary={summary} filters={filters} />
            </div>
        </AppLayout>
    );
}
