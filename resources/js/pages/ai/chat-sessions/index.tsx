import { Head, usePage } from '@inertiajs/react';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Paginator } from '@/types/paginator';
import { ChatSessionSection } from './_components/chat-session-section';

export type ChatSession = {
    id: number;
    session_token: string;
    page_url: string | null;
    name: string | null;
    email: string | null;
    phone: string | null;
    status: 'active' | 'closed' | 'converted';
    last_message_at: string | null;
    messages_count: number;
    created_at: string;
    updated_at: string;
};

export type ChatSessionSummary = {
    total: number;
    active: number;
    converted: number;
    closed: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'AI', href: '#' },
    { title: 'Riwayat Chat', href: '#' },
];

export default function Page() {
    const { sessions, summary, filters } = usePage<{
        sessions: Paginator<ChatSession>;
        summary: ChatSessionSummary;
        filters: Record<string, string>;
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Chat AI" />
            <div className="p-4 md:p-6">
                <Heading title="Riwayat Chat AI" description="Pantau percakapan pengunjung dengan asisten AI" />
                <ChatSessionSection sessions={sessions} summary={summary} filters={filters} />
            </div>
        </AppLayout>
    );
}
