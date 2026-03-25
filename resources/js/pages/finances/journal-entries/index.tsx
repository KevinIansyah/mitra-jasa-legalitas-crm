import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Account } from '@/types/accounts';
import type { JournalEntry, JournalSummary } from '@/types/journal-entries';
import type { Paginator } from '@/types/paginator';
import { JournalSection } from './_components/journal-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Keuangan', href: '#' },
    { title: 'Jurnal', href: '#' },
];

export default function Page() {
    const { entries, accounts, summary, filters } = usePage<{
        entries: Paginator<JournalEntry>;
        accounts: Account[];
        summary: JournalSummary;
        filters: { search?: string; from?: string; to?: string; reference_type?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jurnal" />
            <div className="p-4 md:p-6">
                <Heading title="Jurnal" description="Seluruh entri jurnal dari invoice, pembayaran, pengeluaran, dan penyesuaian manual" />

                <JournalSection entries={entries} accounts={accounts} summary={summary} filters={filters} />
            </div>
        </AppLayout>
    );
}
