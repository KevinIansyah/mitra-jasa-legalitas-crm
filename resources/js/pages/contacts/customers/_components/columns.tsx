import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { TIER_MAP, type Customer } from '@/types/contacts';
import Actions from './actions';

export default function getColumns(): ColumnDef<Customer>[] {
    return [
        {
            accessorKey: 'name',
            header: 'Pelanggan',
            cell: ({ row }) => {
                const { name, phone, email } = row.original;
                return (
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium">{name || '-'}</p>
                        <p className="text-xs text-muted-foreground">{phone || '-'}</p>
                        <p className="text-xs text-muted-foreground">{email || '-'}</p>
                    </div>
                );
            },
        },
        {
            accessorKey: 'tier',
            header: 'Tier',
            cell: ({ row }) => {
                const { tier } = row.original;
                const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
                return <Badge className={TIER_MAP[tier]?.classes ?? 'bg-muted text-muted-foreground'}>{tierLabel}</Badge>;
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
            accessorKey: 'user_id',
            header: 'Akun',
            cell: ({ row }) => (row.original.user_id ? <Badge className="bg-emerald-500 text-white">Terdaftar</Badge> : <Badge variant="secondary">Belum Terdaftar</Badge>),
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => <Actions customer={row.original} />,
        },
    ];
}
