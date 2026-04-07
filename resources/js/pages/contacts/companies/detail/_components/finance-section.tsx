import { TrendingDown, TrendingUp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { formatRupiah } from '@/lib/service';
import type { CompanyFinanceSummary } from '@/types/contacts';

type FinanceSectionProps = {
    summary: CompanyFinanceSummary;
};

export function FinanceSection({ summary }: FinanceSectionProps) {
    const budget = Number(summary.total_budget ?? 0);
    const totalContractInvoiced = Number(summary.total_contract_invoiced ?? 0);
    const totalContractInvoicedWithTax = Number(summary.total_contract_invoiced_with_tax ?? 0);
    const totalContractPaid = Number(summary.total_contract_paid ?? 0);
    const totalContractPaidWithTax = Number(summary.total_contract_paid_with_tax ?? 0);
    const totalAdditionalInvoiced = Number(summary.total_additional_invoiced ?? 0);
    const totalAdditionalInvoicedWithTax = Number(summary.total_additional_invoiced_with_tax ?? 0);
    const totalAdditionalPaid = Number(summary.total_additional_paid ?? 0);
    const totalAdditionalPaidWithTax = Number(summary.total_additional_paid_with_tax ?? 0);
    const totalInvoicedWithTax = Number(summary.total_invoiced_with_tax ?? 0);
    const totalPaid = Number(summary.total_paid ?? 0);
    const totalPaidWithTax = Number(summary.total_paid_with_tax ?? 0);
    const remainingBill = Number(summary.remaining_bill ?? 0);
    const outstandingAmount = Number(summary.outstanding_amount ?? 0);
    const totalExpenses = Number(summary.total_expenses ?? 0);
    const billableExp = Number(summary.total_billable_expenses ?? 0);
    const nonBillableExp = Number(summary.non_billable_expenses ?? 0);
    const contractProfit = Number(summary.contract_profit ?? 0);
    const actualProfit = Number(summary.actual_profit ?? 0);
    const n = summary.projects_count ?? 0;

    const STAT_CARDS = [
        {
            label: 'Total Dana (Budget)',
            value: formatRupiah(budget),
            description: 'Jumlah nilai kontrak (excl. pajak) dari semua project',
        },
        {
            label: 'Tagihan Kontrak',
            value: formatRupiah(totalContractInvoicedWithTax),
            description: `Excl. pajak: ${formatRupiah(totalContractInvoiced)} · Terbayar: ${formatRupiah(totalContractPaidWithTax)}`,
            trend: totalContractPaid >= budget ? 'up' : 'down',
        },
        {
            label: 'Sisa Tagihan Kontrak',
            value: formatRupiah(remainingBill),
            description: 'Budget dikurangi yang sudah dibayar (excl. pajak)',
            trend: remainingBill <= 0 ? 'up' : 'down',
        },
        {
            label: 'Invoice Additional',
            value: formatRupiah(totalAdditionalInvoicedWithTax),
            description: `Excl. pajak: ${formatRupiah(totalAdditionalInvoiced)} · Terbayar: ${formatRupiah(totalAdditionalPaidWithTax)}`,
            trend: totalAdditionalInvoiced > 0 && totalAdditionalPaid >= totalAdditionalInvoiced ? 'up' : 'down',
        },
        {
            label: 'Total Pengeluaran',
            value: formatRupiah(totalExpenses),
            description: `Dapat ditagihkan: ${formatRupiah(billableExp)}`,
            trend: totalExpenses <= budget ? 'up' : 'down',
        },
        {
            label: 'Belum Dibayar',
            value: formatRupiah(outstandingAmount),
            description: `dari total tagihan ${formatRupiah(totalInvoicedWithTax)} (incl. pajak)`,
            trend: outstandingAmount <= 0 ? 'up' : 'down',
        },
        {
            label: 'Profit Kontrak',
            value: formatRupiah(contractProfit),
            description: 'Jumlah budget kontrak (excl. pajak) - akumulasi semua project',
            trend: contractProfit >= 0 ? 'up' : 'down',
        },
        {
            label: 'Profit Aktual',
            value: formatRupiah(actualProfit),
            description: `Pembayaran masuk (excl. pajak) dikurangi semua pengeluaran non-billable ${formatRupiah(nonBillableExp)}`,
            trend: actualProfit >= 0 ? 'up' : 'down',
        },
        {
            label: 'Total Diterima',
            value: formatRupiah(totalPaidWithTax),
            description: `Excl. pajak: ${formatRupiah(totalPaid)} · Kontrak: ${formatRupiah(totalContractPaidWithTax)} · Additional: ${formatRupiah(totalAdditionalPaidWithTax)}`,
            trend: totalPaid > 0 ? 'up' : 'down',
        },
    ];

    return (
        <section>
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold">Keuangan</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Akumulasi invoice, pembayaran, dan pengeluaran dari seluruh project perusahaan ini
                            {n > 0 ? <span className="text-foreground"> - {n} project</span> : <span> - belum ada project</span>}.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {STAT_CARDS.map(({ label, value, description, trend }) => (
                            <Card key={label} className="border-none bg-primary/10 shadow dark:bg-muted/40 dark:shadow-none">
                                <CardHeader>
                                    <CardDescription>{label}</CardDescription>
                                    <CardTitle className="text-3xl font-semibold tabular-nums">{value}</CardTitle>
                                    {trend && (
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
                                    )}
                                </CardHeader>
                                <CardFooter className="text-sm text-muted-foreground">{description}</CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
