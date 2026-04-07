import { FinanceSection } from '@/pages/contacts/companies/detail/_components/finance-section';
import type { CompanyFinanceSummary, CustomersWithCompanies } from '@/types/contacts';
import type { Paginator } from '@/types/paginator';
import type { Project } from '@/types/projects';

import { CompaniesSection } from './companies-section';
import { OverviewSection } from './overview-section';
import { ProjectsSection } from './projects-section';

type DetailSectionProps = {
    customer: CustomersWithCompanies;
    projects: Paginator<Project>;
    finance_summary: CompanyFinanceSummary | null;
};

export function DetailSection({ customer, projects, finance_summary }: DetailSectionProps) {
    return (
        <div className="mt-6 space-y-4">
            <OverviewSection customer={customer} />
            {finance_summary && <FinanceSection summary={finance_summary} />}
            <CompaniesSection customer={customer} />
            <ProjectsSection customerId={customer.id} projectsPage={projects} />
        </div>
    );
}
