import { UserIcon, UserCheck, UserX, UserMinus } from 'lucide-react';
import { useState } from 'react';

import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import type { User, UserSummary } from '@/types/auth';
import type { Paginator } from '@/types/paginator';
import { DataTable } from './datatable';

type UserSectionProps = {
    users: Paginator<User>;
    summary: UserSummary;
    filters: { search?: string; status?: string };
}

export function UserSection({ users, summary, filters }: UserSectionProps) {
    const { data, current_page, last_page, per_page, total } = users;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS = [
        {
            label: 'Total User',
            value: summary.total,
            badge: 'bg-secondary/50 text-white px-2.5 py-1.5',
            icon: <UserIcon className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Semua user terdaftar</p>
                    <p className="text-muted-foreground">Seluruh akun user dalam sistem</p>
                </>
            ),
        },
        {
            label: 'Aktif',
            value: summary.active,
            badge: 'bg-emerald-500 text-white dark:bg-emerald-500/15 dark:text-emerald-500 px-2.5 py-1.5',
            icon: <UserCheck className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">User berstatus aktif</p>
                    <p className="text-muted-foreground">Akun yang siap digunakan</p>
                </>
            ),
        },
        {
            label: 'Tidak Aktif',
            value: summary.inactive,
            badge: 'bg-secondary/50 text-white dark:bg-secondary/50 dark:text-secondary-foreground px-2.5 py-1.5',
            icon: <UserX className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">User tidak aktif</p>
                    <p className="text-muted-foreground">Akun yang dinonaktifkan</p>
                </>
            ),
        },
        {
            label: 'Ditangguhkan',
            value: summary.suspended,
            badge: 'bg-yellow-500 text-white dark:bg-yellow-500/15 dark:text-yellow-500 px-2.5 py-1.5',
            icon: <UserMinus className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">User ditangguhkan</p>
                    <p className="text-muted-foreground">Akun yang sedang ditangguhkan</p>
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
