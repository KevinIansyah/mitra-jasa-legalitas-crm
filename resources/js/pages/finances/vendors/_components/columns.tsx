import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { VENDOR_CATEGORIES_MAP, type Vendor } from '@/types/vendors';
import Actions from './actions';

export default function getColumns(expandedRow: string | null, setExpandedRow: (id: string | null) => void): ColumnDef<Vendor>[] {
    return [
        {
            accessorKey: 'vendor',
            header: 'Vendor',
            cell: ({ row }) => {
                const { name, phone, email, category } = row.original;

                const categoryData = category ? VENDOR_CATEGORIES_MAP[category] : null;

                return (
                    <div className="grid w-full grid-cols-[100px_1fr] items-center gap-x-2 gap-y-2 text-sm">
                        <span className="col-span-2 text-xs font-bold text-muted-foreground">Vendor</span>

                        <span className="text-xs font-medium text-muted-foreground">Nama</span>
                        <span className="font-medium whitespace-normal">{name}</span>

                        {categoryData && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Kategori</span>
                                <Badge className={categoryData.classes}>{categoryData.label}</Badge>
                            </>
                        )}

                        {phone && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Telepon</span>
                                <span>{phone}</span>
                            </>
                        )}

                        {email && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Email</span>
                                <span>{email}</span>
                            </>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'bank_account',
            header: 'Rekening',
            cell: ({ row }) => {
                const { primary_bank_account } = row.original;

                return (
                    <>
                        {primary_bank_account ? (
                            <div className="grid w-full grid-cols-[100px_1fr] items-center gap-x-2 gap-y-2 text-sm">
                                <span className="col-span-2 mt-4 text-xs font-bold text-muted-foreground">Rekening Utama</span>
                                <span className="text-xs font-medium text-muted-foreground">Bank</span>
                                <span>{primary_bank_account.bank_name}</span>
                                <span className="text-xs font-medium text-muted-foreground">Rekening</span>
                                <span>
                                    {primary_bank_account.account_number} a/n {primary_bank_account.account_holder}
                                </span>
                            </div>
                        ) : (
                            <span>-</span>
                        )}
                    </>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.getValue<string>('status');
                const label = status.charAt(0).toUpperCase() + status.slice(1);

                return <Badge className={status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}>{label}</Badge>;
            },
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => <Actions vendor={row.original} isExpanded={expandedRow === row.id} onToggleExpand={() => setExpandedRow(expandedRow === row.id ? null : row.id)} />,
        },
    ];
}
