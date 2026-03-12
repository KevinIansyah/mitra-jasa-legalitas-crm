import { Head, usePage } from '@inertiajs/react';
import { FileDown } from 'lucide-react';

import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import AppLayout from '@/layouts/app-layout';
import { formatRupiah } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import finances from '@/routes/finances';
import reportRoutes from '@/routes/finances/reports';
import type { BreadcrumbItem } from '@/types';
import type { AsOfFilters, NeracaReport, ReportAccountItem } from '@/types/financial-reports';
import { AsOfFilterSheet } from './_components/report-filter-sheet';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Laporan', href: '#' },
    { title: 'Neraca', href: '#' },
];

const SECTION_META: Record<string, { description: string }> = {
    Aset: { description: 'Sumber daya yang dimiliki perusahaan' },
    Kewajiban: { description: 'Hutang dan kewajiban yang harus dibayar' },
    Ekuitas: { description: 'Hak pemilik atas aset perusahaan' },
};

function NeracaSection({ title, items, total }: { title: string; items: ReportAccountItem[]; total: number }) {
    const meta = SECTION_META[title];

    return (
        <Card className="border-none bg-sidebar shadow dark:shadow-none">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{meta?.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
                {items.length ? (
                    items.map((item) => (
                        <div key={item.code} className="flex items-center justify-between border-b py-3 text-sm last:border-0">
                            <div className="flex items-center gap-2">
                                <span className="w-14 text-xs text-muted-foreground">{item.code}</span>
                                <span>{item.name}</span>
                            </div>
                            <span className="font-medium tabular-nums">{formatRupiah(Number(item.amount))}</span>
                        </div>
                    ))
                ) : (
                    <p className="flex h-32 items-center justify-center text-sm text-muted-foreground">Tidak ada data.</p>
                )}
                <div className="flex items-center justify-between border-t pt-3 text-sm font-medium">
                    <span>Total {title}</span>
                    <span className="tabular-nums">{formatRupiah(Number(total))}</span>
                </div>
            </CardContent>
        </Card>
    );
}

export default function Page() {
    const { report, filters } = usePage<{
        report: NeracaReport;
        filters: AsOfFilters;
    }>().props;

    const summaryCards = [
        { label: 'Total Aset', value: formatRupiah(report.assets.total), description: `Per ${formatDate(filters.as_of)}` },
        { label: 'Total Kewajiban', value: formatRupiah(report.liabilities.total), description: `Per ${formatDate(filters.as_of)}` },
        { label: 'Total Ekuitas', value: formatRupiah(report.equity.total), description: `Per ${formatDate(filters.as_of)}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Neraca" />
            <div className="space-y-4 p-4 md:p-6">
                <div>
                    <Heading title="Neraca" description="Posisi keuangan perusahaan pada tanggal tertentu" />
                </div>

                <div className="flex items-center gap-2">
                    <AsOfFilterSheet asOf={formatDate(filters.as_of)} routeUrl={reportRoutes.balanceSheet().url} />
                    <Button className="flex-1 md:w-30 md:flex-none" asChild>
                        <a href={`${finances.reports.balanceSheet.pdf.url({ query: { as_of: filters.as_of } })}`} target="_blank" rel="noopener noreferrer">
                            <FileDown className="size-3.5" />
                            Export PDF
                        </a>
                    </Button>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {summaryCards.map(({ label, value, description }) => (
                        <Card key={label} className="border-none bg-sidebar shadow dark:shadow-none">
                            <CardHeader>
                                <CardDescription>{label}</CardDescription>
                                <CardTitle className="text-3xl font-semibold tabular-nums">{value}</CardTitle>
                            </CardHeader>
                            <CardFooter className="text-sm text-muted-foreground">{description}</CardFooter>
                        </Card>
                    ))}
                </div>

                {/* Balance status */}
                <Card className="border-none bg-sidebar shadow dark:shadow-none">
                    <CardHeader>
                        <CardDescription>Persamaan Akuntansi</CardDescription>
                        <CardTitle className="text-3xl font-semibold tabular-nums">{formatRupiah(report.assets.total)}</CardTitle>
                        <CardAction>
                            <Badge className={report.is_balanced ? 'border-emerald-500 bg-emerald-500 px-2 py-1 text-white' : 'border-red-500 bg-red-500 px-2 py-1 text-white'}>
                                {report.is_balanced ? 'Balance' : 'Tidak Balance'}
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="text-sm text-muted-foreground">
                        Aset = Kewajiban + Ekuitas &nbsp;→&nbsp; {formatRupiah(report.assets.total)} = {formatRupiah(report.total_liabilities_and_equity)}
                    </CardFooter>
                </Card>

                {/* Detail sections */}
                <NeracaSection title="Aset" items={report.assets.detail} total={report.assets.total} />
                <NeracaSection title="Kewajiban" items={report.liabilities.detail} total={report.liabilities.total} />
                <NeracaSection title="Ekuitas" items={report.equity.detail} total={report.equity.total} />
            </div>
        </AppLayout>
    );
}
