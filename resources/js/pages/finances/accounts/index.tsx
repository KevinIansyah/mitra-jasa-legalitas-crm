import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Account, AccountSummary } from '@/types/account';
import type { Paginator } from '@/types/paginator';
import { AccountSection } from './_components/account-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Keuangan', href: '#' },
    { title: 'Akun', href: '#' },
];

export default function Page() {
    const { accounts, summary, filters } = usePage<{
        accounts: Paginator<Account>;
        summary: AccountSummary;
        filters: { search?: string; type?: string; status?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Akun" />
            <div className="p-4 md:p-6">
                <Heading title="Akun" description="Kelola daftar akun untuk pencatatan jurnal keuangan" />
                
                <AccountSection accounts={accounts} summary={summary} filters={filters} />
            </div>
        </AppLayout>
    );
}
