import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { ProjectTemplate } from '@/types/project-templates';
import Actions from './actions';

export default function getColumns(expandedRow: string | null, setExpandedRow: (id: string | null) => void): ColumnDef<ProjectTemplate>[] {
    return [
        {
            accessorKey: 'name',
            header: 'Template',
            cell: ({ row }) => {
                const { name, service, service_id } = row.original;
                return (
                    <div className="space-y-1">
                        <p className="text-sm font-medium whitespace-normal">{name || '-'}</p>
                        <div className="flex items-center gap-1">
                            {service_id ? <Badge>Service Based</Badge> : <Badge className="bg-slate-500 text-white">Custom</Badge>}
                            {service && <span className="text-xs text-muted-foreground">{service.name}</span>}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'estimated_duration_days',
            header: 'Durasi Estimasi',
            cell: ({ row }) => <span className="text-sm">{row.original.estimated_duration_days ? `${row.original.estimated_duration_days} hari` : '-'}</span>,
        },
        {
            accessorKey: 'milestones_count',
            header: 'Milestone',
            cell: ({ row }) => <span className="text-sm tabular-nums">{row.original.milestones_count ?? 0}</span>,
        },
        {
            accessorKey: 'documents_count',
            header: 'Dokumen',
            cell: ({ row }) => <span className="text-sm tabular-nums">{row.original.documents_count ?? 0}</span>,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const { status } = row.original;
                const label = status.charAt(0).toUpperCase() + status.slice(1);
                return <Badge className={status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}>{label}</Badge>;
            },
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => (
                <Actions template={row.original} isExpanded={expandedRow === row.id} onToggleExpand={() => setExpandedRow(expandedRow === row.id ? null : row.id)} />
            ),
        },
    ];
}
