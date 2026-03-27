import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import SiteSettingsLayout from '@/layouts/settings/site-layout';
import siteSettings from '@/routes/site-settings';
import type { BreadcrumbItem } from '@/types';
import type { SiteSetting } from '@/types/site-setting';
import { SocialSection } from './_components/social-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Social Media', href: siteSettings.social().url },
];

export default function SiteSettingsSocial({ settings }: { settings: SiteSetting }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Social Media - Pengaturan Website" />
            <SiteSettingsLayout>
                <Heading variant="small" title="Social Media" description="Hubungkan akun social media perusahaan" />
                <SocialSection settings={settings} />
            </SiteSettingsLayout>
        </AppLayout>
    );
}
