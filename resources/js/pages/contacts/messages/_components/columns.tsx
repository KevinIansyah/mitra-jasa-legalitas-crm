import type { ColumnDef } from '@tanstack/react-table';
import type { ContactMessage } from '@/types/contacts';
import Actions from './actions';

export default function getColumns(expandedRow: string | null, setExpandedRow: (id: string | null) => void): ColumnDef<ContactMessage>[] {
    return [
        {
            accessorKey: 'name',
            header: 'Pengirim',
            cell: ({ row }) => {
                const { name, whatsapp_number, email } = row.original;
                return (
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium">{name}</p>
                        <p className="text-xs text-muted-foreground">{whatsapp_number}</p>
                        {email && <p className="text-xs text-muted-foreground">{email}</p>}
                    </div>
                );
            },
        },
        {
            accessorKey: 'topic',
            header: 'Topik',
            cell: ({ row }) => <span className="text-sm">{row.original.topic ?? '-'}</span>,
        },
        {
            accessorKey: 'message',
            header: 'Pesan',
            cell: ({ row }) => <p className="max-w-xs truncate text-sm">{row.original.message}</p>,
        },
        {
            accessorKey: 'created_at',
            header: 'Diterima',
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
            cell: ({ row }) => <Actions message={row.original} isExpanded={expandedRow === row.id} onToggleExpand={() => setExpandedRow(expandedRow === row.id ? null : row.id)} />,
        },
    ];
}
