import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import SiteSettingsLayout from '@/layouts/settings/site-layout';

import siteSettings from '@/routes/site-settings';
import type { BreadcrumbItem } from '@/types';
import type { SiteSetting } from '@/types/site-setting';
import { StatsSection } from './_components/stats-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Statistik & Trust', href: siteSettings.stats().url },
];

export default function SiteSettingsStats({ settings }: { settings: SiteSetting }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Statistik & Trust - Pengaturan Website" />
            <SiteSettingsLayout>
                <Heading variant="small" title="Statistik & Trust" description="Ditampilkan di halaman publik untuk meningkatkan kepercayaan" />
                <StatsSection settings={settings} />
            </SiteSettingsLayout>
        </AppLayout>
    );
}
