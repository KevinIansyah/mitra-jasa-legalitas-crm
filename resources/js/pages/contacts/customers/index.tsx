import { Head, usePage } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';

import customers from '@/routes/contacts/customers';
import type { BreadcrumbItem } from '@/types';
import type { Customer, CustomerSummary } from '@/types/contacts';
import type { Paginator } from '@/types/paginator';
import { CustomerSection } from './_components/customer-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kontak',
        href: '#',
    },
    {
        title: 'Pelanggan',
        href: customers.index().url,
    },
];

export default function Page() {
    const { customers, summary, filters } = usePage<{
        customers: Paginator<Customer>;
        summary: CustomerSummary;
        filters: { search?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pelanggan" />
            <div className="p-4 md:p-6">
                <Heading title="Manajemen Pelanggan" description="Kelola data dan informasi pelanggan secara terpusat" />

                <CustomerSection customers={customers} summary={summary} filters={filters} />
            </div>
        </AppLayout>
    );
}
