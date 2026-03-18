import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import type { Proposal } from '@/types/proposals';
import Actions from './actions';

export default function getColumns(expandedRow: string | null, setExpandedRow: (id: string | null) => void): ColumnDef<Proposal>[] {
    return [
        {
            accessorKey: 'proposal',
            header: 'Proposal',
            cell: ({ row }) => {
                const { project_name, proposal_number } = row.original;
                return (
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium">{project_name}</p>
                        <p className="text-xs text-muted-foreground">{proposal_number}</p>
                    </div>
                );
            },
        },
        {
            accessorKey: 'customer',
            header: 'Customer',
            cell: ({ row }) => {
                const { customer } = row.original;
                if (!customer) return <span className="text-sm">-</span>;
                return (
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium">{customer.name}</p>
                        {customer.tier && <p className="text-xs text-muted-foreground">{customer.tier}</p>}
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
                const { valid_until, is_expired, proposal_date } = row.original;
                const isAccepted = row.original.status === 'accepted';
                const isRejected = row.original.status === 'rejected';

                return (
                    <div className="space-y-0.5">
                        <p className="text-sm">{valid_until ? formatDate(valid_until) : '-'}</p>
                        {is_expired && !isAccepted && !isRejected && <Badge variant="destructive">Expired</Badge>}
                        <p className="text-xs text-muted-foreground">Dibuat: {formatDate(proposal_date)}</p>
                    </div>
                );
            },
        },
        {
            accessorKey: 'estimates_count',
            header: 'Estimasi',
            cell: ({ row }) => <span className="text-sm tabular-nums">{row.original.estimates_count ?? 0} estimasi</span>,
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => (
                <Actions proposal={row.original} isExpanded={expandedRow === row.id} onToggleExpand={() => setExpandedRow(expandedRow === row.id ? null : row.id)} />
            ),
        },
    ];
}
