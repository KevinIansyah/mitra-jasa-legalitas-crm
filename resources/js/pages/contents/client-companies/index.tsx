import { Head, usePage } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';

import type { BreadcrumbItem } from '@/types';
import type { ClientCompany, ClientCompanySummary } from '@/types/contents';
import type { Paginator } from '@/types/paginator';
import { ClientCompanySection } from './_components/client-company-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Konten & SEO', href: '#' },
    { title: 'Logo Klien', href: '#' },
];

export default function Page() {
    const { client_companies, summary, filters } = usePage<{
        client_companies: Paginator<ClientCompany>;
        summary: ClientCompanySummary;
        filters: { search?: string; per_page?: number; published?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Logo Klien" />
            <div className="p-4 md:p-6">
                <Heading title="Logo Klien" description="Perusahaan yang pernah menjadi klien - nama dan logo untuk ditampilkan di situs" />

                <ClientCompanySection clientCompanies={client_companies} summary={summary} filters={filters} />
            </div>
        </AppLayout>
    );
}
