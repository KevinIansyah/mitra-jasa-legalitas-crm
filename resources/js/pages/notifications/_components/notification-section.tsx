import { useState } from 'react';
import type { AppNotification } from '@/types/notification';
import type { Paginator } from '@/types/paginator';
import { DataTable } from './datatable';

interface NotificationSectionProps {
    notifications: Paginator<AppNotification>;
}

export function NotificationSection({ notifications }: NotificationSectionProps) {
    const { data, current_page, last_page, per_page, total } = notifications;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    return (
        <div className="w-full rounded-xl bg-sidebar p-4">
            <DataTable data={data} pageIndex={pageIndex} setPageIndex={setPageIndex} totalPages={last_page} totalItems={total} perPage={per_page} />
        </div>
    );
}
