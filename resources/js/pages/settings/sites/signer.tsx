import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import SiteSettingsLayout from '@/layouts/settings/site-layout';

import siteSettings from '@/routes/site-settings';
import type { BreadcrumbItem } from '@/types';
import type { SiteSetting } from '@/types/site-setting';
import { SignerSection } from './_components/signer-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'TTD & Stempel', href: siteSettings.signer().url },
];

export default function SiteSettingsSigner({ settings }: { settings: SiteSetting }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="TTD & Stempel - Pengaturan Website" />
            <SiteSettingsLayout>
                <Heading variant="small" title="Tanda Tangan & Stempel" description="Digunakan pada dokumen proposal, invoice, surat, dan kontrak" />
                <SignerSection settings={settings} />
            </SiteSettingsLayout>
        </AppLayout>
    );
}
