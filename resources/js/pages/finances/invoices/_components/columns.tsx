import type { ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge'
;
import { formatRupiah } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import { TIER_MAP } from '@/types/contacts';
import { INVOICE_TYPES_MAP, PROJECT_STATUSES_MAP, type ProjectInvoice } from '@/types/projects';
import Actions from './actions';

export default function getColumns(expandedRow: string | null, setExpandedRow: (id: string | null) => void): ColumnDef<ProjectInvoice>[] {
    return [
        {
            accessorKey: 'invoice',
            header: 'Invoice',
            cell: ({ row }) => {
                const { invoice_number, type } = row.original;
                const typeInfo = type ? INVOICE_TYPES_MAP[type] : null;
                return (
                    <div className="space-y-1">
                        <p className="text-sm">{invoice_number || '-'}</p>
                        {typeInfo && <Badge className={typeInfo.classes}>{typeInfo.label}</Badge>}
                    </div>
                );
            },
        },
        {
            accessorKey: 'source',
            header: 'Project/Pelanggan',
            cell: ({ row }) => {    
                const { project, customer } = row.original;

                if (project)
                    return (
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium">{project.name}</p>
                            <p className="text-xs text-muted-foreground">{project.customer?.name}</p>
                            {project.status && <Badge className={PROJECT_STATUSES_MAP[project.status]?.classes}>{PROJECT_STATUSES_MAP[project.status]?.label}</Badge>}
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
            cell: ({ row }) => {
                const { total_amount, subtotal, discount_amount, tax_amount, tax_percent, discount_percent } = row.original;
                const hasBreakdown = Number(discount_amount) > 0 || Number(tax_amount) > 0;
                return (
                    <div className="space-y-0.5">
                        <span className="text-sm tabular-nums">{formatRupiah(Number(total_amount))}</span>
                        {hasBreakdown && <p className="text-xs text-muted-foreground tabular-nums">Harga asli: {formatRupiah(Number(subtotal))}</p>}
                        {Number(discount_amount) > 0 && (
                            <p className="text-xs text-destructive tabular-nums">
                                Diskon: ({discount_percent}%) {formatRupiah(Number(discount_amount))}
                            </p>
                        )}
                        {Number(tax_amount) > 0 && (
                            <p className="text-xs text-muted-foreground tabular-nums">
                                Pajak: ({tax_percent}%) {formatRupiah(Number(tax_amount))}
                            </p>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'invoice_date',
            header: 'Tgl Invoice',
            cell: ({ row }) => (
                <div className="space-y-0.5">
                    <p className="text-sm">{formatDate(row.original.invoice_date)}</p>
                    {row.original.due_date && <p className="text-xs text-muted-foreground">Jatuh tempo: {formatDate(row.original.due_date)}</p>}
                </div>
            ),
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => <Actions invoice={row.original} isExpanded={expandedRow === row.id} onToggleExpand={() => setExpandedRow(expandedRow === row.id ? null : row.id)} />,
        },
    ];
}
