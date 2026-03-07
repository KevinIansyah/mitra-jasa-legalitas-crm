import { router } from '@inertiajs/react';
import { FileText, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';

import { HasPermission } from '@/components/has-permission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { formatRupiah } from '@/lib/service';
import { ExpenseAddDrawer } from '@/pages/finances/expenses/_components/expense-add-drawer';
import { ExpenseEditDrawer } from '@/pages/finances/expenses/_components/expense-edit-drawer';
import type { Expense } from '@/types/expenses';
import type { Project } from '@/types/project';
import { ExpenseCard } from './_components/expense-card';
import { InvoiceCard } from './_components/invoice-card';
import invoices from '@/routes/finances/invoices';

type FinancesProps = {
    project: Project;
};

export default function Finances({ project }: FinancesProps) {
    const [addingExpense, setAddingExpense] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    const budget = Number(project.budget ?? 0);
    const totalContractInvoiced = Number(project.total_contract_invoiced ?? 0);
    const totalContractInvoicedWithTax = Number(project.total_contract_invoiced_with_tax ?? 0);
    const totalContractPaid = Number(project.total_contract_paid ?? 0);
    const totalContractPaidWithTax = Number(project.total_contract_paid_with_tax ?? 0);
    const totalAdditionalInvoiced = Number(project.total_additional_invoiced ?? 0);
    const totalAdditionalInvoicedWithTax = Number(project.total_additional_invoiced_with_tax ?? 0);
    const totalAdditionalPaid = Number(project.total_additional_paid ?? 0);
    const totalAdditionalPaidWithTax = Number(project.total_additional_paid_with_tax ?? 0);
    const totalInvoicedWithTax = Number(project.total_invoiced_with_tax ?? 0);
    const totalPaid = Number(project.total_paid ?? 0);
    const totalPaidWithTax = Number(project.total_paid_with_tax ?? 0);
    const remainingBill = Number(project.remaining_bill ?? 0);
    const outstandingAmount = Number(project.outstanding_amount ?? 0);
    const totalExpenses = Number(project.total_expenses ?? 0);
    const billableExp = Number(project.total_billable_expenses ?? 0);
    const contractProfit = Number(project.contract_profit ?? 0);
    const actualProfit = Number(project.actual_profit ?? 0);

    const STAT_CARDS = [
        {
            label: 'Total Dana (Budget)',
            value: formatRupiah(budget),
            description: 'Nilai kontrak yang disepakati (excl. pajak)',
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
            description: 'Nilai budget kontrak (excl. pajak & pengeluaran)',
            trend: contractProfit >= 0 ? 'up' : 'down',
        },
        {
            label: 'Profit Aktual',
            value: formatRupiah(actualProfit),
            description: 'Pembayaran masuk (excl. pajak) dikurangi semua pengeluaran',
            trend: actualProfit >= 0 ? 'up' : 'down',
        },
        {
            label: 'Total Diterima',
            value: formatRupiah(totalPaidWithTax),
            description: `Excl. pajak: ${formatRupiah(totalPaid)} · Kontrak: ${formatRupiah(totalContractPaidWithTax)} · Additional: ${formatRupiah(totalAdditionalPaidWithTax)}`,
            trend: totalPaid > 0 ? 'up' : 'down',
        },
    ];

    function goToCreateInvoice() {
        router.visit(invoices.create().url, { data: { project_id: project.id } });
    }

    return (
        <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:border-none *:data-[slot=card]:bg-sidebar *:data-[slot=card]:shadow sm:grid-cols-2 lg:grid-cols-3 *:data-[slot=card]:dark:shadow-none">
                {STAT_CARDS.map(({ label, value, description, trend }) => (
                    <Card key={label} className="@container/card dark:*:data-[slot=card]:shadow-none">
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

            {/* Invoices */}
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-6">
                    <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
                        <div>
                            <h2 className="text-xl font-bold">Invoice</h2>
                            <p className="mt-0.5 text-sm text-muted-foreground">Daftar invoice yang telah diterbitkan pada project ini.</p>
                        </div>
                        {project.invoices && project.invoices.length > 0 && (
                            <HasPermission permission="create-finance-invoices">
                                <Button type="button" className="min-w-30" onClick={goToCreateInvoice}>
                                    <Plus className="size-4" />
                                    Tambah
                                </Button>
                            </HasPermission>
                        )}
                    </div>

                    {!project.invoices || project.invoices.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border py-16 text-muted-foreground">
                            <p className="text-sm">Belum ada invoice di project ini</p>
                            <HasPermission permission="create-finance-invoices">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                    <FileText className="size-5 text-primary" />
                                </div>
                                <Button type="button" onClick={goToCreateInvoice} className="gap-1.5">
                                    <Plus className="size-4" />
                                    Tambah Invoice Pertama
                                </Button>
                            </HasPermission>
                        </div>
                    ) : (
                        <InvoiceCard project={project} />
                    )}
                </div>
            </div>

            {/* Expenses */}
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-6">
                    <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
                        <div>
                            <h2 className="text-xl font-bold">Pengeluaran</h2>
                            <p className="mt-0.5 text-sm text-muted-foreground">Daftar pengeluaran yang tercatat pada project ini.</p>
                        </div>
                        {project.expenses && project.expenses.length > 0 && (
                            <HasPermission permission="create-finance-expenses">
                                <Button
                                    type="button"
                                    className="min-w-30"
                                    onClick={(e) => {
                                        e.currentTarget.blur();
                                        setAddingExpense(true);
                                    }}
                                >
                                    <Plus className="size-4" />
                                    Tambah
                                </Button>
                            </HasPermission>
                        )}
                    </div>

                    {!project.expenses || project.expenses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border py-16 text-muted-foreground">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                <FileText className="size-5 text-primary" />
                            </div>
                            <p className="text-sm">Belum ada pengeluaran di project ini</p>
                            <HasPermission permission="create-finance-expenses">
                                <Button
                                    type="button"
                                    onClick={(e) => {
                                        e.currentTarget.blur();
                                        setAddingExpense(true);
                                    }}
                                >
                                    <Plus className="size-4" />
                                    Tambah Pengeluaran Pertama
                                </Button>
                            </HasPermission>
                        </div>
                    ) : (
                        <ExpenseCard project={project} onEdit={(expense) => setEditingExpense(expense)} />
                    )}
                </div>
            </div>

            {/* Add Drawer */}
            {addingExpense && <ExpenseAddDrawer fromProject={true} initialProject={project} open={addingExpense} onOpenChange={setAddingExpense} />}

            {/* Edit Drawer */}
            {editingExpense && (
                <ExpenseEditDrawer
                    expense={editingExpense}
                    initialProject={project}
                    open={!!editingExpense}
                    onOpenChange={(open) => {
                        if (!open) setEditingExpense(null);
                    }}
                />
            )}
        </div>
    );
}
