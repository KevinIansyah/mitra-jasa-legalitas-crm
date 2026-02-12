import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { Service } from '@/types/service';
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

                return isPublished ? <Badge className="bg-emerald-600 text-white">Published</Badge> : <Badge variant="secondary">Draft</Badge>;
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
