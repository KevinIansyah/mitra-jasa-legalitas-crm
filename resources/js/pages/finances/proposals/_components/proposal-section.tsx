import { CircleCheck, CircleDot, CircleX, FileText } from 'lucide-react';
import { useState } from 'react';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRupiah } from '@/lib/service';
import type { Paginator } from '@/types/paginator';
import type { Proposal, ProposalSummaryData } from '@/types/proposals';
import { DataTable } from './datatable';

interface ProposalSectionProps {
    proposals: Paginator<Proposal>;
    summary: ProposalSummaryData;
    filters: { search?: string; status?: string };
}

export function ProposalSection({ proposals, summary, filters }: ProposalSectionProps) {
    const { data, current_page, last_page, per_page, total } = proposals;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS = [
        {
            label: 'Total Proposal',
            value: summary.total,
            badge: 'bg-slate-500 text-white',
            icon: <FileText className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">{formatRupiah(Number(summary.accepted_amount))} proposal disetujui</p>
                    <p className="text-muted-foreground">dari total {formatRupiah(Number(summary.total_amount))}</p>
                </>
            ),
        },
        {
            label: 'Draft / Terkirim',
            value: Number(summary.draft) + Number(summary.sent),
            badge: 'bg-yellow-500 text-white',
            icon: <CircleDot className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">
                        {summary.draft} draft · {summary.sent} terkirim
                    </p>
                    <p className="text-muted-foreground">Menunggu konfirmasi</p>
                </>
            ),
        },
        {
            label: 'Diterima',
            value: summary.accepted,
            badge: 'bg-emerald-500 text-white',
            icon: <CircleCheck className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Proposal disetujui</p>
                    <p className="text-muted-foreground">Siap diproses lebih lanjut</p>
                </>
            ),
        },
        {
            label: 'Ditolak',
            value: summary.rejected,
            badge: 'bg-red-500 text-white',
            icon: <CircleX className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Proposal ditolak</p>
                    <p className="text-muted-foreground">Perlu revisi atau penawaran ulang</p>
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
