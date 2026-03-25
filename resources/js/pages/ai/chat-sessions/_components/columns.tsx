import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import type { ChatSession } from '../index';
import { Actions } from './actions';

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
    active: { label: 'Aktif', classes: 'bg-blue-500 text-white' },
    converted: { label: 'Converted', classes: 'bg-emerald-500 text-white' },
    closed: { label: 'Ditutup', classes: 'bg-slate-400 text-white' },
};

export default function getColumns(): ColumnDef<ChatSession>[] {
    return [
        {
            accessorKey: 'name',
            header: 'Pengunjung',
            cell: ({ row }) => {
                const { name, email, phone } = row.original;
                return (
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium">{name ?? 'Anonim'}</p>
                        {email && <p className="text-xs text-muted-foreground">{email}</p>}
                        {phone && <p className="text-xs text-muted-foreground">{phone}</p>}
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = STATUS_MAP[row.original.status] ?? STATUS_MAP['active'];
                return <Badge className={status.classes}>{status.label}</Badge>;
            },
        },
        {
            accessorKey: 'messages_count',
            header: 'Pesan',
            cell: ({ row }) => <span className="text-sm tabular-nums">{row.original.messages_count} pesan</span>,
        },
        {
            accessorKey: 'page_url',
            header: 'Halaman',
            cell: ({ row }) => <span className="max-w-48 truncate text-xs text-muted-foreground">{row.original.page_url ?? '-'}</span>,
        },
        {
            accessorKey: 'last_message_at',
            header: 'Terakhir Chat',
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.last_message_at ? formatDate(row.original.last_message_at) : '-'}</span>,
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => <Actions session={row.original} />,
        },
    ];
}
