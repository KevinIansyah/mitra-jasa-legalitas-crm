import { FileCheck, Pencil } from 'lucide-react';
import { useState } from 'react';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { formatRupiah } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import expenses from '@/routes/finances/expenses';
import type { Expense } from '@/types/expenses';
import { EXPENSE_CATEGORIES_MAP } from '@/types/expenses';
import type { Project } from '@/types/project';

type ExpenseCardProps = {
    project: Project;
    onEdit: (expense: Expense) => void;
};

export function ExpenseCard({ project, onEdit }: ExpenseCardProps) {
    const [loading] = useState(false);

    const expenseList = (project.expenses ?? []) as Expense[];

    return (
        <div className="overflow-hidden border-t border-b border-border bg-sidebar">
            {expenseList.map((expense, index) => {
                const categoryInfo = EXPENSE_CATEGORIES_MAP[expense.category as keyof typeof EXPENSE_CATEGORIES_MAP];
                const isBillable = expense.is_billable;
                const isBilled = isBillable && !!expense.invoice_id;

                return (
                    <div key={expense.id} className={`py-4 md:py-6 ${index !== expenseList.length - 1 ? 'border-b border-border' : ''}`}>
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start">
                            <div className="space-y-2">
                                {/* Category & billable badge */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {categoryInfo && <Badge className={categoryInfo.classes}>{categoryInfo.label}</Badge>}
                                    {isBillable ? (
                                        isBilled ? (
                                            <Badge className="bg-emerald-500 text-white">Sudah Ditagihkan</Badge>
                                        ) : (
                                            <Badge className="bg-yellow-500 text-white">Belum Ditagihkan</Badge>
                                        )
                                    ) : (
                                        <Badge variant="secondary">Non-billable</Badge>
                                    )}
                                </div>

                                {/* Description */}
                                <p className="text-sm font-medium">{expense.description}</p>

                                {/* Amount */}
                                <p className="text-base font-semibold tabular-nums">{formatRupiah(Number(expense.amount))}</p>

                                {/* Meta */}
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                    <span>
                                        Tanggal: <span className="text-foreground">{formatDate(expense.expense_date)}</span>
                                    </span>
                                    {expense.user && (
                                        <span>
                                            Dicatat oleh: <span className="text-foreground">{expense.user.name}</span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex shrink-0 items-center gap-1">
                                {/* Receipt */}
                                {expense.receipt_file && (
                                    <HasPermission permission="view-finance-expenses">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="secondary" size="sm" className="h-8 w-8" asChild>
                                                    <a href={expense.receipt_file} target="_blank" rel="noopener noreferrer">
                                                        <FileCheck className="size-3.5" />
                                                    </a>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Lihat Struk</TooltipContent>
                                        </Tooltip>
                                    </HasPermission>
                                )}

                                <HasPermission permission="edit-finance-expenses">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="secondary" size="sm" className="h-8 w-8" disabled={loading || isBilled} onClick={() => onEdit(expense)}>
                                                <Pencil className="size-3.5" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Edit</TooltipContent>
                                    </Tooltip>
                                </HasPermission>

                                <HasPermission permission="delete-finance-expenses">
                                    <DialogDelete
                                        description={`Pengeluaran "${expense.description}" sebesar ${formatRupiah(Number(expense.amount))} akan dihapus secara permanen.`}
                                        deleteUrl={expenses.destroy(expense.id).url}
                                        tooltipText="Hapus Pengeluaran"
                                        isDisabled={loading || isBilled}
                                    />
                                </HasPermission>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
