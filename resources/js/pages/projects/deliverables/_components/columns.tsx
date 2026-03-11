import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { ProjectDeliverable } from '@/types/project';
import Actions from './actions';

export default function getColumns(expandedRow: string | null, setExpandedRow: (id: string | null) => void): ColumnDef<ProjectDeliverable>[] {
    return [
        {
            accessorKey: 'name',
            header: 'Hasil Akhir',
            cell: ({ row }) => {
                const { name, version, is_final, is_encrypted } = row.original;
                return (
                    <div className="space-y-1">
                        <p className="text-sm font-medium whitespace-normal">{name || '-'}</p>
                        <div className="flex items-center gap-1">
                            {version && <Badge className="bg-blue-600 text-white">{version}</Badge>}
                            {is_final && <Badge className="bg-emerald-500 text-white">Final</Badge>}
                            {is_encrypted && <Badge variant="secondary">Terenkripsi</Badge>}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'project',
            header: 'Project',
            cell: ({ row }) => {
                const { project } = row.original;
                return <span className="text-sm">{project?.name ?? '-'}</span>;
            },
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => (
                <Actions deliverable={row.original} isExpanded={expandedRow === row.id} onToggleExpand={() => setExpandedRow(expandedRow === row.id ? null : row.id)} />
            ),
        },
    ];
}
