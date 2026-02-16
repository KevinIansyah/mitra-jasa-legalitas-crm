import type { ColumnDef } from '@tanstack/react-table';
import type { ServiceCategory } from '@/types/service';
import Actions from './actions';

export default function getColumns(): ColumnDef<ServiceCategory>[] {
    return [
        {
            accessorKey: 'name',
            header: 'Nama',
            cell: ({ row }) => <div>{row.getValue('name') || '-'}</div>,
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => {
                return <Actions category={row.original} />;
            },
        },
    ];
}
