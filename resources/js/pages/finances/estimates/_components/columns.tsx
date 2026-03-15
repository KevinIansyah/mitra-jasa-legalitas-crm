import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import type { Estimate } from '@/types/quotes';
import { QUOTE_STATUSES_MAP } from '@/types/quotes';
import Actions from './actions';

export default function getColumns(expandedRow: string | null, setExpandedRow: (id: string | null) => void): ColumnDef<Estimate>[] {
    return [
        {
            accessorKey: 'estimate',
            header: 'Estimate',
            cell: ({ row }) => {
                const { estimate_number, version_label, is_active } = row.original;
                return (
                    <div className="space-y-1">
                        <p className="text-sm font-medium">{estimate_number}</p>
                        <div className="flex flex-wrap items-center gap-1">
                            <Badge className="bg-blue-600 text-white">{version_label}</Badge>
                            {is_active && <Badge className="bg-emerald-500 text-white">Active</Badge>}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'quote',
            header: 'Permintaan',
            cell: ({ row }) => {
                const { quote } = row.original;
                const quoteStatus = quote ? QUOTE_STATUSES_MAP[quote.status] : null;
                if (!quote) return <span className="text-sm">-</span>;
                return (
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium">{quote.project_name}</p>
                        <p className="text-xs text-muted-foreground">{quote.reference_number}</p>
                        {quoteStatus && <Badge className={quoteStatus.classes}>{quoteStatus.label}</Badge>}
                    </div>
                );
            },
        },
        {
            accessorKey: 'total_amount',
            header: 'Total',
            cell: ({ row }) => <span className="text-sm font-medium tabular-nums">{formatRupiah(Number(row.original.total_amount))}</span>,
        },
        {
            accessorKey: 'valid_until',
            header: 'Berlaku s/d',
            cell: ({ row }) => {
                const { valid_until, is_expired, created_at } = row.original;
                return (
                    <div className="space-y-0.5">
                        <p className="text-sm">{valid_until ? formatDate(valid_until) : '-'}</p>
                        {is_expired && <Badge variant="destructive">Expired</Badge>}
                        <p className="text-xs text-muted-foreground">Dibuat: {formatDate(created_at)}</p>
                    </div>
                );
            },
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => (
                <Actions estimate={row.original} isExpanded={expandedRow === row.id} onToggleExpand={() => setExpandedRow(expandedRow === row.id ? null : row.id)} />
            ),
        },
    ];
}
