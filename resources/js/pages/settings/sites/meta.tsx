import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import SiteSettingsLayout from '@/layouts/settings/site-layout';

import siteSettings from '@/routes/site-settings';
import type { BreadcrumbItem } from '@/types';
import type { SiteSetting } from '@/types/site-setting';
import { MetaSection } from './_components/meta-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Default Meta Tags', href: siteSettings.meta().url },
];

export default function SiteSettingsMeta({ settings }: { settings: SiteSetting }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Default Meta Tags - Pengaturan Website" />
            <SiteSettingsLayout>
                <Heading variant="small" title="Default Meta Tags" description="Template meta tags untuk semua halaman" />
                <MetaSection settings={settings} />
            </SiteSettingsLayout>
        </AppLayout>
    );
}
