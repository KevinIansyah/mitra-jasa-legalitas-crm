import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { Customer } from '@/types/contact';
import Actions from './actions';

export default function getColumns(): ColumnDef<Customer>[] {
    const tierVariantMap: Record<string, string> = {
        bronze: 'bg-amber-700 text-white',
        silver: 'bg-slate-400 text-slate-900',
        gold: 'bg-yellow-500 text-white',
        platinum: 'bg-indigo-600 text-white',
    };

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

                return <Badge className={tierVariantMap[tier] ?? 'bg-muted text-muted-foreground'}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</Badge>;
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.getValue<string>('status');
                const isActive = status === 'active';

                return isActive ? (
                    <Badge className="bg-emerald-500 text-white">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
                ) : (
                    <Badge variant="destructive">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
                );
            },
        },
        {
            accessorKey: 'user_id',
            header: 'Akun',
            cell: ({ row }) => {
                const userId = row.getValue<number | null>('user_id');

                return userId ? <Badge className="bg-emerald-500 text-white">Terdaftar</Badge> : <Badge variant="secondary">Belum</Badge>;
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
