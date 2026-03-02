import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import projects from '@/routes/projects';
import type { BreadcrumbItem } from '@/types';
import type { ActivityLog, Project } from '@/types/project';
import type { Service } from '@/types/service';
import { DetailSection } from './_components/detail-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Project',
        href: projects.index().url,
    },
    {
        title: 'Detail',
        href: '#',
    },
];

export default function Page() {
    const {
        project,
        tab,
        services,
        activities,
        can_approve_documents = false,
    } = usePage<{
        project: Project;
        tab: string;
        services?: Service[];
        activities?: {
            data: ActivityLog[];
            current_page: number;
            last_page: number;
            next_page_url: string | null;
            prev_page_url: string | null;
        };
        can_approve_documents?: boolean;
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Project" />
            <div className="p-4 md:p-6">
                <Heading title={`Detail Project  -  ${project.name}`} description="Kelola seluruh kebutuhan project seperti keuangan, tim, milestone, dan dokumen." />

                <DetailSection project={project} tab={tab} services={services} activities={activities} canApproveDocuments={can_approve_documents} />
            </div>
        </AppLayout>
    );
}
