import { Head, usePage } from '@inertiajs/react';
import { FileDown, TrendingDown, TrendingUp } from 'lucide-react';
import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

import AppLayout from '@/layouts/app-layout';
import { formatRupiah } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import finances from '@/routes/finances';
import reportRoutes from '@/routes/finances/reports';
import type { BreadcrumbItem } from '@/types';
import type { LabaRugiReport, PeriodFilters } from '@/types/financial-reports';
import { PeriodFilterSheet } from './_components/report-filter-sheet';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Laporan', href: '#' },
    { title: 'Laba Rugi', href: '#' },
];

const chartConfig = {
    revenue: { label: 'Pendapatan', color: 'var(--chart-2)' },
    expense: { label: 'Beban', color: 'var(--chart-1)' },
} satisfies ChartConfig;

const defaultReport: LabaRugiReport = {
    period: { from: '', to: '' },
    revenue: { total: 0, detail: [] },
    expense: { total: 0, detail: [] },
    net_profit: 0,
    is_profitable: true,
    monthly: [],
};

const defaultFilters: PeriodFilters = { from: '', to: '' };

export default function Page() {
    const props = usePage<{
        report?: LabaRugiReport;
        filters?: PeriodFilters;
    }>().props;

    const report = props.report ?? defaultReport;
    const filters = props.filters ?? defaultFilters;

    const [activeChart, setActiveChart] = React.useState<'revenue' | 'expense'>('revenue');

    const summaryCards = [
        {
            label: 'Total Pendapatan',
            value: formatRupiah(report.revenue.total),
            description: filters.from && filters.to ? `${formatDate(filters.from)} s/d ${formatDate(filters.to)}` : '—',
            trend: report.revenue.total > 0 ? ('up' as const) : null,
        },
        {
            label: 'Total Beban',
            value: formatRupiah(report.expense.total),
            description: filters.from && filters.to ? `${formatDate(filters.from)} s/d ${formatDate(filters.to)}` : '—',
            trend: report.expense.total > 0 ? ('down' as const) : null,
        },
        {
            label: report.is_profitable ? 'Laba Bersih' : 'Rugi Bersih',
            value: formatRupiah(Math.abs(report.net_profit)),
            description: report.is_profitable ? 'Pendapatan melebihi beban' : 'Beban melebihi pendapatan',
            trend: report.is_profitable ? ('up' as const) : ('down' as const),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Laba Rugi" />
            <div className="space-y-4 p-4 md:p-6">
                <div>
                    <Heading title="Laporan Laba Rugi" description="Ringkasan pendapatan dan beban dalam periode tertentu" />
                </div>

                <div className="flex items-center gap-2">
                    <PeriodFilterSheet from={filters.from} to={filters.to} routeUrl={reportRoutes.profitLoss().url} />
                    <Button className="flex-1 md:w-30 md:flex-none" asChild>
                        <a href={finances.reports.profitLoss.pdf.url({ query: { from: filters.from, to: filters.to } })} target="_blank" rel="noopener noreferrer">
                            <FileDown className="size-3.5" />
                            Export PDF
                        </a>
                    </Button>
                </div>

                {/* ───────────────── Summary cards Section ───────────────── */}   
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {summaryCards.map(({ label, value, description, trend }) => (
                        <Card key={label} className="border-none bg-sidebar shadow dark:shadow-none">
                            <CardHeader>
                                <CardDescription>{label}</CardDescription>
                                <CardTitle className="text-3xl font-semibold tabular-nums">{value}</CardTitle>
                                {trend && (
                                    <CardAction>
                                        {trend === 'up' ? (
                                            <Badge className="border-emerald-500 bg-emerald-500 px-2 py-1 text-white">
                                                <TrendingUp />
                                            </Badge>
                                        ) : (
                                            <Badge className="border-red-500 bg-red-500 px-2 py-1 text-white">
                                                <TrendingDown />
                                            </Badge>
                                        )}
                                    </CardAction>
                                )}
                            </CardHeader>
                            <CardFooter className="text-sm text-muted-foreground">{description}</CardFooter>
                        </Card>
                    ))}
                </div>

                {/* ───────────────── Interactive bar chart Section ───────────────── */}
                <Card className="border-none bg-sidebar py-0 shadow dark:shadow-none">
                    <CardHeader className="mt-6 flex flex-col items-stretch border-b sm:flex-row">
                        <div className="flex flex-1 flex-col justify-center gap-1">
                            <CardTitle>Pendapatan & Beban per Bulan</CardTitle>
                            <CardDescription>{filters.from && filters.to ? `${formatDate(filters.from)} s/d ${formatDate(filters.to)}` : 'Semua periode'}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            {(['revenue', 'expense'] as const).map((key) => (
                                <button
                                    key={key}
                                    data-active={activeChart === key}
                                    className="relative z-30 flex w-45 flex-1 items-center justify-center gap-2 border px-6 py-3 whitespace-nowrap data-[active=true]:bg-muted/50 sm:px-8"
                                    onClick={() => setActiveChart(key)}
                                >
                                    <span className="size-2 rounded-[2px]" style={{ backgroundColor: chartConfig[key].color }} />
                                    <span className="text-sm font-medium">{chartConfig[key].label}</span>
                                </button>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        {report.monthly.length > 0 ? (
                            <ChartContainer config={chartConfig} className="aspect-auto h-62.5 w-full">
                                <BarChart accessibilityLayer data={report.monthly} margin={{ left: 12, right: 12 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="period"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        minTickGap={32}
                                        tickFormatter={(v) => {
                                            const [year, month] = v.split('-');
                                            return new Date(Number(year), Number(month) - 1).toLocaleDateString('id-ID', {
                                                month: 'short',
                                                year: '2-digit',
                                            });
                                        }}
                                    />
                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent
                                                className="w-45"
                                                nameKey={activeChart}
                                                labelFormatter={(v) => {
                                                    const [year, month] = v.split('-');
                                                    return new Date(Number(year), Number(month) - 1).toLocaleDateString('id-ID', {
                                                        month: 'long',
                                                        year: 'numeric',
                                                    });
                                                }}
                                                formatter={(val) => formatRupiah(val as number)}
                                            />
                                        }
                                    />
                                    <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ChartContainer>
                        ) : (
                            <div className="flex h-62.5 items-center justify-center text-sm text-muted-foreground">Tidak ada data dalam periode ini.</div>
                        )}
                    </CardContent>
                </Card>

                {/* ───────────────── Detail Section ───────────────── */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Card className="border-none bg-sidebar shadow dark:shadow-none">
                        <CardHeader>
                            <CardTitle>Rincian Pendapatan</CardTitle>
                            <CardDescription>Detail akun pendapatan periode ini</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            {report.revenue.detail.length > 0 ? (
                                report.revenue.detail.map((item) => (
                                    <div key={item.code} className="flex items-center justify-between border-b py-3 text-sm last:border-0">
                                        <div className="flex items-center gap-2">
                                            <span className="w-14 text-xs text-muted-foreground">{item.code}</span>
                                            <span>{item.name}</span>
                                        </div>
                                        <span className="tabular-nums">{formatRupiah(item.amount)}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="flex h-32 items-center justify-center text-sm text-muted-foreground">Tidak ada pendapatan dalam periode ini.</p>
                            )}
                            {report.revenue.detail.length > 0 && (
                                <div className="flex items-center justify-between border-t pt-3 text-sm font-medium">
                                    <span>Total</span>
                                    <span className="tabular-nums">{formatRupiah(report.revenue.total)}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-sidebar shadow dark:shadow-none">
                        <CardHeader>
                            <CardTitle>Rincian Beban</CardTitle>
                            <CardDescription>Detail akun beban periode ini</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            {report.expense.detail.length > 0 ? (
                                report.expense.detail.map((item) => (
                                    <div key={item.code} className="flex items-center justify-between border-b py-3 text-sm last:border-0">
                                        <div className="flex items-center gap-2">
                                            <span className="w-14 text-xs text-muted-foreground">{item.code}</span>
                                            <span>{item.name}</span>
                                        </div>
                                        <span className="tabular-nums">{formatRupiah(item.amount)}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="flex h-32 items-center justify-center text-sm text-muted-foreground">Tidak ada beban dalam periode ini.</p>
                            )}
                            {report.expense.detail.length > 0 && (
                                <div className="flex items-center justify-between border-t pt-3 text-sm font-medium">
                                    <span>Total</span>
                                    <span className="tabular-nums">{formatRupiah(report.expense.total)}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
