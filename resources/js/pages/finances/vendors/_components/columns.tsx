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
                const { name, phone, email, category, npwp, address } = row.original;

                const categoryData = category ? VENDOR_CATEGORIES_MAP[category] : null;

                return (
                    <div className="grid w-100 grid-cols-[110px_1fr] items-center gap-x-2 gap-y-2 text-sm">
                        <span className="col-span-2 text-xs font-bold text-muted-foreground">Vendor</span>
                        <span className="text-xs font-medium text-muted-foreground">Nama</span>
                        <span className="font-medium whitespace-normal">{name || '-'}</span>

                        <span className="text-xs font-medium text-muted-foreground">Kategori</span>
                        {categoryData ? <Badge className={categoryData.classes}>{categoryData.label}</Badge> : <span>-</span>}

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

                        {npwp && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">NPWP</span>
                                <span>{npwp}</span>
                            </>
                        )}

                        {address && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Alamat</span>
                                <span className="min-w-0 break-words whitespace-normal">{address}</span>
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
                const { primary_bank_account, status } = row.original;
                const label = status.charAt(0).toUpperCase() + status.slice(1);

                return (
                    <div className="grid w-60 grid-cols-[110px_1fr] items-center gap-x-2 gap-y-2 text-sm">
                        <span className="col-span-2 text-xs font-bold text-muted-foreground">Informasi</span>
                        <span className="text-xs font-medium text-muted-foreground">Status</span>
                        <Badge className={status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}>{label}</Badge>

                        {primary_bank_account && (
                            <>
                                <span className="col-span-2 mt-4 text-xs font-bold text-muted-foreground">Rekening Utama</span>
                                <span className="text-xs font-medium text-muted-foreground">Bank</span>
                                <span>{primary_bank_account.bank_name}</span>
                                <span className="text-xs font-medium text-muted-foreground">Rekening</span>
                                <span>
                                    {primary_bank_account.account_number} a/n {primary_bank_account.account_holder}
                                </span>
                            </>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => <Actions vendor={row.original} isExpanded={expandedRow === row.id} onToggleExpand={() => setExpandedRow(expandedRow === row.id ? null : row.id)} />,
        },
    ];
}
