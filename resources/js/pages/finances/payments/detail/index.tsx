import { Head, usePage } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';

import finances from '@/routes/finances';
import type { BreadcrumbItem } from '@/types';
import type { ProjectPayment } from '@/types/projects';
import type { SiteSetting } from '@/types/site-setting';
import { DetailSection } from './_components/detail-section';

export default function Page() {
    const { payment, settings } = usePage<{
        payment: ProjectPayment;
        settings: SiteSetting;
    }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Keuangan', href: '#' },
        { title: 'Pembayaran', href: finances.payments.index().url },
        { title: 'Detail', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pembayaran ${payment.receipt_number ?? payment.id}`} />
            <div className="p-4 md:p-6">
                <Heading title={`Detail Pembayaran`} description="Lihat detail pembayaran dan kwitansi" />
                <DetailSection payment={payment} settings={settings} />
            </div>
        </AppLayout>
    );
}
