import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import { TIER_VARIANT_MAP } from '@/types/contact';
import { PROJECT_STATUSES, type Project } from '@/types/project';
import Actions from './actions';

export default function getColumns(): ColumnDef<Project>[] {
    return [
        {
            accessorKey: 'project',
            header: 'Project',
            cell: ({ row }) => {
                const { name, description, customer, company, service } = row.original;

                return (
                    <div className="grid w-full min-w-100 grid-cols-[90px_1fr] items-center gap-x-2 gap-y-2 text-sm">
                        <span className="col-span-2 text-xs font-bold text-muted-foreground">Project</span>
                        <span className="text-xs font-medium text-muted-foreground">Nama</span>
                        <span className="whitespace-normal">{name || '-'}</span>

                        {description && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Deskripsi</span>
                                <span className="line-clamp-3 whitespace-normal text-muted-foreground">{description || '-'}</span>
                            </>
                        )}

                        {customer && (
                            <>
                                <span className="col-span-2 mt-4 text-xs font-bold text-muted-foreground">Detail</span>
                                <span className="text-xs font-medium text-muted-foreground">Pelanggan</span>
                                <span className="whitespace-normal">
                                    {customer.name || '-'}{' '}
                                    {customer.tier && (
                                        <Badge className={`ml-2 ${TIER_VARIANT_MAP[customer.tier] ?? 'bg-muted text-muted-foreground'}`}>
                                            {customer.tier.charAt(0).toUpperCase() + customer.tier.slice(1)}
                                        </Badge>
                                    )}
                                </span>
                            </>
                        )}

                        {company && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Perusahaan</span>
                                <span className="whitespace-normal">{company.name || '-'}</span>
                            </>
                        )}

                        {service && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Layanan</span>
                                <span className="whitespace-normal">{service.name || '-'}</span>
                            </>
                        )}

                        {/* {service_package && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Paket</span>
                                <span className="whitespace-normal">{service_package.name || '-'}</span>
                            </>
                        )} */}
                    </div>
                );
            },
        },
        {
            accessorKey: 'budget',
            header: 'Budget',
            cell: ({ row }) => {
                return <span>{formatRupiah(row.getValue<number>('budget'))}</span>;
            },
        },
        {
            accessorKey: 'project_leader',
            header: 'Project Leader',
            cell: ({ row }) => {
                const projectLeader = row.original.project_leader;

                return <span className="whitespace-normal">{projectLeader?.name || '-'}</span>;
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                const statusConfig = PROJECT_STATUSES.find((s) => s.value === status);

                return (
                    <Badge className={statusConfig?.classes ?? 'bg-muted text-muted-foreground'}>
                        {statusConfig?.label ?? status} - {row.original.progress_percentage ?? 0}%
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'created_at',
            header: 'Tanggal Dibuat',
            cell: ({ row }) => <span>{formatDate(row.getValue<string>('created_at'))}</span>,

            // <div className="grid w-full grid-cols-[140px_1fr] items-center gap-x-2 gap-y-2 text-sm">
            //     <span className="col-span-2 mt-2 text-xs font-bold text-muted-foreground">Informasi Project</span>

            //     <span className="text-xs font-medium text-muted-foreground">Tanggal Dibuat</span>
            //     <span>{formatDate(row.original.created_at) || '-'}</span>

            //     <span className="text-xs font-medium text-muted-foreground">Tanggal Mulai</span>
            //     <span>{formatDate(row.original.start_date) || '-'}</span>

            //     <span className="text-xs font-medium text-muted-foreground">Rencana Selesai</span>
            //     <span>{formatDate(row.original.planned_end_date) || '-'}</span>

            //     <span className="col-span-2 mt-3 text-xs font-bold text-muted-foreground">Pelaksanaan Aktual</span>

            //     <span className="text-xs font-medium text-muted-foreground">Tanggal Mulai</span>
            //     <span>{row.original.actual_start_date ? formatDate(row.original.actual_start_date) : '-'}</span>

            //     <span className="text-xs font-medium text-muted-foreground">Tanggal Selesai</span>
            //     <span>{row.original.actual_end_date ? formatDate(row.original.actual_end_date) : '-'}</span>
            // </div>
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => {
                return <Actions project={row.original} />;
            },
        },
    ];
}
