import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import SiteSettingsLayout from '@/layouts/settings/site-layout';

import siteSettings from '@/routes/site-settings';
import type { BreadcrumbItem } from '@/types';
import type { SiteSetting } from '@/types/site-setting';
import { OperationalSection } from './_components/operational-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Operasional', href: siteSettings.operational().url },
];

export default function SiteSettingsOperational({ settings }: { settings: SiteSetting }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Operasional - Pengaturan Website" />
            <SiteSettingsLayout>
                <Heading variant="small" title="Operasional" description="Jam operasional dan informasi lokasi" />
                <OperationalSection settings={settings} />
            </SiteSettingsLayout>
        </AppLayout>
    );
}
