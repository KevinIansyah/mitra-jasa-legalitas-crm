import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import SiteSettingsLayout from '@/layouts/settings/site-layout';

import siteSettings from '@/routes/site-settings';
import type { BreadcrumbItem } from '@/types';
import type { SiteSetting } from '@/types/site-setting';
import { CompanySection } from './_components/company-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Identitas Perusahaan', href: siteSettings.company().url },
];

export default function SiteSettingsCompany({ settings }: { settings: SiteSetting }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Identitas Perusahaan - Pengaturan Website" />
            <SiteSettingsLayout>
                <Heading variant="small" title="Identitas Perusahaan" description="Logo, nama, dan informasi kontak perusahaan" />
                <CompanySection settings={settings} />
            </SiteSettingsLayout>
        </AppLayout>
    );
}
