import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import SiteSettingsLayout from '@/layouts/settings/site-layout';
import siteSettings from '@/routes/site-settings';
import type { BreadcrumbItem } from '@/types';
import type { SiteSetting } from '@/types/site-setting';
import { DocumentSection } from './_components/document-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kustomisasi Dokumen', href: siteSettings.document().url },
];

export default function SiteSettingsDocument({ settings }: { settings: SiteSetting }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kustomisasi Dokumen - Pengaturan Website" />
            <SiteSettingsLayout>
                <Heading variant="small" title="Kustomisasi Dokumen" description="Teks default untuk dokumen perusahaan" />
                <DocumentSection settings={settings} />
            </SiteSettingsLayout>
        </AppLayout>
    );
}
