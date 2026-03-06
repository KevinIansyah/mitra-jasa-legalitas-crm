import axios from 'axios';
import { Import, Loader2 } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatRupiah } from '@/lib/service';
import projects from '@/routes/projects';
import type { Expense } from '@/types/expenses';
import { EXPENSE_CATEGORIES_MAP } from '@/types/expenses';
import type { ProjectInvoiceItemFormData } from '@/types/project';

type BillableExpensePickerProps = {
    projectId: number;
    currentItems: ProjectInvoiceItemFormData[];
    onImport: (items: ProjectInvoiceItemFormData[]) => void;
};

export function BillableExpensePicker({ projectId, currentItems, onImport }: BillableExpensePickerProps) {
    const [expenses, setExpenses] = React.useState<Expense[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [selected, setSelected] = React.useState<Set<number>>(new Set());

    React.useEffect(() => {
        if (!projectId) return;
        setLoading(true);
        setSelected(new Set());

        axios
            .get(projects.unbilledExpenses(projectId).url)
            .then((res) => setExpenses(res.data.expenses ?? []))
            .catch(() => setExpenses([]))
            .finally(() => setLoading(false));
    }, [projectId]);

    function toggleSelect(id: number) {
        setSelected((prev) => {
            const next = new Set(prev);
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    function toggleAll() {
        setSelected(selected.size === expenses.length ? new Set() : new Set(expenses.map((e) => e.id)));
    }

    function handleImport() {
        const toImport = expenses.filter((e) => selected.has(e.id));
        const newItems: ProjectInvoiceItemFormData[] = toImport.map((expense) => ({
            description: expense.description,
            quantity: 1,
            unit_price: Number(expense.amount),
            tax_percent: 0,
            discount_percent: 0,
        }));

        const existingDescs = new Set(currentItems.map((i) => i.description));
        onImport([...currentItems, ...newItems.filter((i) => !existingDescs.has(i.description))]);
        setSelected(new Set());
    }

    if (loading) {
        return (
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Memuat pengeluaran yang belum ditagihkan...
            </div>
        );
    }

    if (expenses.length === 0) {
        return (
            <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                Tidak ada pengeluaran billable yang belum ditagihkan untuk project ini.
            </p>
        );
    }

    const allSelected = selected.size === expenses.length;
    const someSelected = selected.size > 0 && !allSelected;

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="select-all"
                        checked={allSelected}
                        // indeterminate state saat sebagian dipilih
                        ref={(el) => {
                            if (el) el.dataset.state = someSelected ? 'indeterminate' : allSelected ? 'checked' : 'unchecked';
                        }}
                        onCheckedChange={toggleAll}
                    />
                    <label htmlFor="select-all" className="cursor-pointer text-sm text-muted-foreground select-none">
                        {allSelected ? 'Batal pilih semua' : 'Pilih semua'}
                    </label>
                </div>
                <Button type="button" disabled={selected.size === 0} className="w-40" onClick={handleImport}>
                    <Import className="size-4" />
                    Import Item
                    {selected.size > 0 && <Badge className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground text-[10px] text-foreground">{selected.size}</Badge>}
                </Button>
            </div>

            {/* List */}
            <div className="space-y-2">
                {expenses.map((expense) => {
                    const isSelected = selected.has(expense.id);
                    const categoryInfo = EXPENSE_CATEGORIES_MAP[expense.category as keyof typeof EXPENSE_CATEGORIES_MAP];

                    return (
                        <div
                            key={expense.id}
                            onClick={() => toggleSelect(expense.id)}
                            className={[
                                'flex w-full cursor-pointer items-start gap-4 rounded-lg border p-4 text-left transition-colors',
                                isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary hover:bg-muted/40',
                            ].join(' ')}
                        >
                            <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(expense.id)} onClick={(e) => e.stopPropagation()} className="mt-0.5 shrink-0" />
                            <div className="min-w-0 flex-1 space-y-1">
                                {categoryInfo && <Badge className={`${categoryInfo.classes} text-xs`}>{categoryInfo.label}</Badge>}
                                <p className="truncate text-sm font-medium">{expense.description}</p>
                                <p className="text-xs text-muted-foreground">{expense.expense_date}</p>
                            </div>
                            <span className="shrink-0 text-sm font-semibold tabular-nums">{formatRupiah(Number(expense.amount))}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
