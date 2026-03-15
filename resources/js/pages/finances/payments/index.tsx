import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Paginator } from '@/types/paginator';
import type { ProjectPayment } from '@/types/projects';
import { PaymentSection } from './_components/payment-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Keuangan', href: '#' },
    { title: 'Pembayaran', href: '#' },
];

export type PaymentSummary = {
    total: number;
    pending: number;
    verified: number;
    rejected: number;
    total_amount: string;
    verified_amount: string;
};

export default function Page() {
    const { payments, summary, filters } = usePage<{
        payments: Paginator<ProjectPayment>;
        summary: PaymentSummary;
        filters: { search?: string; status?: string; payment_method?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pembayaran" />
            <div className="p-4 md:p-6">
                <Heading title="Manajemen Pembayaran" description="Pantau dan verifikasi pembayaran dari seluruh invoice project" />

                <PaymentSection payments={payments} summary={summary} filters={filters} />
            </div>
        </AppLayout>
    );
}
