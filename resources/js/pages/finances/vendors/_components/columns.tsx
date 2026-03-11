import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { VENDOR_CATEGORIES_MAP, type Vendor } from '@/types/vendors';
import Actions from './actions';

export default function getColumns(expandedRow: string | null, setExpandedRow: (id: string | null) => void): ColumnDef<Vendor>[] {
    return [
        {
            accessorKey: 'vendor',
            header: 'Vendor',
            cell: ({ row }) => {
                const { name, category } = row.original;
                const categoryData = category ? VENDOR_CATEGORIES_MAP[category] : null;
                return (
                    <div className="space-y-1">
                        <p className="text-sm font-medium">{name || '-'}</p>
                        {categoryData && <Badge className={categoryData.classes}>{categoryData.label}</Badge>}
                    </div>
                );
            },
        },
        {
            accessorKey: 'contact',
            header: 'Kontak',
            cell: ({ row }) => {
                const { phone, email } = row.original;
                return (
                    <div className="space-y-0.5">
                        <p className="text-sm">{phone || '-'}</p>
                        {email && <p className="text-xs text-muted-foreground">{email}</p>}
                    </div>
                );
            },
        },
        {
            accessorKey: 'primary_bank_account',
            header: 'Rekening Utama',
            cell: ({ row }) => {
                const acc = row.original.primary_bank_account;
                if (!acc) return <span className="text-sm">-</span>;
                return (
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium">{acc.bank_name}</p>
                        <p className="text-xs text-muted-foreground">
                            {acc.account_number} a/n {acc.account_holder}
                        </p>
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const { status } = row.original;
                const label = status.charAt(0).toUpperCase() + status.slice(1);
                return <Badge className={status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}>{label}</Badge>;
            },
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => <Actions vendor={row.original} isExpanded={expandedRow === row.id} onToggleExpand={() => setExpandedRow(expandedRow === row.id ? null : row.id)} />,
        },
    ];
}
