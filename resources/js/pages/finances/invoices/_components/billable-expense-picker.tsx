import axios from 'axios';
import { CheckSquare2, Loader2, Square } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
        if (selected.size === expenses.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(expenses.map((e) => e.id)));
        }
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
        const filtered = newItems.filter((i) => !existingDescs.has(i.description));

        onImport([...currentItems, ...filtered]);
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

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button type="button" onClick={toggleAll} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    {allSelected ? <CheckSquare2 className="size-4 text-primary" /> : <Square className="size-4" />}
                    {allSelected ? 'Batal pilih semua' : 'Pilih semua'}
                </button>
                <Button type="button" disabled={selected.size === 0} onClick={handleImport}>
                    Import {selected.size > 0 ? `(${selected.size})` : ''} ke Item
                </Button>
            </div>

            {/* List */}
            <div className="space-y-2">
                {expenses.map((expense) => {
                    const isSelected = selected.has(expense.id);
                    const categoryInfo = EXPENSE_CATEGORIES_MAP[expense.category as keyof typeof EXPENSE_CATEGORIES_MAP];

                    return (
                        <button
                            key={expense.id}
                            type="button"
                            onClick={() => toggleSelect(expense.id)}
                            className={[
                                'flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors',
                                isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary hover:bg-muted/40',
                            ].join(' ')}
                        >
                            {isSelected ? <CheckSquare2 className="mt-0.5 size-4 shrink-0 text-primary" /> : <Square className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
                            <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    {categoryInfo && <Badge className={`${categoryInfo.className} text-xs`}>{categoryInfo.label}</Badge>}
                                </div>
                                <p className="truncate text-sm font-medium">{expense.description}</p>
                                <p className="text-xs text-muted-foreground">{expense.expense_date}</p>
                            </div>
                            <span className="shrink-0 text-sm font-semibold tabular-nums">{formatRupiah(Number(expense.amount))}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
