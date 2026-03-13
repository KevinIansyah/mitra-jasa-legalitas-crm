import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import finances from '@/routes/finances';
import type { BreadcrumbItem } from '@/types';
import type { Project, ProjectInvoice } from '@/types/project';
import EditSection from './_components/edit-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Invoice',
        href: finances.invoices.index().url,
    },
    {
        title: 'Edit',
        href: '#',
    },
];

export default function Page() {
    const { invoice, selectedProject, fromProject } = usePage<{
        invoice: ProjectInvoice;
        selectedProject: Project | null;
        fromProject: boolean;
        isEdit: boolean;
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Invoice" />
            <div className="p-4 md:p-6">
                <Heading title={`Edit Invoice ${invoice.invoice_number}`} description="Perbarui detail invoice" />

                <EditSection invoice={invoice} selectedProject={selectedProject} fromProject={fromProject} isEdit />
            </div>
        </AppLayout>
    );
}
