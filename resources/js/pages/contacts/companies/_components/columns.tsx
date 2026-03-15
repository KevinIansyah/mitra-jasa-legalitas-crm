import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_BUSINESS_MAP, STATUS_LEGAL_MAP, type CompanyWithCustomers } from '@/types/contacts';
import Actions from './actions';

export default function getColumns(expandedRow: string | null, setExpandedRow: (id: string | null) => void): ColumnDef<CompanyWithCustomers>[] {
    return [
        {
            accessorKey: 'name',
            header: 'Perusahaan',
            cell: ({ row }) => {
                const { name, status_legal, category_business } = row.original;
                const status = status_legal ? STATUS_LEGAL_MAP[status_legal] : null;
                const category = category_business ? CATEGORY_BUSINESS_MAP[category_business] : null;
                return (
                    <div className="space-y-1">
                        <p className="text-sm font-medium">{name || '-'}</p>
                        <div className="flex items-center gap-1">
                            {status && <Badge className={status.classes}>{status.label}</Badge>}
                            {category && <Badge className={category.classes}>{category.label}</Badge>}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'contact',
            header: 'Kontak',
            cell: ({ row }) => {
                const { phone, email } = row.original;
                return (
                    <div className="space-y-0.5">
                        <p className="text-sm">{phone || '-'}</p>
                        {email && <p className="text-xs text-muted-foreground">{email}</p>}
                    </div>
                );
            },
        },
        {
            accessorKey: 'customers_count',
            header: 'PIC',
            cell: ({ row }) => <span className="text-sm tabular-nums">{row.original.customers_count} pelanggan</span>,
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => <Actions company={row.original} isExpanded={expandedRow === row.id} onToggleExpand={() => setExpandedRow(expandedRow === row.id ? null : row.id)} />,
        },
    ];
}
