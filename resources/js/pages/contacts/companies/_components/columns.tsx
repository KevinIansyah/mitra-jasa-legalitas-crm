import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { CompanyWithCustomers } from '@/types/contact';
import Actions from './actions';

export default function getColumns(): ColumnDef<CompanyWithCustomers>[] {
    const categoryBusinessMap: Record<
        string,
        {
            label: string;
            className: string;
        }
    > = {
        perdagangan: {
            label: 'Perdagangan',
            className: 'bg-blue-600 text-white',
        },
        fnb: {
            label: 'Food & Beverage',
            className: 'bg-rose-600 text-white',
        },
        jasa: {
            label: 'Jasa',
            className: 'bg-emerald-600 text-white',
        },
        manufaktur: {
            label: 'Manufaktur',
            className: 'bg-slate-700 text-white',
        },
        konstruksi: {
            label: 'Konstruksi',
            className: 'bg-orange-600 text-white',
        },

        pertanian: {
            label: 'Pertanian',
            className: 'bg-lime-600 text-white',
        },
        perkebunan: {
            label: 'Perkebunan',
            className: 'bg-green-700 text-white',
        },
        peternakan: {
            label: 'Peternakan',
            className: 'bg-yellow-600 text-slate-900',
        },
        perikanan: {
            label: 'Perikanan',
            className: 'bg-cyan-600 text-white',
        },

        transportasi: {
            label: 'Transportasi & Logistik',
            className: 'bg-indigo-600 text-white',
        },
        pariwisata: {
            label: 'Pariwisata',
            className: 'bg-pink-600 text-white',
        },
        kesehatan: {
            label: 'Kesehatan',
            className: 'bg-red-600 text-white',
        },
        pendidikan: {
            label: 'Pendidikan',
            className: 'bg-violet-600 text-white',
        },

        teknologi: {
            label: 'Teknologi Informasi',
            className: 'bg-sky-600 text-white',
        },
        media: {
            label: 'Media & Kreatif',
            className: 'bg-fuchsia-600 text-white',
        },
        keuangan: {
            label: 'Keuangan',
            className: 'bg-amber-600 text-slate-900',
        },
        properti: {
            label: 'Properti & Real Estate',
            className: 'bg-stone-600 text-white',
        },

        industri_kreatif: {
            label: 'Industri Kreatif',
            className: 'bg-purple-600 text-white',
        },
        umkm: {
            label: 'UMKM',
            className: 'bg-teal-600 text-white',
        },

        lainnya: {
            label: 'Lainnya',
            className: 'bg-muted text-muted-foreground',
        },
    };

    const statusLegalMap: Record<
        string,
        {
            label: string;
            className: string;
        }
    > = {
        pt: {
            label: 'Perseroan Terbatas (PT)',
            className: 'bg-indigo-600 text-white',
        },
        cv: {
            label: 'Commanditaire Vennootschap (CV)',
            className: 'bg-sky-600 text-white',
        },
        firma: {
            label: 'Firma',
            className: 'bg-emerald-600 text-white',
        },
        koperasi: {
            label: 'Koperasi',
            className: 'bg-lime-600 text-slate-900',
        },
        yayasan: {
            label: 'Yayasan',
            className: 'bg-violet-600 text-white',
        },
        perorangan: {
            label: 'Usaha Perorangan',
            className: 'bg-amber-600 text-slate-900',
        },
        umkm: {
            label: 'UMKM',
            className: 'bg-teal-600 text-white',
        },
        bumn: {
            label: 'BUMN',
            className: 'bg-red-600 text-white',
        },
        bumd: {
            label: 'BUMD',
            className: 'bg-rose-600 text-white',
        },
        lainnya: {
            label: 'Lainnya',
            className: 'bg-muted text-muted-foreground',
        },
    };

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

                return (
                    <div className="grid w-100 grid-cols-[90px_1fr] gap-x-2 gap-y-2 text-sm">
                        <span className="col-span-2 text-xs font-bold text-muted-foreground">Kontak</span>

                        <span className="text-xs font-medium text-muted-foreground">No Telepon</span>
                        <span>{phone || '-'}</span>

                        <span className="text-xs font-medium text-muted-foreground">Email</span>
                        <span>{email || '-'}</span>

                        <span className="col-span-2 mt-4 text-xs font-bold text-muted-foreground">Alamat</span>

                        <span className="text-xs font-medium text-muted-foreground">Alamat Lengkap</span>
                        <span className="whitespace-normal">{address || '-'}</span>

                        <span className="text-xs font-medium text-muted-foreground">Kota</span>
                        <span>{city || '-'}</span>

                        <span className="text-xs font-medium text-muted-foreground">Provinsi</span>
                        <span>{province || '-'}</span>

                        <span className="text-xs font-medium text-muted-foreground">Kode Pos</span>
                        <span>{postal_code || '-'}</span>
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

                const status = statusKey ? statusLegalMap[statusKey] : null;
                const category = categoryKey ? categoryBusinessMap[categoryKey] : null;

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
