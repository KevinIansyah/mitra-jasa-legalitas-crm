import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_BUSINESS_MAP, STATUS_LEGAL_MAP, type CompanyWithCustomers } from '@/types/contact';
import Actions from './actions';

export default function getColumns(): ColumnDef<CompanyWithCustomers>[] {
    return [
        {
            accessorKey: 'name',
            header: 'Nama',
            cell: ({ row }) => <span>{row.getValue<string>('name') ?? '-'}</span>,
        },
        {
            id: 'contact_address',
            header: 'Kontak & Alamat',
            cell: ({ row }) => {
                const { phone, email, address, city, province, postal_code } = row.original;

                const hasData = phone || email || address || city || province || postal_code;

                if (!hasData) {
                    return <span>-</span>;
                }

                return (
                    <div className="grid w-full grid-cols-[110px_1fr] items-start gap-x-2 gap-y-2 text-sm">
                        {(phone || email) && <span className="col-span-2 text-xs font-bold text-muted-foreground">Kontak</span>}

                        {phone && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">No. Telepon</span>
                                <span>{phone}</span>
                            </>
                        )}

                        {email && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Email</span>
                                <span>{email}</span>
                            </>
                        )}

                        {(address || city || province || postal_code) && <span className="col-span-2 mt-3 text-xs font-bold text-muted-foreground">Alamat</span>}

                        {address && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Alamat</span>
                                <span className="whitespace-normal">{address}</span>
                            </>
                        )}

                        {city && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Kota</span>
                                <span>{city}</span>
                            </>
                        )}

                        {province && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Provinsi</span>
                                <span>{province}</span>
                            </>
                        )}

                        {postal_code && (
                            <>
                                <span className="text-xs font-medium text-muted-foreground">Kode Pos</span>
                                <span>{postal_code}</span>
                            </>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'legal_business',
            header: 'Legal & Bisnis',
            cell: ({ row }) => {
                const statusKey = row.original.status_legal;
                const categoryKey = row.original.category_business;

                const status = statusKey ? STATUS_LEGAL_MAP[statusKey] : null;
                const category = categoryKey ? CATEGORY_BUSINESS_MAP[categoryKey] : null;

                return (
                    <div className="grid w-70 grid-cols-[50px_1fr] gap-y-2 text-xs">
                        <span className="text-muted-foreground">Legal</span>
                        {status ? <Badge className={status.className}>{status.label}</Badge> : <Badge variant="secondary">Tidak Diketahui</Badge>}

                        <span className="text-muted-foreground">Bisnis</span>
                        {category ? <Badge className={category.className}>{category.label}</Badge> : <Badge variant="secondary">Tidak Diketahui</Badge>}
                    </div>
                );
            },
        },
        {
            accessorKey: 'customers_count',
            header: 'Jumlah PIC',
            cell: ({ row }) => <div>{row.original.customers_count ?? 0}</div>,
        },

        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => {
                return <Actions company={row.original} />;
            },
        },
    ];
}
