import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import templates from '@/routes/projects/templates';
import type { BreadcrumbItem } from '@/types';
import type { Service } from '@/types/service';
import { CreateSection } from './_components/create-section';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Template Project',
        href: templates.index().url,
    },
    {
        title: 'Tambah',
        href: '#',
    },
];

export default function Page() {
    const { services } = usePage<{
        services: Service[];
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Template Project" />
            <div className="p-4 md:p-6">
                <Heading title="Tambah Template Project" description="Buat template baru untuk mempercepat pembuatan project" />

                <CreateSection services={services} />
            </div>
        </AppLayout>
    );
}
