import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import projects from '@/routes/projects';
import type { BreadcrumbItem } from '@/types';
import type { Paginator } from '@/types/paginator';
import type { ProjectTemplate, ProjectTemplateSummary } from '@/types/project-templates';
import type { Service } from '@/types/service';
import { TemplateSection } from './_components/template-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Project',
        href: projects.index().url,
    },
    {
        title: 'Template',
        href: '#',
    },
];

export default function Page() {
    const { templates, summary, services, filters } = usePage<{
        templates: Paginator<ProjectTemplate>;
        summary: ProjectTemplateSummary;
        services: Service[];
        filters: { search?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Template Project" />
            <div className="p-4 md:p-6">
                <Heading title="Manajemen Template Project" description="Kelola daftar template project yang dapat digunakan sebagai dasar pembuatan project baru" />

                <TemplateSection templates={templates} summary={summary} services={services} filters={filters} />
            </div>
        </AppLayout>
    );
}
