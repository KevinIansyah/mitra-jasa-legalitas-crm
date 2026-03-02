import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Company, Customer } from '@/types/contact';
import type { Paginator } from '@/types/paginator';
import type { Project } from '@/types/project';
import type { Service } from '@/types/service';
import { ProjectSection } from './_components/project-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Project',
        href: '#',
    },
];

export default function Page() {
    const { projects, customers, companies, services, filters } = usePage<{
        projects: Paginator<Project>;
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

                <ProjectSection projects={projects} customers={customers} companies={companies} services={services} filters={filters} />
            </div>
        </AppLayout>
    );
}
