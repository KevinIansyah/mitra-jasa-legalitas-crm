import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { User, UserSummary } from '@/types/auth';
import type { Paginator } from '@/types/paginator';
import { UserSection } from './_components/user-section';


const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Master Data', href: '#' },
    { title: 'User', href: '/master-data/users' },
];

export default function Page() {
    const { users, summary, filters } = usePage<{
        users: Paginator<User>;
        summary: UserSummary;
        filters: { search?: string; status?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen User" />
            <div className="p-4 md:p-6">
                <Heading title="Manajemen User" description="Kelola akun dan status user terdaftar" />
                <UserSection users={users} summary={summary} filters={filters} />
            </div>
        </AppLayout>
    );
}
