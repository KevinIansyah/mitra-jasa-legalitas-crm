import type { ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';

import { CONTENT_STATUSES_MAP, type ServiceCityPage } from '@/types/services';
import { Actions } from './actions';

export default function getColumns(): ColumnDef<ServiceCityPage>[] {
    return [
        {
            accessorKey: 'service',
            header: 'Layanan',
            cell: ({ row }) => {
                const { heading, slug } = row.original;
                return (
                    <div className="space-y-0.5">
                        <p className="text-sm">{heading || '-'}</p>
                        <p className="text-xs text-muted-foreground">{slug || '-'}</p>
                    </div>
                );
            },
        },
        {
            accessorKey: 'city',
            header: 'Kota',
            cell: ({ row }) => {
                const city = row.original.city;
                return city ? (
                    <div>
                        <p className="font-medium">{city.name}</p>
                        {city.province && <p className="text-xs text-muted-foreground">{city.province}</p>}
                    </div>
                ) : (
                    <span>-</span>
                );
            },
        },
        {
            accessorKey: 'content_status',
            header: 'Status Konten',
            cell: ({ row }) => {
                const status = row.getValue<string>('content_status');
                const statusInfo = CONTENT_STATUSES_MAP[status] ?? CONTENT_STATUSES_MAP['draft'];
                return <Badge className={statusInfo.classes}>{statusInfo.label}</Badge>;
            },
        },
        // {
        //     accessorKey: 'is_published',
        //     header: 'Publikasi',
        //     cell: ({ row }) => {
        //         const isPublished = row.getValue<boolean>('is_published');
        //         return isPublished ? <Badge className="bg-emerald-500 text-white">Published</Badge> : <Badge className="bg-slate-500 text-white">Draft</Badge>;
        //     },
        // },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => <Actions cityPage={row.original} />,
        },
    ];
}
