import type { ColumnDef } from '@tanstack/react-table';
import type { ServiceCategory } from '@/types/service';
import Actions from './actions';

export default function getColumns(): ColumnDef<ServiceCategory>[] {
    return [
        {
            accessorKey: 'name',
            header: 'Nama',
            cell: ({ row }) => {
                const { name, slug } = row.original;
                return (
                    <div className="space-y-0.5">
                        <p className="text-sm">{name || '-'}</p>
                        <p className="text-xs text-muted-foreground">{slug || '-'}</p>
                    </div>
                );
            },
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
