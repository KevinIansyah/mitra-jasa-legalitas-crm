import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Paginator } from '@/types/paginator';
import type { ProjectInvoice, ProjectInvoiceSummary } from '@/types/project';
import { InvoiceSection } from './_components/invoice-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Keuangan', href: '#' },
    { title: 'Invoice', href: '#' },
];

export default function Page() {
    const { invoices, summary, filters } = usePage<{
        invoices: Paginator<ProjectInvoice>;
        summary: ProjectInvoiceSummary;
        filters: { search?: string; status?: string; type?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoice" />
            <div className="p-4 md:p-6">
                <Heading title="Manajemen Invoice" description="Kelola invoice project, pantau status pembayaran, dan lihat riwayat transaksi" />
                
                <InvoiceSection invoices={invoices} summary={summary} filters={filters} />
            </div>
        </AppLayout>
    );
}
