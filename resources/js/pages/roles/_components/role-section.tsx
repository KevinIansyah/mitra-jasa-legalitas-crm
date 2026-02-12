import { useState } from 'react';
import type { Paginator } from '@/types/paginator';
import type { Role } from '@/types/role';
import { DataTable } from './datatable';

interface RoleSectionProps {
    roles: Paginator<Role>;
    filters: { search?: string };
}

export function RoleSection({ roles, filters }: RoleSectionProps) {
    const { data, current_page, last_page, per_page, total } = roles;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    return (
        <div className="w-full rounded-xl bg-sidebar p-4">
            <DataTable data={data} pageIndex={pageIndex} setPageIndex={setPageIndex} totalPages={last_page} totalItems={total} perPage={per_page} initialFilters={filters} />
        </div>
    );
}
