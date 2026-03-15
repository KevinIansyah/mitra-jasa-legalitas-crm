import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import { INVOICE_TYPES_MAP, type ProjectPayment } from '@/types/projects';
import Actions from './actions';

export default function getColumns(expandedRow: string | null, setExpandedRow: (id: string | null) => void): ColumnDef<ProjectPayment>[] {
    return [
        {
            accessorKey: 'invoice',
            header: 'Invoice',
            cell: ({ row }) => {
                const { invoice } = row.original;
                const typeInfo = invoice?.type ? INVOICE_TYPES_MAP[invoice.type] : null;
                return (
                    <div className="space-y-1">
                        <p className="text-sm font-medium">{invoice?.invoice_number ?? '-'}</p>
                        {typeInfo && <Badge className={typeInfo.classes}>{typeInfo.label}</Badge>}
                    </div>
                );
            },
        },
        {
            accessorKey: 'project',
            header: 'Project',
            cell: ({ row }) => {
                const { invoice } = row.original;
                return (
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium">{invoice?.project?.name ?? '-'}</p>
                        {invoice?.project?.customer && <p className="text-xs text-muted-foreground">{invoice.project.customer.name}</p>}
                    </div>
                );
            },
        },
        {
            accessorKey: 'amount',
            header: 'Jumlah',
            cell: ({ row }) => <span className="text-sm tabular-nums">{formatRupiah(Number(row.original.amount))}</span>,
        },
        {
            accessorKey: 'payment_date',
            header: 'Tgl Bayar',
            cell: ({ row }) => <span className="text-sm">{formatDate(row.original.payment_date)}</span>,
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => <Actions payment={row.original} isExpanded={expandedRow === row.id} onToggleExpand={() => setExpandedRow(expandedRow === row.id ? null : row.id)} />,
        },
    ];
}
