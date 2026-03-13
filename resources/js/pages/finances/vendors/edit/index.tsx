import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import finances from '@/routes/finances';
import type { BreadcrumbItem } from '@/types';
import type { Vendor } from '@/types/vendors';
import EditSection from './_components/edit-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Keuangan', href: '#' },
    { title: 'Vendor', href: finances.vendors.index().url },
    { title: 'Edit', href: '#' },
];

export default function Page() {
    const { vendor, isEdit } = usePage<{ vendor: Vendor; isEdit: boolean }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Vendor - ${vendor.name}`} />
            <div className="p-4 md:p-6">
                <Heading title={`Edit Vendor`} description={`Perbarui data vendor ${vendor.name}`} />
                
                <EditSection vendor={vendor} isEdit={isEdit} />
            </div>
        </AppLayout>
    );
}
