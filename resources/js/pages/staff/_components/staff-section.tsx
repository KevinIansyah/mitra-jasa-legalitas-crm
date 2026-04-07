import { CheckCircle2, Clock, User, XCircle } from 'lucide-react';
import { useState } from 'react';

import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import type { Paginator } from '@/types/paginator';
import type { Role } from '@/types/roles';
import type { Staff, StaffSummary } from '@/types/staff';
import { DataTable } from './datatable';

type StaffSectionProps = {
    staffList: Paginator<Staff>;
    summary: StaffSummary;
    roles: Role[];
    filters: { search?: string; availability_status?: string };
}

export function StaffSection({ staffList, summary, filters, roles }: StaffSectionProps) {
    const { data, current_page, last_page, per_page, total } = staffList;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS = [
        {
            label: 'Total Staff',
            value: summary.total,
            badge: 'bg-secondary/50 text-white',
            icon: <User className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Semua staff terdaftar</p>
                    <p className="text-muted-foreground">Seluruh data staff aktif</p>
                </>
            ),
        },
        {
            label: 'Available',
            value: summary.available,
            badge: 'bg-emerald-500 text-white dark:bg-emerald-500/15 dark:text-emerald-500 px-2.5 py-1.5',
            icon: <CheckCircle2 className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Staff siap menerima project</p>
                    <p className="text-muted-foreground">{summary.total - summary.available} sedang tidak tersedia</p>
                </>
            ),
        },
        {
            label: 'Busy',
            value: summary.busy,
            badge: 'bg-yellow-500 text-white dark:bg-yellow-500/15 dark:text-yellow-500 px-2.5 py-1.5',
            icon: <Clock className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Staff sedang menangani project</p>
                    <p className="text-muted-foreground">Kapasitas sedang penuh</p>
                </>
            ),
        },
        {
            label: 'On Leave',
            value: summary.on_leave,
            badge: 'bg-red-500 text-white dark:bg-red-500/15 dark:text-red-500 px-2.5 py-1.5',
            icon: <XCircle className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Staff sedang cuti</p>
                    <p className="text-muted-foreground">Tidak tersedia sementara</p>
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
                <DataTable
                    data={data}
                    roles={roles}
                    pageIndex={pageIndex}
                    setPageIndex={setPageIndex}
                    totalPages={last_page}
                    totalItems={total}
                    perPage={per_page}
                    initialFilters={filters}
                />
            </div>
        </div>
    );
}
