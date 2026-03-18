import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import finances from '@/routes/finances';
import type { BreadcrumbItem } from '@/types';
import type { ProjectInvoice } from '@/types/projects';
import type { SiteSetting } from '@/types/site-setting';
import { DetailSection } from './_components/detail-section';

export default function Page() {
    const { invoice, settings } = usePage<{
        invoice: ProjectInvoice;
        settings: SiteSetting;
    }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Keuangan', href: '#' },
        { title: 'Invoice', href: finances.invoices.index().url },
        { title: 'Detail', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Invoice ${invoice.invoice_number}`} />
            <div className="p-4 md:p-6">
                <Heading title={`Detail Invoice ${invoice.invoice_number}`} description="Lihat detail invoice, termasuk informasi tagihan dan rincian layanan" />
                
                <DetailSection invoice={invoice} settings={settings} />
            </div>
        </AppLayout>
    );
}
