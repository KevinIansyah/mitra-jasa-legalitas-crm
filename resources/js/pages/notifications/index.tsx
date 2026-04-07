import { Head, usePage } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';

import type { BreadcrumbItem } from '@/types';
import type { AppNotification } from '@/types/notification';
import type { Paginator } from '@/types/paginator';
import { NotificationSection } from './_components/notification-section';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Notifikasi', href: '/notifications' }];

export default function Page() {
    const { notifications } = usePage<{
        notifications: Paginator<AppNotification>;
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifikasi" />
            <div className="p-4 md:p-6">
                <Heading title="Notifikasi" description="Kelola semua notifikasi kamu" />
                
                <NotificationSection notifications={notifications} />
            </div>
        </AppLayout>
    );
}
