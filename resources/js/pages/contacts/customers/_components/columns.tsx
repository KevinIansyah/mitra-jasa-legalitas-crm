import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { TIER_MAP, type Customer } from '@/types/contact';
import Actions from './actions';

export default function getColumns(): ColumnDef<Customer>[] {
    return [
        {
            accessorKey: 'customer',
            header: 'Pelanggan',
            cell: ({ row }) => {
                const { name, phone, email } = row.original;

                return (
                    <div className="grid w-100 grid-cols-[110px_1fr] items-center gap-x-2 gap-y-2 text-sm">
                        <span className="col-span-2 text-xs font-bold text-muted-foreground">Pelanggan</span>
                        <span className="text-xs font-medium text-muted-foreground">Nama</span>
                        <span className="whitespace-normal">{name || '-'}</span>

                        <span className="text-xs font-medium text-muted-foreground">No. Telepon</span>
                        <span>{phone || '-'}</span>

                        <span className="text-xs font-medium text-muted-foreground">Email</span>
                        <span>{email || '-'}</span>
                    </div>
                );
            },
        },
        {
            id: 'information',
            header: 'Informasi',
            cell: ({ row }) => {
                const { tier, status, user_id } = row.original;
                const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
                const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

                return (
                    <div className="grid w-60 grid-cols-[110px_1fr] items-center gap-x-2 gap-y-2 text-sm">
                        <span className="col-span-2 text-xs font-bold text-muted-foreground">Informasi</span>
                        <span className="text-xs font-medium text-muted-foreground">Tier</span>
                        <Badge className={TIER_MAP[tier]?.classes ?? 'bg-muted text-muted-foreground'}>{tierLabel}</Badge>

                        <span className="text-xs font-medium text-muted-foreground">Status</span>
                        <Badge className={status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}>{statusLabel}</Badge>

                        <span className="text-xs font-medium text-muted-foreground">Akun</span>
                        {user_id ? <Badge className="bg-emerald-500 text-white">Terdaftar</Badge> : <Badge variant="secondary">Belum Terdaftar</Badge>}
                    </div>
                );
            },
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => <Actions customer={row.original} />,
        },
    ];
}
