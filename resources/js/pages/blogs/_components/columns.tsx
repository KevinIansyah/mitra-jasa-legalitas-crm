import type { ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';

import { formatRupiahNoSymbol } from '@/lib/service';
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
                    <div className="max-w-[450px] space-y-0.5 whitespace-normal">
                        <p className="text-sm font-medium">{title || '-'}</p>
                        <p className="text-xs text-muted-foreground">{slug || '-'}</p>
                    </div>
                );
            },
        },
        {
            accessorKey: 'stats',
            header: 'Statistik',
            cell: ({ row }) => {
                const { views, reading_time } = row.original;

                return (
                    <div className="flex flex-col gap-1">
                        {views != null ? <span className="text-sm tabular-nums">{formatRupiahNoSymbol(Number(views))} pengunjung</span> : <span>-</span>}
                        {reading_time != null ? <span className="text-sm tabular-nums">{reading_time} menit</span> : <span>-</span>}
                    </div>
                );
            },
        },
        {
            accessorKey: 'category',
            header: 'Kategori',
            cell: ({ row }) => {
                const category = row.original.category;
                return category ? <Badge className="bg-slate-500 text-white">{category.name}</Badge> : <span className="text-sm text-muted-foreground">-</span>;
            },
        },
        {
            accessorKey: 'flags',
            header: 'Flags',
            cell: ({ row }) => {
                const { is_featured: isFeatured } = row.original;
                return isFeatured ? <Badge className="bg-blue-600 text-white">Unggulan</Badge> : <span className="text-sm text-muted-foreground">-</span>;
            },
        },

        {
            accessorKey: 'is_published',
            header: 'Publikasi',
            cell: ({ row }) => {
                const isPublished = row.getValue<boolean>('is_published');
                return isPublished ? <Badge className="bg-emerald-500 text-white">Published</Badge> : <Badge className="bg-slate-500 text-white">Draft</Badge>;
            },
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => <Actions blog={row.original} />,
        },
    ];
}
