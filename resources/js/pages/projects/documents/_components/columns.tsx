import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { type ProjectDocument } from '@/types/projects';
import Actions from './actions';

export default function getColumns(expandedRow: string | null, setExpandedRow: (id: string | null) => void): ColumnDef<ProjectDocument>[] {
    return [
        {
            accessorKey: 'name',
            header: 'Dokumen',
            cell: ({ row }) => {
                const { name, is_required, is_encrypted } = row.original;
                return (
                    <div className="space-y-1">
                        <p className="text-sm font-medium whitespace-normal">{name || '-'}</p>
                        <div className="flex items-center gap-1">
                            {is_required && <Badge variant="destructive">Wajib</Badge>}
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
                <Actions document={row.original} isExpanded={expandedRow === row.id} onToggleExpand={() => setExpandedRow(expandedRow === row.id ? null : row.id)} />
            ),
        },
    ];
}
