import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import type { Estimate } from '@/types/quote';
import { QUOTE_STATUSES_MAP } from '@/types/quote';
import Actions from './actions';

export default function getColumns(expandedRow: string | null, setExpandedRow: (id: string | null) => void): ColumnDef<Estimate>[] {
    return [
        {
            accessorKey: 'estimate',
            header: 'Estimate',
            cell: ({ row }) => {
                const { estimate_number, version_label, is_active, quote } = row.original;
                const quoteStatus = quote ? QUOTE_STATUSES_MAP[quote.status] : null;

                return (
                    <div className="grid w-100 grid-cols-[110px_1fr] items-center gap-x-2 gap-y-2 text-sm">
                        <span className="col-span-2 text-xs font-bold text-muted-foreground">Estimate</span>
                        <span className="text-xs font-medium text-muted-foreground">Nomor</span>
                        <span className="font-medium">{estimate_number}</span>

                        <span className="text-xs font-medium text-muted-foreground">Keterangan</span>
                        <div className="flex flex-wrap items-center gap-1">
                            <Badge className="bg-blue-600 text-white">{version_label}</Badge>
                            {is_active && <Badge className="bg-emerald-500 text-white">Active</Badge>}
                        </div>

                        {quote && (
                            <>
                                <span className="col-span-2 mt-4 text-xs font-bold text-muted-foreground">Permintaan</span>
                                <span className="text-xs font-medium text-muted-foreground">Nomor Ref</span>
                                <span className="whitespace-normal">{quote.reference_number}</span>
                                <span className="text-xs font-medium text-muted-foreground">Project</span>
                                <span className="whitespace-normal">{quote.project_name}</span>
                                {quoteStatus && (
                                    <>
                                        <span className="text-xs font-medium text-muted-foreground">Status</span>
                                        <Badge className={quoteStatus.classes}>{quoteStatus.label}</Badge>
                                    </>
                                )}
                                {quote.user && (
                                    <>
                                        <span className="text-xs font-medium text-muted-foreground">Pemohon</span>
                                        <span className="whitespace-normal">{quote.user.name}</span>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'detail',
            header: 'Detail',
            cell: ({ row }) => {
                const { total_amount, subtotal, valid_until, is_expired, created_at } = row.original;

                return (
                    <div className="grid w-60 grid-cols-[110px_1fr] items-center gap-x-2 gap-y-2 text-sm">
                        <span className="col-span-2 text-xs font-bold text-muted-foreground">Jumlah</span>
                        <span className="text-xs font-medium text-muted-foreground">Subtotal</span>
                        <span className="font-semibold tabular-nums">{formatRupiah(Number(subtotal))}</span>
                        <span className="text-xs font-medium text-muted-foreground">Total</span>
                        <span className="font-semibold tabular-nums">{formatRupiah(Number(total_amount))}</span>
                        {/* {Number(discount_percent) > 0 && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Diskon</span>
                                <span>{discount_percent}%</span>
                            </>
                        )}
                        {Number(tax_percent) > 0 && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Pajak</span>
                                <span>{tax_percent}%</span>
                            </>
                        )} */}

                        <span className="col-span-2 mt-4 text-xs font-bold text-muted-foreground">Tanggal</span>
                        <span className="text-xs font-medium text-muted-foreground">Dibuat</span>
                        <span>{formatDate(created_at)}</span>
                        {valid_until && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Berlaku s/d</span>
                                <div className="flex items-center gap-1.5">
                                    <span>{formatDate(valid_until)}</span>
                                    {is_expired && (
                                        <Badge variant="destructive" className="text-xs">
                                            Expired
                                        </Badge>
                                    )}
                                </div>
                            </>
                        )}
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
