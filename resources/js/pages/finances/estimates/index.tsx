import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import finances from '@/routes/finances';
import type { BreadcrumbItem } from '@/types';
import type { Paginator } from '@/types/paginator';
import type { Estimate, EstimateSummaryData } from '@/types/quotes';
import { EstimateSection } from './_components/estimate-section';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Estimates', href: finances.estimates.index().url }];

export default function Page() {
    const { estimates, summary, filters } = usePage<{
        estimates: Paginator<Estimate>;
        summary: EstimateSummaryData;
        filters: { search?: string; status?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Estimates" />
            <div className="p-4 md:p-6">
                <Heading title="Estimates" description="Kelola semua estimasi biaya permintaan penawaran" />

                <EstimateSection estimates={estimates} summary={summary} filters={filters} />
            </div>
        </AppLayout>
    );
}
