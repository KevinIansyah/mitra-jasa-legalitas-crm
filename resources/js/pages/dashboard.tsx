import { Head, usePage } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { BookOpen, Bot, Building2, Briefcase, MessageSquare, Users } from 'lucide-react';
import * as React from 'react';
import { Area, AreaChart, CartesianGrid, Label, Pie, PieChart, XAxis } from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import AppLayout from '@/layouts/app-layout';
import dashboard from '@/routes/dashboard';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard.index().url,
    },
];

type DashboardStats = {
    companies: number;
    services: number;
    blogs_published: number;
    users: number;
    contact_messages: number;
    contact_unread: number;
    chat_sessions: number;
};

type ActivityRow = {
    date: string;
    chats: number;
    contacts: number;
};

type ChatStatusRow = {
    status: string;
    label: string;
    count: number;
};

function greetingForHour(hour: number): string {
    if (hour < 11) {
        return 'Selamat pagi';
    }
    if (hour < 15) {
        return 'Selamat siang';
    }
    if (hour < 18) {
        return 'Selamat sore';
    }
    return 'Selamat malam';
}

const activityChartConfig = {
    chats: { label: 'Sesi chat AI', color: 'var(--chart-1)' },
    contacts: { label: 'Pesan kontak', color: 'var(--chart-2)' },
} satisfies ChartConfig;

const CHAT_STATUS_FILL: Record<string, string> = {
    active: 'var(--chart-1)',
    closed: 'var(--chart-3)',
    converted: 'var(--chart-2)',
};

export default function Page() {
    const { auth, stats, activity, chatByStatus } = usePage<{
        auth: { user: { name: string; email: string } | null };
        stats: DashboardStats;
        activity: ActivityRow[];
        chatByStatus: ChatStatusRow[];
    }>().props;

    const now = new Date();
    const greeting = greetingForHour(now.getHours());
    const firstName = auth.user?.name?.split(/\s+/)[0] ?? 'Admin';
    const dateLabel = format(now, "EEEE, d MMMM yyyy", { locale: localeId });

    const activityChartData = React.useMemo(
        () =>
            activity.map((row) => ({
                ...row,
                dayShort: format(parseISO(`${row.date}T12:00:00`), 'EEE', { locale: localeId }),
            })),
        [activity],
    );

    const donutData = React.useMemo(
        () =>
            chatByStatus.map((row) => ({
                status: row.status,
                label: row.label,
                count: row.count,
                fill: CHAT_STATUS_FILL[row.status] ?? 'var(--chart-4)',
            })),
        [chatByStatus],
    );

    const donutConfig = React.useMemo(() => {
        const cfg: ChartConfig = { count: { label: 'Jumlah' } };
        chatByStatus.forEach((row) => {
            cfg[row.status] = {
                label: row.label,
                color: CHAT_STATUS_FILL[row.status] ?? 'var(--chart-4)',
            };
        });
        return cfg;
    }, [chatByStatus]);

    const totalChatSessions = donutData.reduce((acc, d) => acc + d.count, 0);

    const statCards = [
        {
            title: 'Perusahaan',
            value: stats.companies,
            description: 'Kontak perusahaan terdaftar',
            icon: Building2,
        },
        {
            title: 'Layanan',
            value: stats.services,
            description: 'Paket & halaman layanan',
            icon: Briefcase,
        },
        {
            title: 'Artikel terbit',
            value: stats.blogs_published,
            description: 'Blog yang dipublikasikan',
            icon: BookOpen,
        },
        {
            title: 'Pengguna',
            value: stats.users,
            description: 'Akun panel admin',
            icon: Users,
        },
        {
            title: 'Pesan kontak',
            value: stats.contact_messages,
            description: 'Formulir kontak situs',
            icon: MessageSquare,
            badge: stats.contact_unread > 0 ? `${stats.contact_unread} belum dibaca` : undefined,
        },
        {
            title: 'Sesi chat AI',
            value: stats.chat_sessions,
            description: 'Percakapan widget chatbot',
            icon: Bot,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4 pt-0 md:p-6">
                <div className="space-y-1 border-b border-border/60 pb-6">
                    <p className="text-sm font-medium text-muted-foreground">{dateLabel}</p>
                    <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                        {greeting}, {firstName}
                    </h1>
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        Ringkasan aktivitas situs dan saluran komunikasi untuk 7 hari terakhir.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {statCards.map(({ title, value, description, icon: Icon, badge }) => (
                        <Card key={title} className="border-none bg-sidebar shadow-sm dark:shadow-none">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                                <div className="flex items-center gap-2">
                                    {badge !== undefined ? <Badge variant="secondary">{badge}</Badge> : null}
                                    <span className="rounded-md bg-muted/80 p-2 text-muted-foreground">
                                        <Icon className="size-4" />
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-semibold tabular-nums">{value.toLocaleString('id-ID')}</p>
                                <CardDescription className="mt-1.5">{description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-5">
                    <Card className="border-none bg-sidebar py-0 shadow-sm dark:shadow-none lg:col-span-3">
                        <CardHeader className="mt-6">
                            <CardTitle>Aktivitas 7 hari terakhir</CardTitle>
                            <CardDescription>Sesi chat AI vs pesan kontak baru per hari</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-6">
                            <ChartContainer config={activityChartConfig} className="aspect-auto h-72 w-full">
                                <AreaChart accessibilityLayer data={activityChartData} margin={{ left: 8, right: 8 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="dayShort" tickLine={false} axisLine={false} tickMargin={10} />
                                    <ChartTooltip
                                        cursor={{ className: 'stroke-border' }}
                                        content={
                                            <ChartTooltipContent
                                                labelFormatter={(_, payload) => {
                                                    const p = payload?.[0]?.payload as { date?: string } | undefined;
                                                    if (!p?.date) {
                                                        return '';
                                                    }
                                                    return format(parseISO(`${p.date}T12:00:00`), 'd MMM yyyy', { locale: localeId });
                                                }}
                                            />
                                        }
                                    />
                                    <defs>
                                        <linearGradient id="fillChats" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--color-chats)" stopOpacity={0.35} />
                                            <stop offset="100%" stopColor="var(--color-chats)" stopOpacity={0.05} />
                                        </linearGradient>
                                        <linearGradient id="fillContacts" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--color-contacts)" stopOpacity={0.35} />
                                            <stop offset="100%" stopColor="var(--color-contacts)" stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>
                                    <Area
                                        type="monotone"
                                        dataKey="contacts"
                                        stroke="var(--color-contacts)"
                                        fill="url(#fillContacts)"
                                        strokeWidth={2}
                                    />
                                    <Area type="monotone" dataKey="chats" stroke="var(--color-chats)" fill="url(#fillChats)" strokeWidth={2} />
                                </AreaChart>
                            </ChartContainer>
                            <ChartLegend content={<ChartLegendContent />} className="pt-2" />
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-sidebar py-0 shadow-sm dark:shadow-none lg:col-span-2">
                        <CardHeader className="mt-6">
                            <CardTitle>Status sesi chat</CardTitle>
                            <CardDescription>Distribusi sesi berdasarkan status</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col items-center pb-2">
                            {donutData.length ? (
                                <ChartContainer config={donutConfig} className="mx-auto aspect-square w-full max-h-72">
                                    <PieChart>
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent nameKey="status" hideLabel formatter={(val) => Number(val).toLocaleString('id-ID')} />}
                                        />
                                        <Pie data={donutData} dataKey="count" nameKey="status" innerRadius={56} strokeWidth={3}>
                                            <Label
                                                content={({ viewBox }) => {
                                                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                                        return (
                                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-xl font-bold">
                                                                    {totalChatSessions.toLocaleString('id-ID')}
                                                                </tspan>
                                                                <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs">
                                                                    total sesi
                                                                </tspan>
                                                            </text>
                                                        );
                                                    }
                                                }}
                                            />
                                        </Pie>
                                        <ChartLegend content={<ChartLegendContent nameKey="status" />} className="flex-wrap justify-center gap-x-3 gap-y-1" />
                                    </PieChart>
                                </ChartContainer>
                            ) : (
                                <div className="flex min-h-56 w-full items-center justify-center text-sm text-muted-foreground">Belum ada data sesi chat</div>
                            )}
                        </CardContent>
                        <CardFooter className="text-center text-xs text-muted-foreground">Aktif, ditutup pengguna, atau dikonversi menjadi prospek</CardFooter>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
