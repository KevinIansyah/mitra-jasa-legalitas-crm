import type { ColumnDef } from '@tanstack/react-table';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Testimonial } from '@/types/contents';
import type { Service } from '@/types/services';
import Actions from './actions';

function truncate(text: string, max: number) {
    const t = text.replace(/\s+/g, ' ').trim();
    if (t.length <= max) return t;
    return `${t.slice(0, max)}…`;
}

export default function getColumns(services: Service[]): ColumnDef<Testimonial>[] {
    return [
        {
            accessorKey: 'client_name',
            header: 'Klien',
            cell: ({ row }) => {
                const t = row.original;
                return (
                    <div className="max-w-xs space-y-0.5">
                        <p className="text-sm font-medium">{t.client_name}</p>
                        {(t.client_position || t.client_company) && (
                            <>
                                <p className="text-xs text-muted-foreground">{[t.client_position].filter(Boolean).join(' · ')}</p>
                                <p className="text-xs text-muted-foreground">{t.client_company}</p>
                            </>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'service',
            header: 'Layanan',
            cell: ({ row }) => <span className="text-sm">{row.original.service?.name ?? '—'}</span>,
        },
        {
            accessorKey: 'rating',
            header: 'Rating',
            cell: ({ row }) => (
                <div className="flex items-center gap-0.5" title={`${row.original.rating}/5`}>
                    {Array.from({ length: row.original.rating }).map((_, i) => (
                        <Star key={`r-${row.original.id}-${i}`} className="size-3.5 fill-amber-400 text-amber-400" />
                    ))}
                </div>
            ),
        },
        {
            accessorKey: 'content',
            header: 'Ulasan',
            cell: ({ row }) => <span className="block min-w-100 text-sm whitespace-normal">{truncate(row.original.content, 120)}</span>,
        },
        {
            accessorKey: 'is_published',
            header: 'Status',
            cell: ({ row }) =>
                row.original.is_published ? <Badge className="bg-emerald-500 text-white">Dipublikasikan</Badge> : <Badge className="bg-slate-500 text-white">Draf</Badge>,
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => <Actions testimonial={row.original} services={services} />,
        },
    ];
}
