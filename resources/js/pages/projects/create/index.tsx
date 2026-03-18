import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import projects from '@/routes/projects';
import type { BreadcrumbItem } from '@/types';
import type { Quote } from '@/types/quotes';
import type { Service } from '@/types/services';
import { CreateSection } from './_components/create-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Project',
        href: projects.index().url,
    },
    {
        title: 'Tambah',
        href: '#',
    },
];

export default function Page() {
    const { services, quote } = usePage<{
        services: Service[];
        quote?: Quote;
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={quote ? `Konversi Quote #${quote.reference_number}` : 'Tambah Project'} />
            <div className="p-4 md:p-6">
                <Heading
                    title={quote ? 'Konversi ke Project' : 'Tambah Project'}
                    description={quote ? `Mengkonversi quote ${quote.project_name} - ${quote.reference_number} menjadi project ` : 'Tambahkan project untuk memulai pekerjaan baru'}
                />
                <CreateSection services={services} quote={quote} />
            </div>
        </AppLayout>
    );
}
