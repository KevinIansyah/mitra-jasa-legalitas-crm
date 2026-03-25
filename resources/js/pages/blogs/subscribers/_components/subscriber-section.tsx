import { MailCheck, MailQuestion, Users } from 'lucide-react';
import { useState } from 'react';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { BlogSubscriber, BlogSubscriberSummary } from '@/types/blogs';
import type { Paginator } from '@/types/paginator';
import { DataTable } from './datatable';

interface BlogSubscriberSectionProps {
    subscribers: Paginator<BlogSubscriber>;
    summary: BlogSubscriberSummary;
    filters: { search?: string; verified?: string };
}

export function BlogSubscriberSection({ subscribers, summary, filters }: BlogSubscriberSectionProps) {
    const { data, current_page, last_page, per_page, total } = subscribers;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS = [
        {
            label: 'Total Subscriber',
            value: summary.total,
            badge: 'bg-slate-500 text-white',
            icon: <Users className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Semua pendaftar</p>
                    <p className="text-muted-foreground">Email yang pernah subscribe</p>
                </>
            ),
        },
        {
            label: 'Terverifikasi',
            value: summary.verified,
            badge: 'bg-emerald-500 text-white',
            icon: <MailCheck className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Email aktif</p>
                    <p className="text-muted-foreground">Sudah konfirmasi langganan</p>
                </>
            ),
        },
        {
            label: 'Belum Verifikasi',
            value: summary.unverified,
            badge: 'bg-slate-500 text-white',
            icon: <MailQuestion className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Menunggu konfirmasi</p>
                    <p className="text-muted-foreground">Belum klik link verifikasi</p>
                </>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:border-none *:data-[slot=card]:bg-sidebar *:data-[slot=card]:shadow md:grid-cols-2 lg:grid-cols-3 *:data-[slot=card]:dark:shadow-none">
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
