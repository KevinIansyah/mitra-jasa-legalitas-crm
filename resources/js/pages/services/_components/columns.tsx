import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { Service } from '@/types/services';
import Actions from './actions';

export default function getColumns(): ColumnDef<Service>[] {
    return [
        {
            accessorKey: 'name',
            header: 'Nama',
            cell: ({ row }) => <span>{row.getValue<string>('name') ?? '-'}</span>,
        },
        {
            accessorKey: 'category',
            header: 'Kategori',
            cell: ({ row }) => {
                const category = row.original.category;

                return category ? <Badge>{category.name}</Badge> : <span>-</span>;
            },
        },
        {
            accessorKey: 'is_published',
            header: 'Publikasi',
            cell: ({ row }) => {
                const isPublished = row.getValue<boolean>('is_published');

                return isPublished ? <Badge className="bg-emerald-500 text-white">Published</Badge> : <Badge variant="secondary">Draft</Badge>;
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
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => {
                return <Actions service={row.original} />;
            },
        },
    ];
}
