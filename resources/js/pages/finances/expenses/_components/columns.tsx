import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import type { Expense } from '@/types/expenses';
import { EXPENSE_CATEGORIES_MAP } from '@/types/expenses';
import { VENDOR_CATEGORIES_MAP } from '@/types/vendors';
import Actions from './actions';

export default function getColumns(): ColumnDef<Expense>[] {
    return [
        {
            accessorKey: 'expense',
            header: 'Pengeluaran',
            cell: ({ row }) => {
                const { category, description, project, invoice, user } = row.original;

                const categoryInfo = category ? EXPENSE_CATEGORIES_MAP[category] : null;
                const isBilled = !!invoice;

                return (
                    <div className="grid w-100 grid-cols-[110px_1fr] items-center gap-x-2 gap-y-2 text-sm">
                        <span className="col-span-2 text-xs font-bold text-muted-foreground">Pengeluaran</span>
                        <span className="text-xs font-medium text-muted-foreground">Kategori</span>
                        {categoryInfo ? <Badge className={categoryInfo.classes}>{categoryInfo.label}</Badge> : <span>-</span>}

                        <span className="text-xs font-medium text-muted-foreground">Deskripsi</span>
                        <span className="min-w-0 break-words whitespace-normal">{description || '-'}</span>

                        {user && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Dicatat</span>
                                <span>{user.name}</span>
                            </>
                        )}

                        {project && (
                            <>
                                <span className="col-span-2 mt-4 text-xs font-bold text-muted-foreground">Project</span>
                                <span className="text-xs font-medium text-muted-foreground">Nama</span>
                                <span className="min-w-0 break-words whitespace-normal">{project.name}</span>
                                {project.customer && (
                                    <>
                                        <span className="text-xs font-medium text-muted-foreground">Pelanggan (PIC)</span>
                                        <span>{project.customer.name}</span>
                                    </>
                                )}
                            </>
                        )}

                        {isBilled && (
                            <>
                                <span className="col-span-2 mt-4 text-xs font-bold text-muted-foreground">Invoice</span>
                                <span className="text-xs font-medium text-muted-foreground">Nomor</span>
                                <span className="font-medium">{invoice.invoice_number}</span>
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
                const { amount, expense_date, is_billable, invoice, vendor, vendor_id, vendor_name } = row.original;

                const isBilled = !!invoice;
                const vendorInfo = vendor?.category ? VENDOR_CATEGORIES_MAP[vendor.category] : null;

                return (
                    <div className="grid w-60 grid-cols-[110px_1fr] items-center gap-x-2 gap-y-2 text-sm">
                        <span className="col-span-2 text-xs font-bold text-muted-foreground">Jumlah</span>
                        <span className="text-xs font-medium text-muted-foreground">Total</span>
                        <span className="tabular-nums">{formatRupiah(Number(amount))}</span>

                        <span className="col-span-2 mt-4 text-xs font-bold text-muted-foreground">Informasi</span>
                        <span className="text-xs font-medium text-muted-foreground">Tanggal</span>
                        <span>{formatDate(expense_date)}</span>

                        <span className="text-xs font-medium text-muted-foreground">Billable</span>
                        {is_billable ? (
                            isBilled ? (
                                <Badge className="bg-emerald-500 text-white">Sudah Ditagihkan</Badge>
                            ) : (
                                <Badge className="bg-yellow-500 text-white">Belum Ditagihkan</Badge>
                            )
                        ) : (
                            <Badge variant="secondary">Non-billable</Badge>
                        )}

                        {vendor && vendor_id && (
                            <>
                                <span className="col-span-2 mt-4 text-xs font-bold text-muted-foreground">Vendor</span>
                                <span className="text-xs font-medium text-muted-foreground">Nama</span>
                                <span>{vendor.name}</span>
                                {vendorInfo && (
                                    <>
                                        <span className="text-xs font-medium text-muted-foreground">Kategori</span>
                                        <Badge className={vendorInfo.classes}>{vendorInfo.label}</Badge>
                                    </>
                                )}
                            </>
                        )}

                        {!vendor_id && vendor_name && (
                            <>
                                <span className="col-span-2 mt-4 text-xs font-bold text-muted-foreground">Vendor</span>
                                <span className="text-xs font-medium text-muted-foreground">Nama</span>
                                <span>{vendor_name}</span>
                            </>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => <Actions expense={row.original} />,
        },
    ];
}
