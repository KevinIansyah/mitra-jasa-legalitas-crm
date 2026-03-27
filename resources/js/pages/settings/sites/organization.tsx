import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import SiteSettingsLayout from '@/layouts/settings/site-layout';
import siteSettings from '@/routes/site-settings';
import type { BreadcrumbItem } from '@/types';
import type { SiteSetting } from '@/types/site-setting';
import { OrganizationSection } from './_components/organization-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Schema.org / Organization', href: siteSettings.organization().url },
];

export default function SiteSettingsOrganization({ settings }: { settings: SiteSetting }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Schema.org - Pengaturan Website" />
            <SiteSettingsLayout>
                <Heading variant="small" title="Schema.org / Organization" description="Structured data untuk meningkatkan tampilan di mesin pencari" />
                <OrganizationSection settings={settings} />
            </SiteSettingsLayout>
        </AppLayout>
    );
}
