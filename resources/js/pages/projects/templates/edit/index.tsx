import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import templates from '@/routes/projects/templates';
import type { BreadcrumbItem } from '@/types';
import type { ProjectTemplate } from '@/types/project-template';
import type { Service } from '@/types/service';
import { EditSection } from './_components/edit-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Template Project',
        href: templates.index().url,
    },
    {
        title: 'Edit',
        href: '#',
    },
];

export default function Page() {
    const { template, services } = usePage<{
        template: ProjectTemplate;
        services: Service[];
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Template Project" />
            <div className="p-4 md:p-6">
                <Heading title="Edit Template Project" description="Perbarui template untuk menyesuaikan dengan kebutuhan project" />

                <EditSection template={template} services={services} />
            </div>
        </AppLayout>
    );
}
