import { Inbox, Mail, MailCheck, MailOpen } from 'lucide-react';
import { useState } from 'react';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { ContactMessage, ContactMessageSummary } from '@/types/contacts';
import type { Paginator } from '@/types/paginator';
import { DataTable } from './datatable';

interface ContactMessageSectionProps {
    messages: Paginator<ContactMessage>;
    summary: ContactMessageSummary;
    filters: { search?: string; status?: string };
}

export function ContactMessageSection({ messages, summary, filters }: ContactMessageSectionProps) {
    const { data, current_page, last_page, per_page, total } = messages;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS = [
        {
            label: 'Total Pesan',
            value: summary.total,
            badge: 'bg-slate-500 text-white',
            icon: <Inbox className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Semua pesan masuk</p>
                    <p className="text-muted-foreground">Dari halaman kontak website</p>
                </>
            ),
        },
        {
            label: 'Belum Dibaca',
            value: summary.unread,
            badge: 'bg-slate-500 text-white',
            icon: <Mail className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Pesan belum dibaca</p>
                    <p className="text-muted-foreground">Perlu segera ditindaklanjuti</p>
                </>
            ),
        },
        {
            label: 'Sudah Dibaca',
            value: summary.read,
            badge: 'bg-emerald-500 text-white',
            icon: <MailOpen className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Pesan sudah dibaca</p>
                    <p className="text-muted-foreground">Belum dihubungi</p>
                </>
            ),
        },
        {
            label: 'Sudah Dihubungi',
            value: summary.contacted,
            badge: 'bg-blue-600 text-white',
            icon: <MailCheck className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Pesan sudah ditindaklanjuti</p>
                    <p className="text-muted-foreground">Selesai diproses</p>
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
