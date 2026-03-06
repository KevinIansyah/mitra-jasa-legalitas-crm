import type { Expense } from '@/types/expenses';

export default function ExpenseDetail({ expense }: { expense: Expense }) {
    if (!expense.project?.description) {
        return <div className="p-4 text-sm text-muted-foreground">Tidak ada informasi tambahan</div>;
    }

    return (
        <div className="space-y-2 p-4 text-sm">
            <p className="text-xs text-muted-foreground">Deskripsi Project</p>
            <p className="whitespace-normal">{expense.project.description}</p>
        </div>
    );
}
