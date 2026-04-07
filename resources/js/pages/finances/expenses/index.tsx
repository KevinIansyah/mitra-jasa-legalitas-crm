import { Head, usePage } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';

import type { BreadcrumbItem } from '@/types';
import type { Expense } from '@/types/expenses';
import type { Paginator } from '@/types/paginator';
import { ExpenseSection } from './_components/expense-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Keuangan', href: '#' },
    { title: 'Pengeluaran', href: '#' },
];

export type ExpenseSummary = {
    total: number;
    total_amount: string;
    billable_amount: string;
    billed_amount: string;
    unbilled_count: number;
};

export default function Page() {
    const { expenses, summary, filters } = usePage<{
        expenses: Paginator<Expense>;
        summary: ExpenseSummary;
        filters: { search?: string; category?: string; is_billable?: string; is_billed?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengeluaran" />
            <div className="p-4 md:p-6">
                <Heading title="Manajemen Pengeluaran" description="Kelola dan pantau seluruh pengeluaran yang terkait dengan project" />
                
                <ExpenseSection expenses={expenses} summary={summary} filters={filters} />
            </div>
        </AppLayout>
    );
}
