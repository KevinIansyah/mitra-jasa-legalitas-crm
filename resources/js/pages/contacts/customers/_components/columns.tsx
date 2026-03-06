import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { TIER_VARIANT_MAP, type Customer } from '@/types/contact';
import Actions from './actions';

export default function getColumns(): ColumnDef<Customer>[] {
    return [
        {
            accessorKey: 'name',
            header: 'Nama',
            cell: ({ row }) => <span>{row.getValue<string>('name') ?? '-'}</span>,
        },
        {
            accessorKey: 'phone',
            header: 'No Telepon / Whatsapp',
            cell: ({ row }) => <span>{row.getValue<string>('phone') ?? '-'}</span>,
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => <span>{row.getValue<string>('email') ?? '-'}</span>,
        },
        {
            accessorKey: 'tier',
            header: 'Tier',
            cell: ({ row }) => {
                const tier = row.getValue<string>('tier');

                return <Badge className={TIER_VARIANT_MAP[tier] ?? 'bg-muted text-muted-foreground'}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</Badge>;
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.getValue<string>('status');
                const label = status.charAt(0).toUpperCase() + status.slice(1);

                return <Badge className={status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}>{label}</Badge>;
            },
        },
        {
            accessorKey: 'user_id',
            header: 'Akun',
            cell: ({ row }) => {
                const userId = row.getValue<number | null>('user_id');

                return userId ? <Badge className="bg-emerald-500 text-white">Terdaftar</Badge> : <Badge variant="secondary">Belum Terdaftar</Badge>;
            },
        },

        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => {
                return <Actions customer={row.original} />;
            },
        },
    ];
}
