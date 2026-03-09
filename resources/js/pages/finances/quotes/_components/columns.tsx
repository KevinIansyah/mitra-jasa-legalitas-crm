import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { Quote } from '@/types/quote';
import { QUOTE_TIMELINES_MAP, QUOTE_SOURCES_MAP, QUOTE_BUDGET_RANGES_MAP } from '@/types/quote';
import Actions from './actions';


export default function getColumns(expandedRow: string | null, setExpandedRow: (id: string | null) => void): ColumnDef<Quote>[] {
    return [
        {
            accessorKey: 'quote',
            header: 'Quote',
            cell: ({ row }) => {
                const { reference_number, project_name, user, source } = row.original;
                const sourceInfo = QUOTE_SOURCES_MAP[source];

                return (
                    <div className="grid w-80 grid-cols-[110px_1fr] items-center gap-x-2 gap-y-2 text-sm">
                        <span className="col-span-2 text-xs font-bold text-muted-foreground">Quote</span>
                        <span className="text-xs font-medium text-muted-foreground">Referensi</span>
                        <span className="font-medium">{reference_number}</span>

                        <span className="text-xs font-medium text-muted-foreground">Nama Project</span>
                        <span className="font-medium whitespace-normal">{project_name}</span>

                        <span className="col-span-2 mt-4 text-xs font-bold text-muted-foreground">Pemohon</span>
                        <span className="text-xs font-medium text-muted-foreground">Nama</span>
                        <span className="whitespace-normal">{user?.name ?? '-'}</span>

                        <span className="text-xs font-medium text-muted-foreground">Email</span>
                        <span className="whitespace-normal">{user?.email ?? '-'}</span>

                        <span className="text-xs font-medium text-muted-foreground">Sumber</span>
                        <Badge variant="secondary">{sourceInfo?.label}</Badge>
                    </div>
                );
            },
        },
        {
            accessorKey: 'detail',
            header: 'Detail',
            cell: ({ row }) => {
                const { timeline, budget_range, service, service_package, business_type } = row.original;
                const timelineInfo = QUOTE_TIMELINES_MAP[timeline];
                const budgetInfo = budget_range ? QUOTE_BUDGET_RANGES_MAP[budget_range] : null;

                return (
                    <div className="grid w-80 grid-cols-[110px_1fr] items-center gap-x-2 gap-y-2 text-sm">
                        <span className="col-span-2 text-xs font-bold text-muted-foreground">Layanan</span>
                        <span className="text-xs font-medium text-muted-foreground">Layanan</span>
                        <span className="whitespace-normal">{service?.name ?? '-'}</span>

                        {service_package && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Paket</span>
                                <span className="whitespace-normal">{service_package.name}</span>
                            </>
                        )}

                        {business_type && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Bisnis</span>
                                <span>{business_type}</span>
                            </>
                        )}

                        <span className="col-span-2 mt-4 text-xs font-bold text-muted-foreground">Preferensi</span>
                        <span className="text-xs font-medium text-muted-foreground">Timeline</span>
                        <Badge className={timelineInfo?.classes}>{timelineInfo?.label}</Badge>

                        {budgetInfo && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Budget</span>
                                <span>{budgetInfo.label}</span>
                            </>
                        )}
                    </div>
                );
            },
        },
        // {
        //     accessorKey: 'estimate',
        //     header: 'Estimate',
        //     cell: ({ row }) => {
        //         const { active_estimate, estimates } = row.original;
        //         const totalVersions = estimates?.length ?? 0;

        //         if (!active_estimate) {
        //             return <span className="text-sm text-muted-foreground">Belum ada estimate</span>;
        //         }

        //         const statusInfo = {
        //             draft: { label: 'Draft', classes: 'bg-slate-500 text-white' },
        //             sent: { label: 'Terkirim', classes: 'bg-blue-500 text-white' },
        //             accepted: { label: 'Diterima', classes: 'bg-emerald-500 text-white' },
        //             rejected: { label: 'Ditolak', classes: 'bg-red-500 text-white' },
        //         }[active_estimate.status];

        //         return (
        //             <div className="grid w-56 grid-cols-[110px_1fr] items-center gap-x-2 gap-y-2 text-sm">
        //                 <span className="text-xs font-medium text-muted-foreground">Nomor</span>
        //                 <span className="font-medium">{active_estimate.estimate_number}</span>

        //                 <span className="text-xs font-medium text-muted-foreground">Total</span>
        //                 <span className="tabular-nums">{formatRupiah(Number(active_estimate.total_amount))}</span>

        //                 <span className="text-xs font-medium text-muted-foreground">Status</span>
        //                 <Badge className={statusInfo?.classes}>{statusInfo?.label}</Badge>

        //                 <span className="text-xs font-medium text-muted-foreground">Versi</span>
        //                 <span>
        //                     {active_estimate.version_label} ({totalVersions} total)
        //                 </span>

        //                 {active_estimate.valid_until && (
        //                     <>
        //                         <span className="text-xs font-medium text-muted-foreground">Berlaku</span>
        //                         <span>{formatDate(active_estimate.valid_until)}</span>
        //                     </>
        //                 )}
        //             </div>
        //         );
        //     },
        // },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => <Actions quote={row.original} isExpanded={expandedRow === row.id} onToggleExpand={() => setExpandedRow(expandedRow === row.id ? null : row.id)} />,
        },
    ];
}
