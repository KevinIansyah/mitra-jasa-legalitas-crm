import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { ProjectTemplate } from '@/types/project-template';
import Actions from './actions';

export default function getColumns(expandedRow: string | null, setExpandedRow: (id: string | null) => void): ColumnDef<ProjectTemplate>[] {
    return [
        {
            accessorKey: 'template',
            header: 'Template',
            cell: ({ row }) => {
                const { name, service, estimated_duration_days, milestones_count, documents_count } = row.original;

                return (
                    <div className="grid w-100 grid-cols-[110px_1fr] items-center gap-x-2 gap-y-2 text-sm">
                        <span className="col-span-2 text-xs font-bold text-muted-foreground">Template</span>
                        <span className="text-xs font-medium text-muted-foreground">Nama</span>
                        <span className="whitespace-normal">{name || '-'}</span>

                        <span className="col-span-2 mt-4 text-xs font-bold text-muted-foreground">Detail</span>
                        {service && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Layanan</span>
                                <span className="whitespace-normal">{service.name}</span>
                            </>
                        )}

                        <span className="text-xs font-medium text-muted-foreground">Durasi Estimasi</span>
                        <span>{estimated_duration_days ? `${estimated_duration_days} hari` : '-'}</span>

                        <span className="text-xs font-medium text-muted-foreground">Milestone</span>
                        <span>{milestones_count ?? 0}</span>

                        <span className="text-xs font-medium text-muted-foreground">Dokumen</span>
                        <span>{documents_count ?? 0}</span>
                    </div>
                );
            },
        },
        {
            id: 'information',
            header: 'Informasi',
            cell: ({ row }) => {
                const { service_id, status } = row.original;
                const label = status.charAt(0).toUpperCase() + status.slice(1);

                return (
                    <div className="grid w-60 grid-cols-[110px_1fr] items-center gap-x-2 gap-y-2 text-sm">
                        <span className="col-span-2 text-xs font-bold text-muted-foreground">Informasi</span>
                        <span className="text-xs font-medium text-muted-foreground">Tipe</span>
                        {service_id ? <Badge>Service Based</Badge> : <Badge variant="secondary">Custom</Badge>}

                        <span className="text-xs font-medium text-muted-foreground">Status</span>
                        <Badge className={status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}>{label}</Badge>
                    </div>
                );
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
