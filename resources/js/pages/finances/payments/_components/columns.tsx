import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import { INVOICE_TYPES_MAP, PAYMENT_METHODS_MAP, type ProjectPayment } from '@/types/project';
import Actions from './actions';

export default function getColumns(expandedRow: string | null, setExpandedRow: (id: string | null) => void): ColumnDef<ProjectPayment>[] {
    return [
        {
            accessorKey: 'payment',
            header: 'Pembayaran',
            cell: ({ row }) => {
                const { invoice, payment_method, reference_number } = row.original;
                const method = payment_method ? PAYMENT_METHODS_MAP[payment_method as keyof typeof PAYMENT_METHODS_MAP] : null;
                const typeInfo = invoice?.type ? INVOICE_TYPES_MAP[invoice.type] : null;

                return (
                    <div className="grid w-full min-w-100 grid-cols-[100px_1fr] items-center gap-x-2 gap-y-2 text-sm">
                        <span className="col-span-2 text-xs font-bold text-muted-foreground">Invoice</span>
                        <span className="text-xs font-medium text-muted-foreground">Nomor</span>
                        <span className="font-medium whitespace-normal">{invoice?.invoice_number ?? '-'}</span>
                        {typeInfo && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Tipe</span>
                                <Badge className={typeInfo.classes}>{typeInfo.label}</Badge>
                            </>
                        )}

                        <span className="col-span-2 mt-4 text-xs font-bold text-muted-foreground">Project</span>
                        <span className="text-xs font-medium text-muted-foreground">Nama</span>
                        <span className="whitespace-normal">{invoice?.project?.name ?? '-'}</span>
                        {invoice?.project?.customer && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Pelanggan</span>
                                <span className="whitespace-normal">{invoice.project.customer.name}</span>
                            </>
                        )}

                        {(method || reference_number) && (
                            <>
                                <span className="col-span-2 mt-4 text-xs font-bold text-muted-foreground">Pembayaran</span>
                                {method && (
                                    <>
                                        <span className="text-xs font-medium text-muted-foreground">Metode</span>
                                        <span>{method.label}</span>
                                    </>
                                )}
                                {reference_number && (
                                    <>
                                        <span className="text-xs font-medium text-muted-foreground">Referensi</span>
                                        <span className="text-sm">{reference_number}</span>
                                    </>
                                )}
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
                const { amount, payment_date, verified_at, verifier } = row.original;
                return (
                    <div className="grid w-full min-w-52 grid-cols-[100px_1fr] items-center gap-x-2 gap-y-2 text-sm">
                        <span className="col-span-2 text-xs font-bold text-muted-foreground">Jumlah</span>
                        <span className="text-xs font-medium text-muted-foreground">Total</span>
                        <span className="font-semibold tabular-nums">{formatRupiah(Number(amount))}</span>

                        <span className="col-span-2 mt-4 text-xs font-bold text-muted-foreground">Tanggal</span>
                        <span className="text-xs font-medium text-muted-foreground">Pembayaran</span>
                        <span>{formatDate(payment_date)}</span>
                        {verified_at && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Diverifikasi</span>
                                <span>{formatDate(verified_at)}</span>
                            </>
                        )}
                        {verifier && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Oleh</span>
                                <span>{verifier.name}</span>
                            </>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => <Actions payment={row.original} isExpanded={expandedRow === row.id} onToggleExpand={() => setExpandedRow(expandedRow === row.id ? null : row.id)} />,
        },
    ];
}
