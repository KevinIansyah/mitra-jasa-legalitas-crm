import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { ACCOUNT_CATEGORIES_MAP, ACCOUNT_TYPES_MAP, type Account } from '@/types/accounts';
import Actions from './actions';

export default function getColumns(): ColumnDef<Account>[] {
    return [
        {
            accessorKey: 'code',
            header: 'Kode & Nama',
            cell: ({ row }) => {
                const { code, name, is_system } = row.original;
                return (
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{name}</span>
                            {is_system && <Badge className="bg-slate-500 text-white">Sistem</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{code}</p>
                    </div>
                );
            },
        },
        {
            accessorKey: 'type',
            header: 'Tipe',
            cell: ({ row }) => {
                const typeMeta = ACCOUNT_TYPES_MAP[row.original.type];
                return typeMeta ? <Badge className={typeMeta.classes}>{typeMeta.label}</Badge> : <span className="text-sm">-</span>;
            },
        },
        {
            accessorKey: 'category',
            header: 'Kategori',
            cell: ({ row }) => {
                const categoryMeta = ACCOUNT_CATEGORIES_MAP[row.original.category];
                return categoryMeta ? <Badge className={categoryMeta.classes}>{categoryMeta.label}</Badge> : <span className="text-sm">-</span>;
            },
        },
        {
            accessorKey: 'normal_balance',
            header: 'Normal Balance',
            cell: ({ row }) => {
                const { normal_balance } = row.original;
                return (
                    <Badge className={normal_balance === 'debit' ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-white'}>{normal_balance === 'debit' ? 'Debit' : 'Credit'}</Badge>
                );
            },
        },
        {
            accessorKey: 'journal_lines_count',
            header: 'Transaksi',
            cell: ({ row }) => <span className="text-sm tabular-nums">{row.original.journal_lines_count ?? 0} entri</span>,
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
            cell: ({ row }) => <Actions account={row.original} />,
        },
    ];
}
