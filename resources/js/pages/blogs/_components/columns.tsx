import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { Blog } from '@/types/blogs';
import Actions from './actions';

export default function getColumns(): ColumnDef<Blog>[] {
    return [
        {
            accessorKey: 'title',
            header: 'Judul',
            cell: ({ row }) => {
                const { title, slug } = row.original;
                return (
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium">{title || '-'}</p>
                        <p className="text-xs text-muted-foreground">{slug || '-'}</p>
                    </div>
                );
            },
        },
        {
            accessorKey: 'category',
            header: 'Kategori',
            cell: ({ row }) => {
                const category = row.original.category;
                return category ? (
                    <Badge variant="secondary">{category.name}</Badge>
                ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                );
            },
        },
        {
            accessorKey: 'is_published',
            header: 'Publikasi',
            cell: ({ row }) => {
                const isPublished = row.getValue<boolean>('is_published');
                return isPublished ? (
                    <Badge className="bg-emerald-500 text-white">Published</Badge>
                ) : (
                    <Badge variant="secondary">Draft</Badge>
                );
            },
        },
        {
            accessorKey: 'is_featured',
            header: 'Unggulan',
            cell: ({ row }) => {
                const isFeatured = row.getValue<boolean>('is_featured');
                return isFeatured ? (
                    <Badge className="bg-blue-600 text-white">Featured</Badge>
                ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                );
            },
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => <Actions blog={row.original} />,
        },
    ];
}
