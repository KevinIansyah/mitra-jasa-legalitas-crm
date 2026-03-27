import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import SiteSettingsLayout from '@/layouts/settings/site-layout';
import siteSettings from '@/routes/site-settings';
import type { BreadcrumbItem } from '@/types';
import type { SiteSetting } from '@/types/site-setting';
import { ChatbotSection } from './_components/chatbot-section';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Chatbot AI', href: siteSettings.chatbot().url }];

export default function SiteSettingsChatbot({ settings }: { settings: SiteSetting }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Chatbot AI - Pengaturan Website" />
            <SiteSettingsLayout>
                <Heading variant="small" title="Chatbot AI" description="Konfigurasi asisten virtual dan batas penggunaan token" />
                <ChatbotSection settings={settings} />
            </SiteSettingsLayout>
        </AppLayout>
    );
}