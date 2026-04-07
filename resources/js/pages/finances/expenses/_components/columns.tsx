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
                const { category, description, invoice } = row.original;
                const categoryInfo = category ? EXPENSE_CATEGORIES_MAP[category] : null;
                return (
                    <div className="space-y-1">
                        {categoryInfo && <Badge className={categoryInfo.classes}>{categoryInfo.label}</Badge>}
                        <p className="text-sm whitespace-normal">{description || '-'}</p>
                        {invoice && <p className="text-xs text-muted-foreground">Invoice: {invoice.invoice_number}</p>}
                    </div>
                );
            },
        },
        {
            accessorKey: 'project',
            header: 'Project',
            cell: ({ row }) => {
                const { project, user } = row.original;
                return (
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium whitespace-normal">{project?.name ?? '-'}</p>
                        {project?.customer && <p className="text-xs text-muted-foreground">{project.customer.name}</p>}
                        {user && <p className="text-xs text-muted-foreground">Dicatat: {user.name}</p>}
                    </div>
                );
            },
        },
        {
            accessorKey: 'vendor',
            header: 'Vendor',
            cell: ({ row }) => {
                const { vendor, vendor_id, vendor_name } = row.original;
                const vendorInfo = vendor?.category ? VENDOR_CATEGORIES_MAP[vendor.category] : null;
                const name = vendor_id ? vendor?.name : vendor_name;
                return name ? (
                    <div className="space-y-1">
                        <p className="text-sm">{name}</p>
                        {vendorInfo && <Badge className={vendorInfo.classes}>{vendorInfo.label}</Badge>}
                    </div>
                ) : (
                    <span className="text-sm">-</span>
                );
            },
        },
        {
            accessorKey: 'amount',
            header: 'Jumlah',
            cell: ({ row }) => {
                const { amount, is_billable, invoice } = row.original;
                const isBilled = !!invoice;
                return (
                    <div className="space-y-1">
                        <p className="text-sm font-medium tabular-nums">{formatRupiah(Number(amount))}</p>
                        {is_billable ? (
                            isBilled ? (
                                <Badge className="bg-emerald-500 text-white">Sudah Ditagihkan</Badge>
                            ) : (
                                <Badge className="bg-yellow-500 text-white">Belum Ditagihkan</Badge>
                            )
                        ) : (
                            <Badge className="bg-slate-500 text-white">Non-billable</Badge>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'expense_date',
            header: 'Tanggal',
            cell: ({ row }) => <span className="text-sm">{formatDate(row.original.expense_date)}</span>,
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => <Actions expense={row.original} />,
        },
    ];
}
