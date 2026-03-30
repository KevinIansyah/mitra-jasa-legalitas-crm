import { Head, usePage } from '@inertiajs/react';
import { ArrowDownToLine, TrendingDown, TrendingUp } from 'lucide-react';
import * as React from 'react';
import { Bar, BarChart, CartesianGrid, Label, Pie, PieChart, XAxis } from 'recharts';

import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import AppLayout from '@/layouts/app-layout';

import { formatRupiah } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import finances from '@/routes/finances';
import type { BreadcrumbItem } from '@/types';
import type { CashFlowReport, PeriodFilters } from '@/types/financial-reports';
import { PeriodFilterSheet } from './_components/report-filter-sheet';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Laporan', href: '#' },
    { title: 'Arus Kas', href: '#' },
];

const barChartConfig = {
    cash_in: { label: 'Kas Masuk', color: 'var(--chart-2)' },
    cash_out: { label: 'Kas Keluar', color: 'var(--chart-1)' },
} satisfies ChartConfig;

const ACTIVITY_COLORS: Record<string, string> = {
    invoice: 'var(--chart-1)',
    payment: 'var(--chart-2)',
    expense: 'var(--chart-3)',
    opening_balance: 'var(--chart-4)',
    manual: 'var(--chart-5)',
};

export default function Page() {
    const { report, filters } = usePage<{
        report: CashFlowReport;
        filters: PeriodFilters;
    }>().props;

    const [activeChart, setActiveChart] = React.useState<'cash_in' | 'cash_out'>('cash_in');

    const donutData = React.useMemo(
        () =>
            report.activities
                .filter((a) => a.cash_in > 0)
                .map((a) => ({
                    type: a.type,
                    label: a.label,
                    value: a.cash_in,
                    fill: ACTIVITY_COLORS[a.type] ?? 'var(--chart-5)',
                })),
        [report],
    );

    const donutConfig = React.useMemo(() => {
        const cfg: ChartConfig = { value: { label: 'Jumlah' } };
        report.activities.forEach((a) => {
            cfg[a.type] = { label: a.label, color: ACTIVITY_COLORS[a.type] ?? 'var(--chart-5)' };
        });
        return cfg as ChartConfig;
    }, [report]);

    const totalCashIn = React.useMemo(() => donutData.reduce((acc, d) => acc + d.value, 0), [donutData]);

    const summaryCards = [
        {
            label: 'Total Kas Masuk',
            value: formatRupiah(report.cash_in),
            description: `${formatDate(filters.from)} s/d ${formatDate(filters.to)}`,
            trend: 'up' as const,
        },
        {
            label: 'Total Kas Keluar',
            value: formatRupiah(report.cash_out),
            description: `${formatDate(filters.from)} s/d ${formatDate(filters.to)}`,
            trend: 'down' as const,
        },
        {
            label: report.net_cashflow >= 0 ? 'Net Cashflow (+)' : 'Net Cashflow (-)',
            value: formatRupiah(Math.abs(report.net_cashflow)),
            description: report.net_cashflow >= 0 ? 'Kas bertambah' : 'Kas berkurang',
            trend: report.net_cashflow >= 0 ? ('up' as const) : ('down' as const),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Arus Kas" />
            <div className="space-y-4 p-4 md:p-6">
                <div>
                    <Heading title="Laporan Arus Kas" description="Pergerakan kas dan bank dalam periode tertentu" />
                </div>

                <div className="flex items-center gap-2">
                    <PeriodFilterSheet from={filters.from} to={filters.to} routeUrl={finances.reports.cashFlow().url} />
                    <Button className="flex-1 md:w-30 md:flex-none" asChild>
                        <a href={finances.reports.cashFlow.pdf.url({ query: { from: filters.from, to: filters.to } })} target="_blank" rel="noopener noreferrer">
                            <ArrowDownToLine className="size-3.5" />
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
                                <CardAction>
                                    {trend === 'up' ? (
                                        <Badge className="bg-emerald-500 px-2.5 py-1.5 text-white dark:bg-emerald-500/15 dark:text-emerald-500">
                                            <TrendingUp />
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-red-500 px-2.5 py-1.5 text-white dark:bg-red-500/15 dark:text-red-500">
                                            <TrendingDown />
                                        </Badge>
                                    )}
                                </CardAction>
                            </CardHeader>
                            <CardFooter className="text-sm text-muted-foreground">{description}</CardFooter>
                        </Card>
                    ))}
                </div>

                {/* ───────────────── Interactive bar chart Section ───────────────── */}
                <Card className="border-none bg-sidebar py-0 shadow dark:shadow-none">
                    <CardHeader className="mt-6 flex flex-col items-stretch border-b sm:flex-row">
                        <div className="flex flex-1 flex-col justify-center gap-1">
                            <CardTitle>Pergerakan Kas per Bulan</CardTitle>
                            <CardDescription>
                                {formatDate(filters.from)} s/d {formatDate(filters.to)}
                            </CardDescription>
                        </div>

                        <div className="flex gap-2">
                            {(['cash_in', 'cash_out'] as const).map((key) => (
                                <button
                                    key={key}
                                    data-active={activeChart === key}
                                    className="relative flex w-45 flex-1 items-center justify-center gap-2 border px-6 py-3 whitespace-nowrap data-[active=true]:bg-muted/50 sm:px-8"
                                    onClick={() => setActiveChart(key)}
                                >
                                    <span className="size-2 rounded-[2px]" style={{ backgroundColor: barChartConfig[key].color }} />
                                    <span className="text-sm font-medium">{barChartConfig[key].label}</span>
                                </button>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        <ChartContainer config={barChartConfig} className="aspect-auto h-62.5 w-full">
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
                    </CardContent>
                </Card>

                {/* ───────────────── Donut & Detail Section ───────────────── */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Card className="border-none bg-sidebar shadow dark:shadow-none">
                        <CardHeader>
                            <CardTitle>Sumber Kas Masuk</CardTitle>
                            <CardDescription>
                                Proporsi per aktivitas - {formatDate(filters.from)} s/d {formatDate(filters.to)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 pb-0">
                            {donutData.length ? (
                                <ChartContainer config={donutConfig} className="mx-auto aspect-square max-h-80">
                                    <PieChart>
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel formatter={(val) => formatRupiah(val as number)} />} />
                                        <Pie data={donutData} dataKey="value" nameKey="type" innerRadius={70} strokeWidth={4}>
                                            <Label
                                                content={({ viewBox }) => {
                                                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                                        return (
                                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-xl font-bold">
                                                                    {formatRupiah(totalCashIn)}
                                                                </tspan>
                                                                <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 22} className="fill-muted-foreground text-xs">
                                                                    Total Masuk
                                                                </tspan>
                                                            </text>
                                                        );
                                                    }
                                                }}
                                            />
                                        </Pie>

                                        <ChartLegend content={<ChartLegendContent nameKey="type" />} className="flex-wrap justify-center gap-x-4 gap-y-1 pt-2" />
                                    </PieChart>
                                </ChartContainer>
                            ) : (
                                <div className="flex h-65 items-center justify-center text-sm text-muted-foreground">Tidak ada data dalam periode ini</div>
                            )}
                        </CardContent>
                        <CardFooter className="flex-col gap-1 pt-4 text-sm text-muted-foreground">
                            <p>Menampilkan distribusi sumber kas masuk per jenis aktivitas</p>
                        </CardFooter>
                    </Card>

                    <Card className="border-none bg-sidebar shadow dark:shadow-none">
                        <CardHeader>
                            <CardTitle>Rincian per Aktivitas</CardTitle>
                            <CardDescription>Kas masuk & keluar per jenis transaksi</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            {report.activities.length ? (
                                report.activities.map((act) => (
                                    <div key={act.type} className="border-b py-3 last:border-0">
                                        <div className="mb-1.5 flex items-center gap-2">
                                            <span className="size-2.5 rounded-[2px]" style={{ backgroundColor: ACTIVITY_COLORS[act.type] ?? 'currentColor' }} />
                                            <span className="text-sm font-medium">{act.label}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>
                                                Masuk: <span className="font-medium text-emerald-600">{formatRupiah(act.cash_in)}</span>
                                            </span>
                                            <span>
                                                Keluar: <span className="font-medium text-red-500">{formatRupiah(act.cash_out)}</span>
                                            </span>
                                            <span>
                                                Net: <span className={`font-medium ${act.net >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{formatRupiah(act.net)}</span>
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="flex h-65 items-center justify-center text-sm text-muted-foreground">Tidak ada data</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
