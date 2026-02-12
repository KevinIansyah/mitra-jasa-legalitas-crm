import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import roles from '@/routes/roles';
import type { BreadcrumbItem } from '@/types';
import type { Paginator } from '@/types/paginator';
import type { Role } from '@/types/role';
import { RoleSection } from './_components/role-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Role',
        href: roles.index().url,
    },
];

export default function Page() {
    const { roles, filters } = usePage<{
        roles: Paginator<Role>;
        filters: { search?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Role" />
            <div className="p-4 md:p-6">
                <Heading title="Manajemen Role" description="Kelola daftar role dan hak akses pengguna" />

                <RoleSection roles={roles} filters={filters} />
            </div>
        </AppLayout>
    );
}
