import { useState } from 'react';
import type { Company, Customer } from '@/types/contact';
import type { Paginator } from '@/types/paginator';
import type { Project } from '@/types/project';
import type { Service } from '@/types/service';
import { DataTable } from './datatable';

interface ProjectSectionProps {
    projects: Paginator<Project>;
    customers: Customer[];
    companies: Company[];
    services: Service[];
    filters: { search?: string };
}

export function ProjectSection({ projects, customers, companies, services, filters }: ProjectSectionProps) {
    const { data, current_page, last_page, per_page, total } = projects;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    return (
        <div className="w-full rounded-xl bg-sidebar p-4">
            <DataTable
                data={data}
                customers={customers}
                companies={companies}
                services={services}
                pageIndex={pageIndex}
                setPageIndex={setPageIndex}
                totalPages={last_page}
                totalItems={total}
                perPage={per_page}
                initialFilters={filters}
            />
        </div>
    );
}
