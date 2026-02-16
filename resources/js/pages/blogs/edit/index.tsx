import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import services from '@/routes/services';
import type { BreadcrumbItem } from '@/types';
import type { Service, ServiceCategory } from '@/types/service';
import { EditSection } from './_components/edit-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Layanan',
        href: services.index().url,
    },
    {
        title: 'Edit',
        href: '#',
    },
];

export default function Page() {
    const { service, categories } = usePage<{
        service: Service;
        categories: ServiceCategory[];
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Layanan" />
            <div className="p-4 md:p-6">
                <Heading title="Edit Layanan" description="Perbarui informasi dan pengaturan layanan yang sudah ada." />

                <EditSection service={service} categories={categories} />
            </div>
        </AppLayout>
    );
}
