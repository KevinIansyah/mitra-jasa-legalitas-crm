import type { ColumnDef } from '@tanstack/react-table';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { getInitials } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import type { User } from '@/types/auth';
import Actions from './actions';

export default function getColumns(): ColumnDef<User>[] {
    const R2_PUBLIC_URL = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL;

    return [
        {
            accessorKey: 'name',
            header: 'User',
            cell: ({ row }) => {
                const { name, email, phone, avatar } = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                            <AvatarImage src={`${R2_PUBLIC_URL}/${avatar}`} alt={name} />
                            <AvatarFallback className="bg-primary/10 text-xs text-primary">{getInitials(name)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium">{name}</p>
                            <p className="text-xs text-muted-foreground">{email}</p>
                            {phone && <p className="text-xs text-muted-foreground">{phone}</p>}
                        </div>
                    </div>
                );
            },
        },

        {
            accessorKey: 'created_at',
            header: 'Terdaftar',
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.created_at)}</span>,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => <Actions user={row.original} />,
        },
    ];
}
