import type { ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';

import type { Faq } from '@/types/contents';
import Actions from './actions';

function truncate(text: string, max: number) {
    const t = text.replace(/\s+/g, ' ').trim();
    if (t.length <= max) return t;
    return `${t.slice(0, max)}…`;
}

export default function getColumns(): ColumnDef<Faq>[] {
    return [
        {
            accessorKey: 'question',
            header: 'Pertanyaan',
            cell: ({ row }) => (
                <div className="max-w-md space-y-1">
                    <p className="text-sm font-medium leading-snug">{truncate(row.original.question, 120)}</p>
                    <p className="text-xs text-muted-foreground">{truncate(row.original.answer, 100)}</p>
                </div>
            ),
        },
        {
            accessorKey: 'is_published',
            header: 'Status',
            cell: ({ row }) =>
                row.original.is_published ? (
                    <Badge className="bg-emerald-500 text-white">Published</Badge>
                ) : (
                    <Badge className="bg-slate-500 text-white">Draft</Badge>
                ),
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => <Actions faq={row.original} />,
        },
    ];
}
