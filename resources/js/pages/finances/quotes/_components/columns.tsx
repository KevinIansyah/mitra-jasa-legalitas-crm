import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { Quote } from '@/types/quote';
import { QUOTE_TIMELINES_MAP, QUOTE_SOURCES_MAP } from '@/types/quote';
import Actions from './actions';

export default function getColumns(expandedRow: string | null, setExpandedRow: (id: string | null) => void): ColumnDef<Quote>[] {
    return [
        {
            accessorKey: 'quote',
            header: 'Quote',
            cell: ({ row }) => {
                const { reference_number, project_name } = row.original;
                return (
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium">{project_name}</p>
                        <p className="text-xs text-muted-foreground">{reference_number}</p>
                    </div>
                );
            },
        },
        {
            accessorKey: 'pemohon',
            header: 'Pemohon',
            cell: ({ row }) => {
                const { user, source } = row.original;
                const sourceInfo = QUOTE_SOURCES_MAP[source];
                return (
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium">{user?.name ?? '-'}</p>
                        <p className="text-xs text-muted-foreground">{user?.email ?? '-'}</p>
                        {sourceInfo && <Badge variant="secondary">{sourceInfo.label}</Badge>}
                    </div>
                );
            },
        },
        {
            accessorKey: 'layanan',
            header: 'Layanan',
            cell: ({ row }) => {
                const { service, timeline } = row.original;
                const timelineInfo = QUOTE_TIMELINES_MAP[timeline];
                return (
                    <div className="space-y-1">
                        <p className="text-sm">{service?.name ?? '-'}</p>
                        {timelineInfo && <Badge className={timelineInfo.classes}>{timelineInfo.label}</Badge>}
                    </div>
                );
            },
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => <Actions quote={row.original} isExpanded={expandedRow === row.id} onToggleExpand={() => setExpandedRow(expandedRow === row.id ? null : row.id)} />,
        },
    ];
}
