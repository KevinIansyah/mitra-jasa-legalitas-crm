import type { ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';

import { BLOG_SUBSCRIBER_VERIFIED_FILTER_MAP, type BlogSubscriber } from '@/types/blogs';
import Actions from './actions';

export default function getColumns(expandedRow: string | null, setExpandedRow: (id: string | null) => void): ColumnDef<BlogSubscriber>[] {
    return [
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => {
                const { email, name } = row.original;
                return (
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium">{email}</p>
                        {name && <p className="text-xs text-muted-foreground">{name}</p>}
                    </div>
                );
            },
        },
        {
            accessorKey: 'is_verified',
            header: 'Status',
            cell: ({ row }) => {
                const { is_verified } = row.original;
                const key = is_verified ? '1' : '0';
                const info = BLOG_SUBSCRIBER_VERIFIED_FILTER_MAP[key];
                return info ? <Badge className={`${info.classes} px-3 py-1`}>{info.label}</Badge> : null;
            },
        },
        {
            accessorKey: 'verified_at',
            header: 'Terverifikasi',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.original.verified_at
                        ? new Date(row.original.verified_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                          })
                        : '-'}
                </span>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Daftar',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {new Date(row.original.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                    })}
                </span>
            ),
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => <Actions subscriber={row.original} isExpanded={expandedRow === String(row.original.id)} onToggleExpand={() => setExpandedRow(expandedRow === String(row.original.id) ? null : String(row.original.id))} />,
        },
    ];
}
