import type { ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';

import type { City } from '@/types/cities';
import Actions from './actions';

export default function getColumns(): ColumnDef<City>[] {
    return [
        {
            accessorKey: 'name',
            header: 'Kota',
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
            accessorKey: 'province',
            header: 'Provinsi',
            cell: ({ row }) => {
                const { province } = row.original;
                return <span className="text-sm">{province || <span className="text-muted-foreground">-</span>}</span>;
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const { status } = row.original;
                const label = status === 'active' ? 'Active' : 'Inactive';
                return <Badge className={status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}>{label}</Badge>;
            },
        },
        {
            accessorKey: 'service_city_pages_count',
            header: 'Halaman Layanan',
            cell: ({ row }) => {
                const count = row.original.service_city_pages_count ?? 0;
                return <Badge variant={count > 0 ? 'default' : 'secondary'}>{count} halaman</Badge>;
            },
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => <Actions city={row.original} />,
        },
    ];
}
