import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { ServiceCategory } from '@/types/services';
import Actions from './actions';

export default function getColumns(): ColumnDef<ServiceCategory>[] {
    return [
        {
            accessorKey: 'name',
            header: 'Nama',
            cell: ({ row }) => {
                const { name, slug } = row.original;
                return (
                    <div className="space-y-0.5 md:w-60">
                        <p className="text-sm">{name || '-'}</p>
                        <p className="text-xs text-muted-foreground">{slug || '-'}</p>
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
            cell: ({ row }) => {
                return <Actions category={row.original} />;
            },
        },
    ];
}
