import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import projects from '@/routes/projects';
import type { BreadcrumbItem } from '@/types';
import type { Service } from '@/types/service';
import { CreateSection } from './_components/create-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Project',
        href: projects.index().url,
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
            <Head title="Tambah Project" />
            <div className="p-4 md:p-6">
                <Heading title="Tambah Project" description="Tambahkan project untuk memulai pekerjaan baru" />

                <CreateSection services={services} />
            </div>
        </AppLayout>
    );
}
