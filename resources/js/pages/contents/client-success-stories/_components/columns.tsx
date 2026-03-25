import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_BUSINESS_MAP } from '@/types/contacts';
import type { ClientSuccessStory } from '@/types/contents';
import Actions from './actions';

function truncate(text: string, max: number) {
    const t = text.replace(/\s+/g, ' ').trim();
    if (t.length <= max) return t;
    return `${t.slice(0, max)}…`;
}

export default function getColumns(): ColumnDef<ClientSuccessStory>[] {
    return [
        {
            accessorKey: 'client_name',
            header: 'Klien',
            cell: ({ row }) => {
                const t = row.original;
                return (
                    <div className="max-w-xs space-y-0.5">
                        <p className="text-sm font-medium">{t.client_name}</p>
                        <p className="text-xs text-muted-foreground">
                            {t.metric_value} {t.metric_label}
                        </p>
                    </div>
                );
            },
        },
        {
            accessorKey: 'industry',
            header: 'Industri',
            cell: ({ row }) => {
                const key = row.original.industry;
                const info = CATEGORY_BUSINESS_MAP[key as keyof typeof CATEGORY_BUSINESS_MAP] as { label: string; classes: string } | undefined;
                return info ? <Badge className={info.classes}>{info.label}</Badge> : <Badge className="bg-slate-500 text-white">{key}</Badge>;
            },
        },
        {
            accessorKey: 'challenge',
            header: 'Ringkasan',
            cell: ({ row }) => <p className="max-w-md text-sm whitespace-normal">{truncate(row.original.challenge, 100)}</p>,
        },
        {
            accessorKey: 'is_published',
            header: 'Status',
            cell: ({ row }) =>
                row.original.is_published ? <Badge className="bg-emerald-500 text-white">Published</Badge> : <Badge className="bg-slate-500 text-white">Draft</Badge>,
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => <Actions story={row.original} />,
        },
    ];
}
