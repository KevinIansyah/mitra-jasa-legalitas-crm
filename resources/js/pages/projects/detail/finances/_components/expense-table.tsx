import { FileCheck, Pencil } from 'lucide-react';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { formatRupiah } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import expensesRoute from '@/routes/expenses';
import { EXPENSE_CATEGORIES_MAP, type Expense } from '@/types/expenses';
import type { Project } from '@/types/project';

type ExpenseTableProps = {
    project: Project;
    onEdit: (expense: Expense) => void;
};

export function ExpenseTable({ project, onEdit }: ExpenseTableProps) {
    const expenses = project.expenses ?? [];

    return (
        <div className="w-full overflow-hidden rounded-t-md border-b">
            <Table>
                <TableHeader>
                    <TableRow className="border-none">
                        <TableHead>Deskripsi</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Nominal</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Dibuat Oleh</TableHead>
                        <HasPermission permission="edit-finance-expenses">
                            <TableHead>Aksi</TableHead>
                        </HasPermission>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {expenses.map((expense) => (
                        <TableRow key={expense.id}>
                            <TableCell className="whitespace-normal">{expense.description}</TableCell>
                            <TableCell>
                                <Badge className={EXPENSE_CATEGORIES_MAP[expense.category].className}>{EXPENSE_CATEGORIES_MAP[expense.category].label}</Badge>
                            </TableCell>
                            <TableCell>{formatRupiah(Number(expense.amount))}</TableCell>
                            <TableCell>{formatDate(expense.expense_date)}</TableCell>
                            <TableCell>{expense.user?.name || '-'}</TableCell>
                            <HasPermission permission="edit-finance-expenses">
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        {expense.receipt_file && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="secondary" size="sm" className="h-8 w-8" asChild>
                                                        <a href={`/files/${expense.receipt_file}`} target="_blank" rel="noopener noreferrer">
                                                            <FileCheck className="size-4" />
                                                        </a>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Lihat Struk</TooltipContent>
                                            </Tooltip>
                                        )}

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.currentTarget.blur();
                                                        onEdit(expense);
                                                    }}
                                                    className="h-8 w-8"
                                                >
                                                    <Pencil className="size-3.5" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit Pengeluaran</TooltipContent>
                                        </Tooltip>

                                        <DialogDelete
                                            description={`Tindakan ini tidak dapat dibatalkan. Data pengeluaran "${expense.description}" akan dihapus secara permanen dari sistem.`}
                                            deleteUrl={expensesRoute.destroy(expense.id).url}
                                            tooltipText="Hapus Pengeluaran"
                                        />
                                    </div>
                                </TableCell>
                            </HasPermission>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
