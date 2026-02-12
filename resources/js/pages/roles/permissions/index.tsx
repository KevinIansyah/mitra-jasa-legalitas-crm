import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import roles from '@/routes/roles';
import type { BreadcrumbItem } from '@/types';
import type { Permission, Role } from '@/types/role';
import PermissionSection from './_components/permission-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Role',
        href: roles.index().url,
    },
    {
        title: 'Hak Akses',
        href: '#',
    },
];

export default function Page() {
    const { role, allPermissions } = usePage<{
        role: Role;
        allPermissions: Permission[];
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Hak Akses" />

            <div className="p-4 md:p-6">
                <Heading title={`Manajemen Hak Akses (${role.name})`} description="Kelola dan atur hak akses untuk role yang dipilih" />

                <PermissionSection role={role} allPermissions={allPermissions} />
            </div>
        </AppLayout>
    );
}
