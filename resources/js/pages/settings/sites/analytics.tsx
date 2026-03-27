import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import SiteSettingsLayout from '@/layouts/settings/site-layout';
import siteSettings from '@/routes/site-settings';
import type { BreadcrumbItem } from '@/types';
import type { SiteSetting } from '@/types/site-setting';
import { AnalyticsSection } from './_components/analytics-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Analytics & Tracking', href: siteSettings.analytics().url },
];

export default function SiteSettingsAnalytics({ settings }: { settings: SiteSetting }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analytics & Tracking - Pengaturan Website" />
            <SiteSettingsLayout>
                <Heading variant="small" title="Analytics & Tracking" description="Kode tracking dan verifikasi mesin pencari" />
                <AnalyticsSection settings={settings} />
            </SiteSettingsLayout>
        </AppLayout>
    );
}
