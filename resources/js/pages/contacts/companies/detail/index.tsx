import { Head, usePage } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';

import companies from '@/routes/contacts/companies';
import type { BreadcrumbItem } from '@/types';
import { type CompanyFinanceSummary, type CompanyWithCustomers } from '@/types/contacts';
import type { Paginator } from '@/types/paginator';
import type { Project } from '@/types/projects';
import { DetailSection } from './_components/detail-section';

export default function Page() {
    const { company, projects, finance_summary } = usePage<{
        company: CompanyWithCustomers;
        projects: Paginator<Project>;
        finance_summary: CompanyFinanceSummary | null;
    }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Kontak', href: '#' },
        { title: 'Perusahaan', href: companies.index().url },
        { title: 'detail', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Perusahaan" />
            <div className="p-4 md:p-6">
                <Heading title={`Detail Perusahaan ${company.name}`} description="Profil perusahaan, keuangan agregat, PIC, dan riwayat project." />

                <DetailSection company={company} projects={projects} finance_summary={finance_summary} />
            </div>
        </AppLayout>
    );
}
