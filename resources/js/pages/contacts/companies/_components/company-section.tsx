import { useState } from 'react';
import type { Company } from '@/types/contact';
import type { Paginator } from '@/types/paginator';
import { DataTable } from './datatable';

interface CompanySectionProps {
    companies: Paginator<Company>;
    filters: { search?: string };
}

export function CompanySection({ companies, filters }: CompanySectionProps) {
    const { data, current_page, last_page, per_page, total } = companies;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    return (
        <div className="w-full rounded-xl bg-sidebar p-4">
            <DataTable data={data} pageIndex={pageIndex} setPageIndex={setPageIndex} totalPages={last_page} totalItems={total} perPage={per_page} initialFilters={filters} />
        </div>
    );
}
