import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import SiteSettingsLayout from '@/layouts/settings/site-layout';
import siteSettings from '@/routes/site-settings';
import type { BreadcrumbItem } from '@/types';
import type { SiteSetting } from '@/types/site-setting';
import { BankSection } from './_components/bank-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Informasi Bank', href: siteSettings.bank().url },
];

export default function SiteSettingsBank({ settings }: { settings: SiteSetting }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Informasi Bank - Pengaturan Website" />
            <SiteSettingsLayout>
                <Heading variant="small" title="Informasi Bank" description="Rekening untuk instruksi pembayaran" />
                <BankSection settings={settings} />
            </SiteSettingsLayout>
        </AppLayout>
    );
}
