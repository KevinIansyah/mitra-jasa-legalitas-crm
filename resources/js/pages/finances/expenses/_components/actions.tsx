import { FileCheck, Pencil } from 'lucide-react';
import { useState } from 'react';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import expensesRoutes from '@/routes/finances/expenses';
import type { Expense } from '@/types/expenses';
import { ExpenseEditDrawer } from './expense-edit-drawer';

type ActionsProps = {
    expense: Expense;
};

export default function Actions({ expense }: ActionsProps) {
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const isBilled = !!expense.invoice_id;

    return (
        <>
            <div className="flex items-center gap-1">
                <HasPermission permission="view-finance-expenses">
                    {expense.receipt_file && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="secondary" className="h-8 w-8" onClick={() => window.open(`/files/${expense.receipt_file}`, '_blank', 'noopener,noreferrer')}>
                                    <FileCheck className="size-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Lihat Struk</TooltipContent>
                        </Tooltip>
                    )}
                </HasPermission>

                <HasPermission permission="edit-finance-expenses">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" className="h-8 w-8" disabled={isBilled} onClick={() => setEditingExpense(expense)}>
                                <Pencil className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Pengeluaran</TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="delete-finance-expenses">
                    <DialogDelete
                        description={`Pengeluaran "${expense.description}" akan dihapus secara permanen.`}
                        deleteUrl={expensesRoutes.destroy(expense.id).url}
                        tooltipText="Hapus Pengeluaran"
                        isDisabled={isBilled}
                    />
                </HasPermission>
            </div>

            {editingExpense && (
                <ExpenseEditDrawer
                    expense={editingExpense}
                    open={!!editingExpense}
                    onOpenChange={(open) => {
                        if (!open) setEditingExpense(null);
                    }}
                />
            )}
        </>
    );
}
