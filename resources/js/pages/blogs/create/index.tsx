import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import services from '@/routes/services';
import type { BreadcrumbItem } from '@/types';
import type { ServiceCategory } from '@/types/service';
import { CreateSection } from './_components/create-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Layanan',
        href: services.index().url,
    },
    {
        title: 'Tambah',
        href: '#',
    },
];

export default function Page() {
    const { categories } = usePage<{
        categories: ServiceCategory[];
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Layanan" />
            <div className="p-4 md:p-6">
                <Heading title="Tambah Layanan" description="Tambahkan layanan baru untuk ditampilkan di sistem" />

                <CreateSection categories={categories} />
            </div>
        </AppLayout>
    );
}
