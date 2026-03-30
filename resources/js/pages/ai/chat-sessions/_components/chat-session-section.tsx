import { MessageCircle, MessageCircleCheck, MessageCircleOff, Users } from 'lucide-react';
import { useState } from 'react';

import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Paginator } from '@/types/paginator';

import type { ChatSession, ChatSessionSummary } from '../index';
import { DataTable } from './datatable';

interface ChatSessionSectionProps {
    sessions: Paginator<ChatSession>;
    summary: ChatSessionSummary;
    filters: Record<string, string>;
}

export function ChatSessionSection({ sessions, summary, filters }: ChatSessionSectionProps) {
    const { data, current_page, last_page, per_page, total } = sessions;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS = [
        {
            label: 'Total Sesi',
            value: summary.total,
            badge: 'bg-secondary/50 text-white px-2.5 py-1.5',
            icon: <MessageCircle className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Semua sesi percakapan</p>
                    <p className="text-muted-foreground">Termasuk semua status</p>
                </>
            ),
        },
        {
            label: 'Aktif',
            value: summary.active,
            badge: 'bg-blue-500 text-white dark:bg-blue-500/15 dark:text-blue-500 px-2.5 py-1.5',
            icon: <MessageCircleCheck className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Sesi sedang berjalan</p>
                    <p className="text-muted-foreground">Belum ditutup</p>
                </>
            ),
        },
        {
            label: 'Converted',
            value: summary.converted,
            badge: 'bg-emerald-500 text-white dark:bg-emerald-500/15 dark:text-emerald-500 px-2.5 py-1.5',
            icon: <Users className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Pengunjung jadi lead</p>
                    <p className="text-muted-foreground">Data kontak tersimpan</p>
                </>
            ),
        },
        {
            label: 'Ditutup',
            value: summary.closed,
            badge: 'bg-secondary/50 text-white px-2.5 py-1.5',
            icon: <MessageCircleOff className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Sesi sudah selesai</p>
                    <p className="text-muted-foreground">Ditutup oleh pengunjung</p>
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
