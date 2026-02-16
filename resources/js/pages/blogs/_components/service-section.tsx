import { useState } from 'react';
import type { Paginator } from '@/types/paginator';
import type { Service, ServiceCategory } from '@/types/service';
import { DataTable } from './datatable';

interface ServiceSectionProps {
    services: Paginator<Service>;
    categories: ServiceCategory[];
    filters: { search?: string };
}

export function ServiceSection({ services, categories, filters }: ServiceSectionProps) {
    const { data, current_page, last_page, per_page, total } = services;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    return (
        <div className="w-full rounded-xl bg-sidebar p-4">
            <DataTable data={data} categories={categories} pageIndex={pageIndex} setPageIndex={setPageIndex} totalPages={last_page} totalItems={total} perPage={per_page} initialFilters={filters} />
        </div>
    );
}
