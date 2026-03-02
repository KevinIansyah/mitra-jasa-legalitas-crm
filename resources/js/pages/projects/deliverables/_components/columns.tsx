import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { ProjectDeliverable } from '@/types/project';
import Actions from './actions';

export default function getColumns(expandedRow: string | null, setExpandedRow: (id: string | null) => void): ColumnDef<ProjectDeliverable>[] {
    return [
        {
            accessorKey: 'deliverable',
            header: 'Hasil Akhir',
            cell: ({ row }) => {
                const { name, version, is_encrypted, is_final, project } = row.original;

                return (
                    <div className="grid w-full min-w-100 grid-cols-[90px_1fr] items-center gap-x-2 gap-y-2 text-sm">
                        <span className="col-span-2 text-xs font-bold text-muted-foreground">Dokumen</span>
                        <span className="text-xs font-medium text-muted-foreground">Nama</span>
                        <span className="whitespace-normal">{name || '-'}</span>

                        {(is_final || is_encrypted) && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Keterangan</span>
                                <div className="flex items-center gap-2">
                                    {version && <Badge className="bg-blue-600 text-white">{version}</Badge>}
                                    {is_final && <Badge className="bg-emerald-500 text-white">Final</Badge>}
                                    {is_encrypted && <Badge variant="secondary">Terenkripsi</Badge>}
                                </div>
                            </>
                        )}

                        <span className="col-span-2 mt-4 text-xs font-bold text-muted-foreground">Project</span>
                        <span className="text-xs font-medium text-muted-foreground">Nama</span>
                        <span className="whitespace-normal">{project?.name || '-'}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => {
                return <Actions deliverable={row.original} isExpanded={expandedRow === row.id} onToggleExpand={() => setExpandedRow(expandedRow === row.id ? null : row.id)} />;
            },
        },
    ];
}
