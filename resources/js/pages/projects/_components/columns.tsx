import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import { TIER_MAP } from '@/types/contact';
import { PROJECT_STATUSES, type Project } from '@/types/project';
import Actions from './actions';

export default function getColumns(expandedRow: string | null, setExpandedRow: (id: string | null) => void): ColumnDef<Project>[] {
    return [
        {
            accessorKey: 'project',
            header: 'Project',
            cell: ({ row }) => {
                const { name, customer, company, service } = row.original;

                return (
                    <div className="grid w-100 grid-cols-[110px_1fr] items-center gap-x-2 gap-y-2 text-sm">
                        <span className="col-span-2 text-xs font-bold text-muted-foreground">Project</span>
                        <span className="text-xs font-medium text-muted-foreground">Nama</span>
                        <span className="whitespace-normal">{name || '-'}</span>

                        {(customer || company || service) && <span className="col-span-2 mt-4 text-xs font-bold text-muted-foreground">Detail</span>}

                        {customer && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Pelanggan</span>
                                <span className="whitespace-normal">
                                    {customer.name || '-'}
                                    {customer.tier && (
                                        <Badge className={`ml-2 ${TIER_MAP[customer.tier]?.classes ?? 'bg-muted text-muted-foreground'}`}>
                                            {TIER_MAP[customer.tier]?.label ?? customer.tier}
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
                    </div>
                );
            },
        },
        {
            id: 'information',
            header: 'Informasi',
            cell: ({ row }) => {
                const { budget, project_leader, status, created_at } = row.original;
                const statusConfig = PROJECT_STATUSES.find((s) => s.value === status);

                return (
                    <div className="grid w-60 grid-cols-[110px_1fr] items-center gap-x-2 gap-y-2 text-sm">
                        <span className="col-span-2 text-xs font-bold text-muted-foreground">Informasi</span>
                        <span className="text-xs font-medium text-muted-foreground">Status</span>
                        <Badge className={statusConfig?.classes ?? 'bg-muted text-muted-foreground'}>
                            {statusConfig?.label ?? status} - {row.original.progress_percentage ?? 0}%
                        </Badge>

                        <span className="text-xs font-medium text-muted-foreground">Budget</span>
                        <span className="tabular-nums">{formatRupiah(Number(budget))}</span>

                        <span className="text-xs font-medium text-muted-foreground">Project Leader</span>
                        <span>{project_leader?.name || '-'}</span>

                        <span className="text-xs font-medium text-muted-foreground">Tanggal Dibuat</span>
                        <span>{formatDate(created_at)}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => <Actions project={row.original} isExpanded={expandedRow === row.id} onToggleExpand={() => setExpandedRow(expandedRow === row.id ? null : row.id)} />,
        },
    ];
}
