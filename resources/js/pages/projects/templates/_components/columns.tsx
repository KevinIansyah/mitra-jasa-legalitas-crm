import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { ProjectTemplate } from '@/types/project-template';
import Actions from './actions';

export default function getColumns(): ColumnDef<ProjectTemplate>[] {
    return [
        {
            accessorKey: 'name',
            header: 'Nama',
            cell: ({ row }) => {
                const { name, description, service, estimated_duration_days, milestones_count, documents_count } = row.original;
                const serviceName = service?.name;

                return (
                    <div className="grid w-full min-w-100 grid-cols-[90px_1fr] items-center gap-x-2 gap-y-2 text-sm">
                        <span className="text-xs font-medium text-muted-foreground">Nama</span>
                        <span className="whitespace-normal">{name || '-'}</span>

                        <span className="text-xs font-medium text-muted-foreground">Deskripsi</span>
                        {description ? <span className="line-clamp-3 whitespace-normal text-muted-foreground">{description}</span> : <span className="whitespace-normal">-</span>}

                        <span className="text-xs font-medium text-muted-foreground">Layanan</span>
                        {serviceName ? <Badge className="whitespace-normal">{serviceName}</Badge> : <Badge variant="secondary" className="whitespace-normal">Tidak Ada Layanan</Badge>}
                        {/* <span className="whitespace-normal">{serviceName || '-'}</span> */}

                        <span className="text-xs font-medium text-muted-foreground">Durasi Estimasi</span>
                        <span className="whitespace-normal">{estimated_duration_days + ' hari' || '-'}</span>

                        <span className="text-xs font-medium text-muted-foreground">Milestone</span>
                        <span className="whitespace-normal">{milestones_count || '-'}</span>

                        <span className="text-xs font-medium text-muted-foreground">Dokumen</span>
                        <span className="whitespace-normal">{documents_count || '-'}</span>
                    </div>
                );
            },
        },

        {
            accessorKey: 'service_id',
            header: 'Tipe',
            cell: ({ row }) => {
                const serviceId = row.getValue<number | null>('service_id');

                return serviceId !== null && serviceId !== undefined ? <Badge>Service Based</Badge> : <Badge variant="secondary">Custom</Badge>;
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.getValue<string>('status');
                const isActive = status === 'active';

                return isActive ? (
                    <Badge className="bg-emerald-500 text-white">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
                ) : (
                    <Badge variant="destructive">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
                );
            },
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => {
                return <Actions template={row.original} />;
            },
        },
    ];
}
