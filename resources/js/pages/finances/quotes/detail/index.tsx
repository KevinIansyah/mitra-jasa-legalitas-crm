import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Quote } from '@/types/quote';
import { DetailSection } from './_components/detail-section';
import finances from '@/routes/finances';

export default function Page() {
    const { quote } = usePage<{ quote: Quote }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Keuangan', href: '#' },
        { title: 'Permintaan Penawaran', href: finances.quotes.index().url },
        { title: 'Detail', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Quote ${quote.reference_number}`} />
            <div className="p-4 md:p-6">
                <Heading title="Detail Permintaan Penawaran" description={`${quote.reference_number} - Request dari ${quote.user?.name}`} />
                <DetailSection quote={quote} />
            </div>
        </AppLayout>
    );
}
