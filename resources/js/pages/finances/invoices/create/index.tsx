import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import finances from '@/routes/finances';
import type { BreadcrumbItem } from '@/types';
import type { Project } from '@/types/projects';
import CreateSection from './_components/create-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Invoice',
        href: finances.invoices.index().url,
    },
    {
        title: 'Tambah',
        href: '#',
    },
];

export default function Page() {
    const { selectedProject, fromProject } = usePage<{
        selectedProject: Project | null;
        fromProject: boolean;
    }>().props;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Invoice" />
            <div className="p-4 md:p-6">
                <Heading title="Tambah Invoice" description="Tambah invoice baru untuk penagihan project" />

                <CreateSection selectedProject={selectedProject} fromProject={fromProject} />
            </div>
        </AppLayout>
    );
}
