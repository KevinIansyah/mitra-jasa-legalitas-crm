import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { type ProjectDocument } from '@/types/project';
import Actions from './actions';

export default function getColumns(expandedRow: string | null, setExpandedRow: (id: string | null) => void): ColumnDef<ProjectDocument>[] {
    return [
        {
            accessorKey: 'document',
            header: 'Dokumen',
            cell: ({ row }) => {
                const { name, is_required, is_encrypted, project, uploader, verifier } = row.original;

                return (
                    <div className="grid w-full min-w-100 grid-cols-[90px_1fr] items-center gap-x-2 gap-y-2 text-sm">
                        <span className="col-span-2 text-xs font-bold text-muted-foreground">Dokumen</span>
                        <span className="text-xs font-medium text-muted-foreground">Nama</span>
                        <span className="whitespace-normal">{name || '-'}</span>

                        {(is_required || is_encrypted) && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Keterangan</span>
                                <div className="flex items-center gap-2">
                                    {is_required && <Badge variant="destructive">Wajib</Badge>}
                                    {is_encrypted && <Badge variant="secondary">Terenkripsi</Badge>}
                                </div>
                            </>
                        )}

                        {uploader?.name && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Diunggah</span>
                                <span className="whitespace-normal">{uploader.name}</span>
                            </>
                        )}

                        {verifier?.name && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Diverifikasi</span>
                                <span className="whitespace-normal">{verifier.name}</span>
                            </>
                        )}

                        <span className="col-span-2 mt-4 text-xs font-bold text-muted-foreground">Project</span>
                        <span className="text-xs font-medium text-muted-foreground">Nama</span>
                        <span className="whitespace-normal">{project?.name || '-'}</span>

                        {/* <span className="text-xs font-medium text-muted-foreground">Progres</span>
                        <Badge className={statusConfig?.classes ?? 'bg-muted text-muted-foreground'}>{statusConfig?.label ?? status}</Badge> */}
                    </div>
                );
            },
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => {
                return <Actions document={row.original} isExpanded={expandedRow === row.id} onToggleExpand={() => setExpandedRow(expandedRow === row.id ? null : row.id)} />;
            },
        },
    ];
}
