import type { CompanyFinanceSummary, CompanyWithCustomers } from '@/types/contacts';
import type { Paginator } from '@/types/paginator';
import type { Project } from '@/types/projects';

import { CustomersSection } from './customers-section';
import { FinanceSection } from './finance-section';
import { OverviewSection } from './overview-section';
import { ProjectsSection } from './projects-section';

type DetailSectionProps = {
    company: CompanyWithCustomers;
    projects: Paginator<Project>;
    finance_summary: CompanyFinanceSummary | null;
};

export function DetailSection({ company, projects, finance_summary }: DetailSectionProps) {
    return (
        <div className="mt-6 space-y-4">
            <OverviewSection company={company} />
            {finance_summary && <FinanceSection summary={finance_summary} />}
            <CustomersSection company={company} />
            <ProjectsSection companyId={company.id} projectsPage={projects} />
        </div>
    );
}
