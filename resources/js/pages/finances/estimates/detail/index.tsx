import { Head, usePage } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';

import finances from '@/routes/finances';
import type { BreadcrumbItem } from '@/types';
import type { Estimate } from '@/types/estimates';
import type { SiteSetting } from '@/types/site-setting';
import { DetailSection } from './_components/detail-section';

export default function Page() {
    const { estimate, settings } = usePage<{
        estimate: Estimate;
        settings: SiteSetting;
    }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Keuangan', href: '#' },
        { title: 'Estimasi', href: finances.estimates.index().url },
        { title: 'Detail', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Estimasi ${estimate.estimate_number}`} />
            <div className="p-4 md:p-6">
                <Heading title={`Detail Estimasi ${estimate.estimate_number}`} description="Lihat detail estimasi, termasuk informasi klien dan rincian layanan" />
                <DetailSection estimate={estimate} settings={settings} />
            </div>
        </AppLayout>
    );
}
