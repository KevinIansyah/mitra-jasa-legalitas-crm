import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import SiteSettingsLayout from '@/layouts/settings/site-layout';

import type { BreadcrumbItem } from '@/types';
import type { SiteSetting } from '@/types/site-setting';
import { MaintenanceSection } from './_components/maintenance-section';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Maintenance', href: '/settings/site/maintenance' }];

export default function SiteSettingsMaintenance({ settings }: { settings: SiteSetting }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Maintenance - Pengaturan Website" />
            <SiteSettingsLayout>
                <Heading variant="small" title="Mode Maintenance" description="Nonaktifkan akses publik sementara" />
                <MaintenanceSection settings={settings} />
            </SiteSettingsLayout>
        </AppLayout>
    );
}
