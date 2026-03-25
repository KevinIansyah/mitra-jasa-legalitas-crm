import { Head, usePage } from '@inertiajs/react';
import { Bot, User } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import { InfoRow } from './_components/info-row';
import chatSessions from '@/routes/ai/chat-sessions';

type ChatMessage = {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    tokens_used: number;
    created_at: string;
};

type ChatSessionDetail = {
    id: number;
    session_token: string;
    page_url: string | null;
    name: string | null;
    email: string | null;
    phone: string | null;
    status: 'active' | 'closed' | 'converted';
    last_message_at: string | null;
    created_at: string;
    messages: ChatMessage[];
};

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
    active: { label: 'Aktif', classes: 'bg-blue-500 text-white' },
    converted: { label: 'Converted', classes: 'bg-emerald-500 text-white' },
    closed: { label: 'Ditutup', classes: 'bg-slate-400 text-white' },
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'AI', href: '#' },
    { title: 'Riwayat Chat', href: chatSessions.index().url },
    { title: 'Detail', href: '#' },
];

export default function Page() {
    const { session } = usePage<{ session: ChatSessionDetail }>().props;

    const status = STATUS_MAP[session.status] ?? STATUS_MAP['active'];
    const totalTokens = session.messages.reduce((sum, message) => sum + message.tokens_used, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Chat — ${session.name ?? 'Anonim'}`} />
            <div className="p-4 md:p-6">
                <Heading title="Detail Percakapan" description="Riwayat lengkap percakapan pengunjung dengan asisten AI" />

                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {/* ───────────────── Info Sesi Section ───────────────── */}
                    <div className="space-y-4 lg:col-span-1">
                        <div className="rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                            <h3 className="mb-4 font-semibold">Info Pengunjung</h3>
                            <div className="space-y-3">
                                <InfoRow label="Status">
                                    <Badge className={status.classes}>{status.label}</Badge>
                                </InfoRow>
                                <InfoRow label="Nama" value={session.name ?? 'Anonim'} />
                                <InfoRow label="Email" value={session.email ?? '-'} />
                                <InfoRow label="Telepon" value={session.phone ?? '-'} />
                                <InfoRow label="Halaman" value={session.page_url ?? '-'} />
                                <InfoRow label="Mulai Chat" value={formatDate(session.created_at)} />
                                <InfoRow label="Terakhir Chat" value={session.last_message_at ? formatDate(session.last_message_at) : '-'} />
                                <InfoRow label="Total Pesan" value={`${session.messages.length} pesan`} />
                                <InfoRow label="Total Token" value={totalTokens.toLocaleString('id-ID')} />
                            </div>
                        </div>
                    </div>

                    {/* ───────────────── Percakapan Section ───────────────── */}
                    <div className="lg:col-span-2">
                        <div className="rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                            <h3 className="mb-4 font-semibold">Percakapan</h3>

                            {session.messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                                    <p className="text-sm">Belum ada pesan dalam sesi ini</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {session.messages.map((message) => (
                                        <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {/* Avatar */}
                                            <div
                                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${message.role === 'assistant' ? 'bg-primary/10' : 'bg-muted'}`}
                                            >
                                                {message.role === 'assistant' ? <Bot className="size-4 text-primary" /> : <User className="size-4 text-muted-foreground" />}
                                            </div>

                                            {/* Bubble */}
                                            <div className={`max-w-[80%] space-y-1 ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                                                <div
                                                    className={`rounded-2xl px-4 py-2.5 text-sm ${
                                                        message.role === 'assistant'
                                                            ? 'rounded-tl-sm bg-primary/10 text-foreground dark:bg-muted/40'
                                                            : 'rounded-tr-sm bg-primary text-primary-foreground'
                                                    }`}
                                                >
                                                    {message.content}
                                                </div>
                                                <div
                                                    className={`flex items-center gap-2 text-xs text-muted-foreground ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                                >
                                                    <span>{formatDate(message.created_at)}</span>
                                                    {message.tokens_used > 0 && <span>{message.tokens_used.toLocaleString('id-ID')} token</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
