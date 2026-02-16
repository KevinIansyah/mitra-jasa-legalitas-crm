import { useState } from 'react';
import type { Paginator } from '@/types/paginator';
import type { ProjectTemplate } from '@/types/project-template';
import type { Service } from '@/types/service';
import { DataTable } from './datatable';

interface TemplateSectionProps {
    templates: Paginator<ProjectTemplate>;
    services: Service[];
    filters: { search?: string };
}

export function TemplateSection({ templates, services, filters }: TemplateSectionProps) {
    const { data, current_page, last_page, per_page, total } = templates;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    return (
        <div className="w-full rounded-xl bg-sidebar p-4">
            <DataTable
                data={data}
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
