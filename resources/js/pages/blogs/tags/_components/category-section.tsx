import { useState } from 'react';
import type { Paginator } from '@/types/paginator';
import type { ServiceCategory } from '@/types/service';
import { DataTable } from './datatable';

interface CategorySectionProps {
    categories: Paginator<ServiceCategory>;
    filters: { search?: string };
}

export function CategorySection({ categories, filters }: CategorySectionProps) {
    const { data, current_page, last_page, per_page, total } = categories;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    return (
        <div className="w-full rounded-xl bg-sidebar p-4">
            <DataTable data={data} pageIndex={pageIndex} setPageIndex={setPageIndex} totalPages={last_page} totalItems={total} perPage={per_page} initialFilters={filters} />
        </div>
    );
}
