import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Paginator } from '@/types/paginator';
import type { Vendor } from '@/types/vendors';
import { VendorSection } from './_components/vendor-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Keuangan', href: '#' },
    { title: 'Vendor', href: '#' },
];

export type VendorSummary = {
    total: number;
    active: number;
    inactive: number;
};

export default function Page() {
    const { vendors, summary, filters } = usePage<{
        vendors: Paginator<Vendor>;
        summary: VendorSummary;
        filters: { search?: string; category?: string; status?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vendor" />
            <div className="p-4 md:p-6">
                <Heading title="Manajemen Vendor" description="Kelola daftar vendor dan supplier yang digunakan dalam project" />

                <VendorSection vendors={vendors} summary={summary} filters={filters} />
            </div>
        </AppLayout>
    );
}
