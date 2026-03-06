import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';

import type { BreadcrumbItem } from '@/types';
import CreateSection from './_components/create-section';
import finances from '@/routes/finances';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Keuangan', href: '#' },
    { title: 'Vendor', href: finances.vendors.index().url },
    { title: 'Tambah', href: '#' },
];

export default function Page() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Vendor" />
            <div className="p-4 md:p-6">
                <Heading title="Tambah Vendor" description="Daftarkan vendor atau supplier baru ke sistem" />
                <CreateSection />
            </div>
        </AppLayout>
    );
}
