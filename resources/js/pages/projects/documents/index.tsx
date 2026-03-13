import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import projects from '@/routes/projects';
import type { BreadcrumbItem } from '@/types';
import type { Paginator } from '@/types/paginator';
import type { ProjectDocument, ProjectDocumentSummary } from '@/types/project';
import { DocumentSection } from './_components/document-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Project',
        href: projects.index().url,
    },
    {
        title: 'Dokumen',
        href: '#',
    },
];

export default function Page() {
    const { documents, summary, filters } = usePage<{
        documents: Paginator<ProjectDocument>;
        summary: ProjectDocumentSummary;
        filters: { search?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dokumen Project" />
            <div className="p-4 md:p-6">
                <Heading title="Manajemen Dokumen" description="Kelola dokumen yang terkait dengan project, termasuk menambah, melihat, dan mengunduh file yang dibutuhkan" />

                <DocumentSection documents={documents} summary={summary} filters={filters} />
            </div>
        </AppLayout>
    );
}
