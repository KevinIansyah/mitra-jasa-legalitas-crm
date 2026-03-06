import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';

import type { BreadcrumbItem } from '@/types';
import type { Project } from '@/types/project';
import CreateSection from './_components/create-section';
import invoices from '@/routes/finances/invoices';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Invoice',
        href: invoices.index().url,
    },
    {
        title: 'Tambah',
        href: '#',
    },
];

export default function Page() {
    const { projects, selectedProject, fromProject } = usePage<{
        projects: Project[];
        selectedProject: Project | null;
        fromProject: boolean;
    }>().props;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Invoice" />
            <div className="p-4 md:p-6">
                <Heading title="Tambah Invoice" description="Tambah invoice baru untuk penagihan project" />

                <CreateSection projects={projects} selectedProject={selectedProject} fromProject={fromProject} />
            </div>
        </AppLayout>
    );
}
