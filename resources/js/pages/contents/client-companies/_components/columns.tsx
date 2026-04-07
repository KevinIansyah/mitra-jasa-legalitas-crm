import type { ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';

import type { ClientCompany } from '@/types/contents';
import Actions from './actions';

const R2_PUBLIC_URL = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL;

export default function getColumns(): ColumnDef<ClientCompany>[] {
    return [
        {
            accessorKey: 'logo',
            header: 'Logo',
            cell: ({ row }) => {
                const path = row.original.logo;
                if (!path) {
                    return <span>{'-'}</span>;
                }

                return (
                    <div className="flex h-12 w-28 items-center justify-center">
                        <img src={`${R2_PUBLIC_URL}/${path}`} alt={row.original.name} className="max-h-10 max-w-full object-contain" loading="lazy" />
                    </div>
                );
            },
        },
        {
            accessorKey: 'name',
            header: 'Nama perusahaan',
            cell: ({ row }) => <span className="text-sm font-medium">{row.original.name}</span>,
        },
        {
            accessorKey: 'is_published',
            header: 'Publikasi',
            cell: ({ row }) => {
                const isPublished = row.getValue<boolean>('is_published');
                return isPublished ? <Badge className="bg-emerald-500 text-white">Published</Badge> : <Badge className="bg-slate-500 text-white">Draft</Badge>;
            },
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => <Actions clientCompany={row.original} />,
        },
    ];
}
