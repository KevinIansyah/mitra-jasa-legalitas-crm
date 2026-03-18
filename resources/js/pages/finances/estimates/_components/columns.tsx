import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import { TIER_MAP } from '@/types/contacts';
import type { Estimate } from '@/types/estimates';
import { PROPOSAL_STATUSES_MAP } from '@/types/proposals';
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
            accessorKey: 'source',
            header: 'Quote/Proposal/Customer',
            cell: ({ row }) => {
                const { quote, proposal, customer } = row.original;

                if (quote)
                    return (
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium">{quote.project_name}</p>
                            <p className="text-xs text-muted-foreground">{quote.reference_number}</p>
                            {quote.status && <Badge className={QUOTE_STATUSES_MAP[quote.status]?.classes}>{QUOTE_STATUSES_MAP[quote.status]?.label}</Badge>}
                        </div>
                    );

                if (proposal)
                    return (
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium">{proposal.project_name}</p>
                            <p className="text-xs text-muted-foreground">{proposal.proposal_number}</p>
                            {proposal.status && <Badge className={PROPOSAL_STATUSES_MAP[proposal.status]?.classes}>{PROPOSAL_STATUSES_MAP[proposal.status]?.label}</Badge>}
                        </div>
                    );

                if (customer)
                    return (
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium">{customer.name}</p>
                            {customer.tier && <Badge className={TIER_MAP[customer.tier]?.classes}>{customer.tier}</Badge>}
                        </div>
                    );

                return <span className="text-sm text-muted-foreground">-</span>;
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
                const { valid_until, is_expired, estimate_date } = row.original;
                const isAccepted = row.original.status === 'accepted';
                const isRejected = row.original.status === 'rejected';

                return (
                    <div className="space-y-0.5">
                        <p className="text-sm">{valid_until ? formatDate(valid_until) : '-'}</p>
                        {is_expired && !isAccepted && !isRejected && <Badge variant="destructive">Expired</Badge>}
                        <p className="text-xs text-muted-foreground">Dibuat: {formatDate(estimate_date)}</p>
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
