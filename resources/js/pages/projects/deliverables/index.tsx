import { Head, usePage } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';

import projects from '@/routes/projects';
import type { BreadcrumbItem } from '@/types';
import type { Paginator } from '@/types/paginator';
import type { ProjectDeliverable, ProjectDeliverableSummary } from '@/types/projects';
import { DeliverableSection } from './_components/deliverable-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Project',
        href: projects.index().url,
    },
    {
        title: 'Hasil Akhir',
        href: '#',
    },
];

export default function Page() {
    const { deliverables, summary, filters } = usePage<{
        deliverables: Paginator<ProjectDeliverable>;
        summary: ProjectDeliverableSummary;
        filters: { search?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title=" Hasil Akhir Project" />
            <div className="p-4 md:p-6">
                <Heading title="Manajemen Hasil Akhir" description="Daftar dokumen hasil akhir project beserta status final dan pengaturan keamanannya" />

                <DeliverableSection deliverables={deliverables} summary={summary} filters={filters} />
            </div>
        </AppLayout>
    );
}
