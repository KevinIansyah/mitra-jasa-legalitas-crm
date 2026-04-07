import { Head, usePage } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';

import type { BreadcrumbItem } from '@/types';
import type { Company, Customer } from '@/types/contacts';
import type { Paginator } from '@/types/paginator';
import type { Project, ProjectSummary } from '@/types/projects';
import type { Service } from '@/types/services';
import { ProjectSection } from './_components/project-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Project',
        href: '#',
    },
];

export default function Page() {
    const { projects, summary, customers, companies, services, filters } = usePage<{
        projects: Paginator<Project>;
        summary: ProjectSummary;
        customers: Customer[];
        companies: Company[];
        services: Service[];
        filters: { search?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Project" />
            <div className="p-4 md:p-6">
                <Heading title="Manajemen Project" description="Kelola data dan informasi project secara terpusat" />

                <ProjectSection projects={projects} summary={summary} customers={customers} companies={companies} services={services} filters={filters} />
            </div>
        </AppLayout>
    );
}
