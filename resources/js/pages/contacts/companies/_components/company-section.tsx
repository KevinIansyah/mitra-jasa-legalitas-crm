import { BadgeCheck, Building2, FileText, User } from 'lucide-react';
import { useState } from 'react';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { CompanySummary, CompanyWithCustomers } from '@/types/contacts';
import type { Paginator } from '@/types/paginator';
import { DataTable } from './datatable';

interface CompanySectionProps {
    companies: Paginator<CompanyWithCustomers>;
    summary: CompanySummary;
    filters: { search?: string };
}

export function CompanySection({ companies, summary, filters }: CompanySectionProps) {
    const { data, current_page, last_page, per_page, total } = companies;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS = [
        {
            label: 'Total Perusahaan',
            value: summary.total,
            badge: 'bg-secondary/50 text-white',
            icon: <Building2 className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Semua perusahaan terdaftar</p>
                    <p className="text-muted-foreground">Seluruh data perusahaan</p>
                </>
            ),
        },
        {
            label: 'Memiliki PIC',
            value: summary.with_customers,
            badge: 'bg-blue-600 text-white dark:bg-blue-600/15 dark:text-blue-600 px-2.5 py-1.5',
            icon: <User className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Perusahaan dengan pelanggan</p>
                    <p className="text-muted-foreground">{summary.total - summary.with_customers} belum memiliki PIC</p>
                </>
            ),
        },
        {
            label: 'Memiliki NPWP',
            value: summary.with_npwp,
            badge: 'bg-emerald-500 text-white dark:bg-emerald-500/15 dark:text-emerald-500 px-2.5 py-1.5',
            icon: <FileText className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Perusahaan dengan NPWP</p>
                    <p className="text-muted-foreground">{summary.total - summary.with_npwp} belum tercatat</p>
                </>
            ),
        },
        {
            label: 'Berbadan Hukum',
            value: summary.with_legal_status,
            badge: 'bg-purple-500 text-white dark:bg-purple-500/15 dark:text-purple-500 px-2.5 py-1.5',
            icon: <BadgeCheck className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Memiliki legalitas usaha</p>
                    <p className="text-muted-foreground">PT, CV, Firma, dll.</p>
                </>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:border-none *:data-[slot=card]:bg-sidebar *:data-[slot=card]:shadow md:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:dark:shadow-none">
                {STATS.map(({ label, value, badge, icon, footer }) => (
                    <Card key={label}>
                        <CardHeader>
                            <CardDescription>{label}</CardDescription>
                            <CardTitle className="text-3xl font-semibold tabular-nums">{value}</CardTitle>
                            <CardAction>
                                <div className={`rounded-full px-3 py-1 ${badge}`}>{icon}</div>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start text-sm">{footer}</CardFooter>
                    </Card>
                ))}
            </div>

            <div className="w-full rounded-xl bg-sidebar p-4">
                <DataTable data={data} pageIndex={pageIndex} setPageIndex={setPageIndex} totalPages={last_page} totalItems={total} perPage={per_page} initialFilters={filters} />
            </div>
        </div>
    );
}
