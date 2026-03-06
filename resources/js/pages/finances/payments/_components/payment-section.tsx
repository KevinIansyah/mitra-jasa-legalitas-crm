import { CircleCheck, CircleDot, CircleX, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRupiah } from '@/lib/service';
import type { Paginator } from '@/types/paginator';
import type { ProjectPayment } from '@/types/project';
import type { PaymentSummary } from '../index';
import { DataTable } from './datatable';

interface PaymentSectionProps {
    payments: Paginator<ProjectPayment>;
    summary: PaymentSummary;
    filters: { search?: string; status?: string; payment_method?: string };
}

export function PaymentSection({ payments, summary, filters }: PaymentSectionProps) {
    const { data, current_page, last_page, per_page, total } = payments;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS = [
        {
            label: 'Total Pembayaran',
            value: summary.total,
            badge: 'bg-slate-500 text-white',
            icon: <Wallet className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">{formatRupiah(Number(summary.verified_amount))} terverifikasi</p>
                    <p className="text-muted-foreground">dari {formatRupiah(Number(summary.total_amount))} total</p>
                </>
            ),
        },
        {
            label: 'Menunggu Verifikasi',
            value: summary.pending,
            badge: 'bg-yellow-500 text-white',
            icon: <CircleDot className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Pembayaran pending</p>
                    <p className="text-muted-foreground">Perlu ditinjau dan diverifikasi</p>
                </>
            ),
        },
        {
            label: 'Terverifikasi',
            value: summary.verified,
            badge: 'bg-emerald-500 text-white',
            icon: <CircleCheck className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Pembayaran dikonfirmasi</p>
                    <p className="text-muted-foreground">Dana telah diterima</p>
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
                    <p className="font-medium">Pembayaran ditolak</p>
                    <p className="text-muted-foreground">Perlu tindak lanjut dari klien</p>
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
