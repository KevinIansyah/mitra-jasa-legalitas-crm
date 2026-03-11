import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import Actions from './actions';
import type { JournalEntry } from '@/types/journal-entries';
import { JOURNAL_REFERENCE_TYPES_MAP } from '@/types/journal-entries';

export default function getColumns(expandedRow: string | null, setExpandedRow: (id: string | null) => void): ColumnDef<JournalEntry>[] {
    return [
        {
            accessorKey: 'date',
            header: 'Tanggal & Deskripsi',
            cell: ({ row }) => {
                const { date, description, reference_type } = row.original;
                const typeMeta = JOURNAL_REFERENCE_TYPES_MAP[reference_type];
                return (
                    <div className="space-y-1">
                        <p className="text-sm font-medium">{description}</p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{formatDate(date)}</span>
                            <Badge className={`${typeMeta.classes}`}>{typeMeta.label}</Badge>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'debit',
            header: 'Debit / Kredit',
            cell: ({ row }) => {
                const lines = row.original.lines ?? [];
                const debit = lines.reduce((s, l) => s + Number(l.debit), 0);
                const credit = lines.reduce((s, l) => s + Number(l.credit), 0);
                return (
                    <div className="space-y-0.5">
                        <p className="text-sm text-blue-600 tabular-nums">{formatRupiah(debit)}</p>
                        <p className="text-sm text-emerald-500 tabular-nums">{formatRupiah(credit)}</p>
                    </div>
                );
            },
        },
        {
            accessorKey: 'lines',
            header: 'Baris',
            cell: ({ row }) => <span>{row.original.lines?.length ?? 0}</span>,
        },
        {
            id: 'action',
            header: 'Aksi',
            enableHiding: false,
            cell: ({ row }) => <Actions entry={row.original} isExpanded={expandedRow === row.id} onToggleExpand={() => setExpandedRow(expandedRow === row.id ? null : row.id)} />,
        },
    ];
}
