import { Head, usePage } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';

import services from '@/routes/services';
import type { BreadcrumbItem } from '@/types';
import type { ServiceCityPage } from '@/types/services';
import { EditSection } from './_components/edit-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Layanan', href: services.index().url },
    { title: 'Halaman Kota', href: services.cityPages.index().url },
    { title: 'Edit', href: '#' },
];

export default function Page() {
    const { cityPage } = usePage<{ cityPage: ServiceCityPage }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit - ${cityPage.service?.name} di ${cityPage.city?.name}`} />
            <div className="p-4 md:p-6">
                <Heading title={`${cityPage.service?.name} di ${cityPage.city?.name}`} description="Kelola konten dan SEO halaman layanan per kota." />

                <EditSection cityPage={cityPage} />
            </div>
        </AppLayout>
    );
}
