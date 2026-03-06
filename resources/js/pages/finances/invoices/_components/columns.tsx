import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import { INVOICE_TYPES_MAP, type ProjectInvoice } from '@/types/project';
import Actions from './actions';

export default function getColumns(expandedRow: string | null, setExpandedRow: (id: string | null) => void): ColumnDef<ProjectInvoice>[] {
    return [
        {
            accessorKey: 'invoice',
            header: 'Invoice',
            cell: ({ row }) => {
                const { invoice_number, type, project } = row.original;
                const typeInfo = INVOICE_TYPES_MAP[type];

                return (
                    <div className="grid w-full min-w-100 grid-cols-[90px_1fr] items-center gap-x-2 gap-y-2 text-sm">
                        <span className="col-span-2 text-xs font-bold text-muted-foreground">Invoice</span>
                        <span className="text-xs font-medium text-muted-foreground">Nomor</span>
                        <span className="font-medium whitespace-normal">{invoice_number}</span>
                        <span className="text-xs font-medium text-muted-foreground">Tipe</span>
                        <Badge className={typeInfo?.classes}>{typeInfo?.label}</Badge>

                        <span className="col-span-2 mt-4 text-xs font-bold text-muted-foreground">Project</span>
                        <span className="text-xs font-medium text-muted-foreground">Nama</span>
                        <span className="whitespace-normal">{project?.name || '-'}</span>
                        {project?.customer && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Pelanggan</span>
                                <span className="whitespace-normal">{project.customer.name}</span>
                            </>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'amount',
            header: 'Jumlah',
            cell: ({ row }) => {
                const { total_amount, amount, tax_amount, discount_amount, invoice_date, due_date, paid_at } = row.original;
                return (
                    <div className="grid w-full min-w-60 grid-cols-[90px_1fr] items-center gap-x-2 gap-y-2 text-sm">
                        <span className="col-span-2 text-xs font-bold text-muted-foreground">Jumlah</span>
                        <span className="text-xs font-medium text-muted-foreground">Total</span>
                        <span className="font-semibold tabular-nums">{formatRupiah(Number(total_amount))}</span>
                        {(Number(discount_amount) > 0 || Number(tax_amount) > 0) && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Subtotal</span>
                                <span className="text-xs text-muted-foreground tabular-nums">{formatRupiah(Number(amount))}</span>
                            </>
                        )}

                        <span className="col-span-2 mt-4 text-xs font-bold text-muted-foreground">Tanggal</span>
                        <span className="text-xs font-medium text-muted-foreground">Invoice</span>
                        <span>{formatDate(invoice_date)}</span>
                        <span className="text-xs font-medium text-muted-foreground">Jatuh Tempo</span>
                        <span>{due_date ? formatDate(due_date) : '-'}</span>
                        {paid_at && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Dibayar</span>
                                <span>{formatDate(paid_at)}</span>
                            </>
                        )}
                    </div>
                );
            },
        },
        // {
        //     accessorKey: 'status',
        //     header: 'Status',
        //     cell: ({ row }) => {
        //         const statusInfo = INVOICE_STATUSES_MAP[row.original.status];
        //         return <Badge className={statusInfo?.classes}>{statusInfo?.label}</Badge>;
        //     },
        // },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => <Actions invoice={row.original} isExpanded={expandedRow === row.id} onToggleExpand={() => setExpandedRow(expandedRow === row.id ? null : row.id)} />,
        },
    ];
}
