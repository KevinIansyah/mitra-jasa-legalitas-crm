import type { ColumnDef } from '@tanstack/react-table';
import type { Role } from '@/types/role';
import Actions from './actions';

export default function getColumns(): ColumnDef<Role>[] {
    return [
        {
            accessorKey: 'name',
            header: 'Nama',
            cell: ({ row }) => <span>{row.getValue<string>('name') ?? '-'}</span>,
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => {
                return <Actions role={row.original} />;
            },
        },
    ];
}
