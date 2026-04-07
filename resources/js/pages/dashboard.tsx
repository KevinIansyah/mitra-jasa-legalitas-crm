import { Head, usePage } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import * as React from 'react';
import { Area, AreaChart, CartesianGrid, Label, Pie, PieChart, XAxis, YAxis } from 'recharts';

import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import AppLayout from '@/layouts/app-layout';

import { formatRupiah, formatRupiahCompact } from '@/lib/service';
import { cn } from '@/lib/utils';
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
    projects: number;
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

type MonthlyRevenueExpenseRow = {
    period: string;
    month_short: string;
    revenue: number;
    expense: number;
};

type KpiTrend = {
    value: number;
    delta_percent: number | null;
    footer: string;
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

function formatCompactIdr(amountRupiah: number): string {
    const amount = Number(amountRupiah);
    const abs = Math.abs(amount);
    if (abs >= 1_000_000_000) {
        return `${(amount / 1_000_000_000).toFixed(1)}M`;
    }
    if (abs >= 1_000_000) {
        return `${(amount / 1_000_000).toFixed(1)} jt`;
    }
    if (abs >= 1_000) {
        return `${(amount / 1_000).toFixed(0)} rb`;
    }
    return `${Math.round(amount)}`;
}

const activityChartConfig = {
    chats: { label: 'Sesi chat AI', color: 'hsl(262 83% 58%)' },
    contacts: { label: 'Pesan kontak', color: 'hsl(199 89% 48%)' },
} satisfies ChartConfig;

const plMonthlyConfig = {
    revenue: { label: 'Pendapatan', color: '#10b981' },
    expense: { label: 'Pengeluaran', color: '#ef4444' },
} satisfies ChartConfig;

const CHAT_STATUS_FILL: Record<string, string> = {
    active: 'hsl(262 83% 58%)',
    closed: 'hsl(215 16% 47%)',
    converted: 'hsl(160 84% 39%)',
};

function trendSentence(key: 'revenue' | 'contacts' | 'chats' | 'companies' | 'projects' | 'blogs' | 'users', delta: number | null): string {
    if (delta === null) {
        return 'Belum ada data pembanding';
    }
    if (delta === 0) {
        return 'Stabil dibanding periode sebelumnya';
    }
    const up = delta > 0;
    if (key === 'revenue' || key === 'projects' || key === 'blogs' || key === 'users') {
        return up ? 'Naik dibanding bulan lalu' : 'Turun dibanding bulan lalu';
    }
    if (key === 'companies') {
        return up ? 'Pendaftaran baru lebih tinggi' : 'Pendaftaran baru lebih rendah';
    }
    return up ? 'Lebih tinggi dari minggu sebelumnya' : 'Lebih rendah dari minggu sebelumnya';
}

function KpiStatCard({
    title,
    value,
    format: fmt,
    deltaPercent,
    trendKey,
    footer,
}: {
    title: string;
    value: number;
    format: 'rupiah' | 'number';
    deltaPercent: number | null;
    trendKey: 'revenue' | 'contacts' | 'chats' | 'companies' | 'projects' | 'blogs' | 'users';
    footer: React.ReactNode;
}) {
    const up = deltaPercent !== null && deltaPercent > 0;
    const down = deltaPercent !== null && deltaPercent < 0;
    const flat = deltaPercent === 0;

    return (
        <Card className="@container/card flex h-full flex-col gap-0 border-none bg-sidebar py-0 shadow dark:shadow-none">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 px-6 pt-6 pb-2">
                <CardTitle className="text-sm leading-tight font-medium text-muted-foreground">{title}</CardTitle>
                {deltaPercent !== null ? (
                    <Badge
                        className={cn(
                            'inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-1 text-xs font-medium tabular-nums',
                            up && 'bg-emerald-500 text-white dark:bg-emerald-500/15 dark:text-emerald-500',
                            down && 'bg-red-500 text-white dark:bg-red-500/15 dark:text-red-500',
                            flat && 'bg-secondary/50 text-muted-foreground',
                        )}
                    >
                        {up ? <TrendingUp className="size-3.5" /> : down ? <TrendingDown className="size-3.5" /> : <Minus className="size-3.5" />}
                        {deltaPercent > 0 ? '+' : ''}
                        {deltaPercent}%
                    </Badge>
                ) : (
                    <span className="shrink-0 rounded-full bg-secondary/50 px-3 py-[7px] text-xs text-muted-foreground">
                        <Minus className="size-3.5" />
                    </span>
                )}
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-4 px-6 pt-0 pb-6">
                <div className="space-y-2">
                    <p className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
                        {fmt === 'rupiah' ? formatRupiahCompact(value) : value.toLocaleString('id-ID')}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-foreground">
                        {/* {deltaPercent !== null && deltaPercent !== 0 ? (
                            up ? (
                                <ArrowUpRight className="size-4 h-4 min-w-4 text-emerald-500" />
                            ) : (
                                <ArrowDownRight className="size-4 h-4 min-w-4 text-red-500" />
                            )
                        ) : (
                            <Minus className="size-3.5 h-3.5 min-w-3.5 text-muted-foreground" />
                        )} */}
                        {trendSentence(trendKey, deltaPercent)}
                    </p>
                </div>
                <div className="border-t border-border/60 pt-3 text-xs leading-relaxed text-muted-foreground">{footer}</div>
            </CardContent>
        </Card>
    );
}

export default function Page() {
    const { auth, activity, chatByStatus, revenueTotal, monthlyRevenueExpense, kpiTrends } = usePage<{
        auth: { user: { name: string; email: string } | null };
        stats: DashboardStats;
        activity: ActivityRow[];
        chatByStatus: ChatStatusRow[];
        revenueTotal: number;
        monthlyRevenueExpense: MonthlyRevenueExpenseRow[];
        kpiTrends: {
            revenue_month: KpiTrend;
            contacts_week: KpiTrend;
            chats_week: KpiTrend;
            companies: KpiTrend;
            projects: KpiTrend;
            blogs: KpiTrend;
            users: KpiTrend;
        };
    }>().props;

    const now = new Date();
    const greeting = greetingForHour(now.getHours());
    const firstName = auth.user?.name?.split(/\s+/)[0] ?? 'Admin';

    const activityChartData = React.useMemo(
        () =>
            activity.map((row) => ({
                ...row,
                dayShort: format(parseISO(`${row.date}T12:00:00`), 'EEE', { locale: localeId }),
                dayLong: format(parseISO(`${row.date}T12:00:00`), 'EEEE, d MMM yyyy', { locale: localeId }),
            })),
        [activity],
    );

    const activityMax = React.useMemo(() => {
        let maxDayTotal = 0;
        activityChartData.forEach((dayRow) => {
            maxDayTotal = Math.max(maxDayTotal, dayRow.chats, dayRow.contacts);
        });
        return maxDayTotal === 0 ? 4 : Math.ceil(maxDayTotal * 1.15);
    }, [activityChartData]);

    const monthlyPlMax = React.useMemo(() => {
        let monthlyPlMax = 0;
        monthlyRevenueExpense.forEach((monthRow) => {
            monthlyPlMax = Math.max(monthlyPlMax, monthRow.revenue, monthRow.expense);
        });
        return monthlyPlMax === 0 ? 1 : Math.ceil(monthlyPlMax * 1.15);
    }, [monthlyRevenueExpense]);

    const donutData = React.useMemo(
        () =>
            chatByStatus.map((row) => ({
                status: row.status,
                label: row.label,
                count: row.count,
                fill: CHAT_STATUS_FILL[row.status] ?? 'hsl(280 65% 60%)',
            })),
        [chatByStatus],
    );

    const donutConfig = React.useMemo(() => {
        const cfg: ChartConfig = { count: { label: 'Jumlah' } };
        chatByStatus.forEach((row) => {
            cfg[row.status] = {
                label: row.label,
                color: CHAT_STATUS_FILL[row.status] ?? 'hsl(280 65% 60%)',
            };
        });
        return cfg;
    }, [chatByStatus]);

    const totalChatSessions = donutData.reduce((acc, row) => acc + row.count, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="p-4 md:p-6">
                <Heading title={`${greeting}, ${firstName}`} description="Ringkasan kinerja, komunikasi, dan proyek" />

                <div className="flex flex-1 flex-col gap-4">
                    <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <KpiStatCard
                            title="Pendapatan Bulan Ini"
                            value={kpiTrends.revenue_month.value}
                            format="rupiah"
                            deltaPercent={kpiTrends.revenue_month.delta_percent}
                            trendKey="revenue"
                            footer={
                                <>
                                    {kpiTrends.revenue_month.footer} Total kumulatif:{' '}
                                    <span className="font-medium text-foreground tabular-nums">{formatRupiahCompact(revenueTotal)}</span>
                                </>
                            }
                        />
                        <KpiStatCard
                            title="Pesan Kontak (7 Hari)"
                            value={kpiTrends.contacts_week.value}
                            format="number"
                            deltaPercent={kpiTrends.contacts_week.delta_percent}
                            trendKey="contacts"
                            footer={kpiTrends.contacts_week.footer}
                        />
                        <KpiStatCard
                            title="Sesi Chat (7 Hari)"
                            value={kpiTrends.chats_week.value}
                            format="number"
                            deltaPercent={kpiTrends.chats_week.delta_percent}
                            trendKey="chats"
                            footer={kpiTrends.chats_week.footer}
                        />
                    </div>

                    <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <KpiStatCard
                            title="Perusahaan Terdaftar"
                            value={kpiTrends.companies.value}
                            format="number"
                            deltaPercent={kpiTrends.companies.delta_percent}
                            trendKey="companies"
                            footer={kpiTrends.companies.footer}
                        />
                        <KpiStatCard
                            title="Pengguna"
                            value={kpiTrends.users.value}
                            format="number"
                            deltaPercent={kpiTrends.users.delta_percent}
                            trendKey="users"
                            footer={kpiTrends.users.footer}
                        />
                        <KpiStatCard
                            title="Proyek"
                            value={kpiTrends.projects.value}
                            format="number"
                            deltaPercent={kpiTrends.projects.delta_percent}
                            trendKey="projects"
                            footer={kpiTrends.projects.footer}
                        />
                        <KpiStatCard
                            title="Artikel Terbit"
                            value={kpiTrends.blogs.value}
                            format="number"
                            deltaPercent={kpiTrends.blogs.delta_percent}
                            trendKey="blogs"
                            footer={kpiTrends.blogs.footer}
                        />
                    </div>

                    <Card className="border-none bg-sidebar py-0 shadow dark:shadow-none">
                        <CardHeader className="mt-6 border-b">
                            <CardTitle className="">Pendapatan & Pengeluaran per Bulan</CardTitle>
                            <CardDescription>12 bulan terakhir - Garis hijau: pendapatan (jurnal) - Garis merah: pengeluaran/beban - Sumbu: Rupiah</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pb-6">
                            <ChartContainer config={plMonthlyConfig} className="aspect-auto h-80 w-full">
                                <AreaChart accessibilityLayer data={monthlyRevenueExpense} margin={{ left: 4, right: 12, top: 8, bottom: 0 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis
                                        dataKey="period"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={10}
                                        minTickGap={4}
                                        height={36}
                                        tickFormatter={(period: string) => format(parseISO(`${period}-01`), 'MMM yy', { locale: localeId })}
                                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        domain={[0, monthlyPlMax]}
                                        tickFormatter={(v) => formatCompactIdr(Number(v))}
                                        width={52}
                                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                    />
                                    <ChartTooltip
                                        cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                                        content={
                                            <ChartTooltipContent
                                                labelFormatter={(_, payload) => {
                                                    const p = payload?.[0]?.payload as MonthlyRevenueExpenseRow | undefined;
                                                    if (!p?.period) {
                                                        return '';
                                                    }
                                                    return format(parseISO(`${p.period}-01`), 'LLLL yyyy', { locale: localeId });
                                                }}
                                                formatter={(value, name, item) => {
                                                    const dataKey = item && typeof item === 'object' && 'dataKey' in item ? String(item.dataKey) : '';
                                                    const stroke =
                                                        item && typeof item === 'object' && 'color' in item && item.color
                                                            ? String(item.color)
                                                            : dataKey === 'revenue'
                                                              ? plMonthlyConfig.revenue.color
                                                              : dataKey === 'expense'
                                                                ? plMonthlyConfig.expense.color
                                                                : 'hsl(var(--muted))';
                                                    return (
                                                        <span className="flex items-center gap-2 tabular-nums">
                                                            <span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: stroke }} aria-hidden />
                                                            <span>
                                                                {name}: {formatRupiah(Number(value))}
                                                            </span>
                                                        </span>
                                                    );
                                                }}
                                            />
                                        }
                                    />
                                    <defs>
                                        <linearGradient id="fillPlRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--color-revenue)" stopOpacity={0.45} />
                                            <stop offset="100%" stopColor="var(--color-revenue)" stopOpacity={0.06} />
                                        </linearGradient>
                                        <linearGradient id="fillPlExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--color-expense)" stopOpacity={0.45} />
                                            <stop offset="100%" stopColor="var(--color-expense)" stopOpacity={0.06} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="revenue" name="Pendapatan" stroke="var(--color-revenue)" fill="url(#fillPlRevenue)" strokeWidth={1} />
                                    <Area type="monotone" dataKey="expense" name="Pengeluaran" stroke="var(--color-expense)" fill="url(#fillPlExpense)" strokeWidth={1} />
                                    <ChartLegend content={<ChartLegendContent />} className="pt-3" />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 lg:grid-cols-5">
                        <Card className="border-none bg-sidebar py-0 shadow lg:col-span-3 dark:shadow-none">
                            <CardHeader className="mt-6 border-b">
                                <CardTitle className="text-base">Aktivitas 7 Hari Terakhir</CardTitle>
                                <CardDescription>Garis ungu: sesi chat AI - Garis biru: pesan kontak baru - Sumbu: jumlah per hari</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pb-6">
                                <ChartContainer config={activityChartConfig} className="aspect-auto h-80 w-full">
                                    <AreaChart accessibilityLayer data={activityChartData} margin={{ left: 4, right: 12, top: 8, bottom: 0 }}>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis dataKey="dayShort" tickLine={false} axisLine={false} tickMargin={10} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            domain={[0, activityMax]}
                                            allowDecimals={false}
                                            width={36}
                                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                        />
                                        <ChartTooltip
                                            cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                                            content={
                                                <ChartTooltipContent
                                                    labelFormatter={(_, payload) => {
                                                        const p = payload?.[0]?.payload as { dayLong?: string } | undefined;
                                                        return p?.dayLong ?? '';
                                                    }}
                                                    formatter={(value, name) => (
                                                        <span className="tabular-nums">
                                                            {name}: {Number(value).toLocaleString('id-ID')}
                                                        </span>
                                                    )}
                                                />
                                            }
                                        />
                                        <defs>
                                            <linearGradient id="fillChats" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="var(--color-chats)" stopOpacity={0.45} />
                                                <stop offset="100%" stopColor="var(--color-chats)" stopOpacity={0.06} />
                                            </linearGradient>
                                            <linearGradient id="fillContacts" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="var(--color-contacts)" stopOpacity={0.45} />
                                                <stop offset="100%" stopColor="var(--color-contacts)" stopOpacity={0.06} />
                                            </linearGradient>
                                        </defs>
                                        <Area type="monotone" dataKey="contacts" name="Pesan kontak" stroke="var(--color-contacts)" fill="url(#fillContacts)" strokeWidth={1} />
                                        <Area type="monotone" dataKey="chats" name="Sesi chat" stroke="var(--color-chats)" fill="url(#fillChats)" strokeWidth={1} />
                                        <ChartLegend content={<ChartLegendContent />} className="pt-3" />
                                    </AreaChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        <Card className="border-none bg-sidebar py-0 shadow lg:col-span-2 dark:shadow-none">
                            <CardHeader className="mt-6 border-b">
                                <CardTitle className="text-base">Status Sesi Chat</CardTitle>
                                <CardDescription>Hover irisan untuk detail - Angka di tengah = total</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-1 flex-col items-center p-4 pb-2">
                                {donutData.length ? (
                                    <ChartContainer config={donutConfig} className="mx-auto aspect-square max-h-80 w-full">
                                        <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                                            <ChartTooltip
                                                cursor={false}
                                                content={
                                                    <ChartTooltipContent
                                                        nameKey="label"
                                                        hideLabel
                                                        formatter={(value, name) => {
                                                            const n = Number(value);
                                                            const pct = totalChatSessions > 0 ? ((n / totalChatSessions) * 100).toFixed(1) : '0';
                                                            return (
                                                                <span className="tabular-nums">
                                                                    {String(name)}: {n.toLocaleString('id-ID')} sesi ({pct}%)
                                                                </span>
                                                            );
                                                        }}
                                                    />
                                                }
                                            />
                                            <Pie data={donutData} dataKey="count" nameKey="label" innerRadius={54} outerRadius={88} stroke="none" strokeWidth={0} paddingAngle={0}>
                                                <Label
                                                    content={({ viewBox }) => {
                                                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                                            return (
                                                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-lg font-bold">
                                                                        {totalChatSessions.toLocaleString('id-ID')}
                                                                    </tspan>
                                                                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 18} className="fill-muted-foreground text-[11px]">
                                                                        total sesi
                                                                    </tspan>
                                                                </text>
                                                            );
                                                        }
                                                    }}
                                                />
                                            </Pie>
                                            <ChartLegend
                                                content={<ChartLegendContent nameKey="status" />}
                                                className="flex-wrap justify-center gap-x-4 gap-y-2 pt-2 text-foreground"
                                            />
                                        </PieChart>
                                    </ChartContainer>
                                ) : (
                                    <div className="flex min-h-56 w-full items-center justify-center text-sm text-muted-foreground">Belum ada data sesi chat</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
