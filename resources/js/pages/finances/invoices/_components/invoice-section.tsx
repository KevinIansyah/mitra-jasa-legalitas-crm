import { FileCheck, FileClock, FileText, FileX } from 'lucide-react';
import { useState } from 'react';

import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { formatRupiah } from '@/lib/service';
import type { Paginator } from '@/types/paginator';
import type { ProjectInvoice, ProjectInvoiceSummary } from '@/types/projects';

import { DataTable } from './datatable';

type InvoiceSectionProps = {
    invoices: Paginator<ProjectInvoice>;
    summary: ProjectInvoiceSummary;
    filters: { search?: string; status?: string; type?: string };
}

export function InvoiceSection({ invoices, summary, filters }: InvoiceSectionProps) {
    const { data, current_page, last_page, per_page, total } = invoices;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS = [
        {
            label: 'Total Invoice',
            value: summary.total,
            badge: 'bg-secondary/50 text-white px-2.5 py-1.5',
            icon: <FileText className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">{formatRupiah(Number(summary.paid_amount))} terkumpul</p>
                    <p className="text-muted-foreground">dari {formatRupiah(Number(summary.total_amount))} total</p>
                </>
            ),
        },
        {
            label: 'Dikirim',
            value: summary.sent,
            badge: 'bg-blue-600 text-white dark:bg-blue-600/15 dark:text-blue-600 px-2.5 py-1.5',
            icon: <FileClock className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Invoice dikirim</p>
                    <p className="text-muted-foreground">{summary.draft} draft</p>
                </>
            ),
        },
        {
            label: 'Lunas',
            value: summary.paid,
            badge: 'bg-emerald-500 text-white dark:bg-emerald-500/15 dark:text-emerald-500 px-2.5 py-1.5',
            icon: <FileCheck className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Invoice terbayar</p>
                    <p className="text-muted-foreground">Pembayaran telah dikonfirmasi</p>
                </>
            ),
        },
        {
            label: 'Jatuh Tempo',
            value: summary.overdue,
            badge: 'bg-red-500 text-white dark:bg-red-500/15 dark:text-red-500 px-2.5 py-1.5',
            icon: <FileX className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Invoice melewati jatuh tempo</p>
                    <p className="text-muted-foreground">Perlu tindak lanjut segera</p>
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
