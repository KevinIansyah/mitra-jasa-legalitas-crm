import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/service';
import { TIER_MAP } from '@/types/contact';
import { PROJECT_STATUSES, type Project } from '@/types/project';
import Actions from './actions';

export default function getColumns(expandedRow: string | null, setExpandedRow: (id: string | null) => void): ColumnDef<Project>[] {
    return [
        {
            accessorKey: 'name',
            header: 'Project',
            cell: ({ row }) => {
                const { name, service } = row.original;
                return (
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium whitespace-normal">{name || '-'}</p>
                        {service && <p className="text-xs text-muted-foreground">{service.name}</p>}
                    </div>
                );
            },
        },
        {
            accessorKey: 'customer',
            header: 'Pelanggan',
            cell: ({ row }) => {
                const { customer, company } = row.original;
                return (
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm">{customer?.name ?? '-'}</span>
                            {customer?.tier && (
                                <Badge className={TIER_MAP[customer.tier]?.classes ?? 'bg-muted text-muted-foreground'}>{TIER_MAP[customer.tier]?.label ?? customer.tier}</Badge>
                            )}
                        </div>
                        {company && <p className="text-xs text-muted-foreground">{company.name}</p>}
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const { status, progress_percentage } = row.original;
                const statusConfig = PROJECT_STATUSES.find((s) => s.value === status);
                return (
                    <Badge className={statusConfig?.classes ?? 'bg-muted text-muted-foreground'}>
                        {statusConfig?.label ?? status} - {progress_percentage ?? 0}%
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'budget',
            header: 'Budget',
            cell: ({ row }) => <span className="text-sm tabular-nums">{formatRupiah(Number(row.original.budget))}</span>,
        },
        {
            accessorKey: 'project_leader',
            header: 'Project Leader',
            cell: ({ row }) => <span className="text-sm">{row.original.project_leader?.name ?? '-'}</span>,
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => <Actions project={row.original} isExpanded={expandedRow === row.id} onToggleExpand={() => setExpandedRow(expandedRow === row.id ? null : row.id)} />,
        },
    ];
}
