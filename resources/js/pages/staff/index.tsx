import { Head, usePage } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';

import staff from '@/routes/staff';
import type { BreadcrumbItem } from '@/types';
import type { Paginator } from '@/types/paginator';
import type { Role } from '@/types/roles';
import type { Staff, StaffSummary } from '@/types/staff';
import { StaffSection } from './_components/staff-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Staff',
        href: staff.index().url,
    },
];

export default function Page() {
    const { staffList, summary, roles, filters } = usePage<{
        staffList: Paginator<Staff>;
        summary: StaffSummary;
        roles: Role[];
        filters: { search?: string; availability_status?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Staff" />
            <div className="p-4 md:p-6">
                <Heading title="Manajemen Staff" description="Kelola data dan informasi staff secara terpusat" />

                <StaffSection staffList={staffList} summary={summary} roles={roles} filters={filters} />
            </div>
        </AppLayout>
    );
}
