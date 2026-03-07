import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_BUSINESS_MAP, STATUS_LEGAL_MAP, type CompanyWithCustomers } from '@/types/contact';
import Actions from './actions';

export default function getColumns(expandedRow: string | null, setExpandedRow: (id: string | null) => void): ColumnDef<CompanyWithCustomers>[] {
    return [
        {
            accessorKey: 'company',
            header: 'Perusahaan',
            cell: ({ row }) => {
                const { name, status_legal, category_business, customers_count } = row.original;

                const status = status_legal ? STATUS_LEGAL_MAP[status_legal] : null;
                const category = category_business ? CATEGORY_BUSINESS_MAP[category_business] : null;

                return (
                    <div className="grid w-80 grid-cols-[90px_1fr] items-center gap-x-2 gap-y-2 text-sm">
                        <span className="col-span-2 text-xs font-bold text-muted-foreground">Perusahaan</span>
                        <span className="text-xs font-medium text-muted-foreground">Nama</span>
                        <span>{name || '-'}</span>

                        <span className="col-span-2 mt-4 text-xs font-bold text-muted-foreground">Legal Bisnis</span>

                        <span className="text-xs font-medium text-muted-foreground">Legal</span>
                        {status ? <Badge className={status.className}>{status.label}</Badge> : <span>-</span>}

                        <span className="text-xs font-medium text-muted-foreground">Bisnis</span>
                        {category ? <Badge className={category.className}>{category.label}</Badge> : <span>-</span>}

                        <span className="col-span-2 mt-4 text-xs font-bold text-muted-foreground">Pelanggan (PIC)</span>
                        <span className="text-xs font-medium text-muted-foreground">Jumlah</span>
                        <span>{customers_count}</span>
                    </div>
                );
            },
        },
        {
            id: 'contact_address',
            header: 'Kontak & Alamat',
            cell: ({ row }) => {
                const { phone, email, address, city, province, postal_code } = row.original;

                const hasContact = phone || email;
                const hasAddress = address || city || province || postal_code;

                if (!hasContact && !hasAddress) {
                    return <span>-</span>;
                }

                return (
                    <div className="grid w-110 grid-cols-[90px_1fr] items-start gap-x-2 gap-y-2 overflow-hidden text-sm">
                        {hasContact && (
                            <>
                                <span className="col-span-2 text-xs font-bold text-muted-foreground">Kontak</span>

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
                            </>
                        )}

                        {hasAddress && (
                            <>
                                <span className="col-span-2 mt-4 text-xs font-bold text-muted-foreground">Alamat</span>

                                {address && (
                                    <>
                                        <span className="text-xs font-medium text-muted-foreground">Alamat</span>
                                        <span className="min-w-0 wrap-break-word whitespace-normal">{address}</span>
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
                            </>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => <Actions company={row.original} isExpanded={expandedRow === row.id} onToggleExpand={() => setExpandedRow(expandedRow === row.id ? null : row.id)} />,
        },
    ];
}
