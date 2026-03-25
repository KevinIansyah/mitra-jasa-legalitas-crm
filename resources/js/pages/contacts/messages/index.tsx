import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import contacts from '@/routes/contacts';
import type { BreadcrumbItem } from '@/types';
import type { ContactMessage, ContactMessageSummary } from '@/types/contacts';
import type { Paginator } from '@/types/paginator';
import { ContactMessageSection } from './_components/message-section';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kontak',
        href: '#',
    },
    {
        title: 'Pesan Masuk',
        href: contacts.messages.index().url,
    },
];

export default function Page() {
    const { messages, summary, filters } = usePage<{
        messages: Paginator<ContactMessage>;
        summary: ContactMessageSummary;
        filters: { search?: string; status?: string };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pesan Masuk" />
            <div className="p-4 md:p-6">
                <Heading title="Pesan Masuk" description="Kelola pesan yang masuk dari halaman kontak website" />

                <ContactMessageSection messages={messages} summary={summary} filters={filters} />
            </div>
        </AppLayout>
    );
}
