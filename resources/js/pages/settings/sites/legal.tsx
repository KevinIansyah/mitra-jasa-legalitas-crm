import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import SiteSettingsLayout from '@/layouts/settings/site-layout';
import siteSettings from '@/routes/site-settings';
import type { BreadcrumbItem } from '@/types';
import type { SiteSetting } from '@/types/site-setting';
import { LegalSection } from './_components/legal-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Informasi Legal', href: siteSettings.legal().url },
];

export default function SiteSettingsLegal({ settings }: { settings: SiteSetting }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Informasi Legal - Pengaturan Website" />
            <SiteSettingsLayout>
                <Heading variant="small" title="Informasi Legal" description="Data legalitas untuk dokumen resmi" />
                <LegalSection settings={settings} />
            </SiteSettingsLayout>
        </AppLayout>
    );
}
