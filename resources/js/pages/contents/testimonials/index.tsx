import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Testimonial, TestimonialSummary } from '@/types/contents';
import type { Paginator } from '@/types/paginator';
import type { Service } from '@/types/services';
import { TestimonialSection } from './_components/testimonial-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Konten & SEO', href: '#' },
    { title: 'Testimoni', href: '#' },
];

export default function Page() {
    const { testimonials, services, summary, filters } = usePage<{
        testimonials: Paginator<Testimonial>;
        services: Service[];
        summary: TestimonialSummary;
        filters: { search?: string; per_page?: number; published?: string; service_id?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Testimoni" />
            <div className="p-4 md:p-6">
                <Heading title="Manajemen Testimoni" description="Kelola ulasan klien untuk ditampilkan di situs" />

                <TestimonialSection testimonials={testimonials} services={services} summary={summary} filters={filters} />
            </div>
        </AppLayout>
    );
}
