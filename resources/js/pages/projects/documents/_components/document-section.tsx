import { File, FileCheck, FileClock, FileX } from 'lucide-react';
import { useState } from 'react';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Paginator } from '@/types/paginator';
import type { ProjectDocument, ProjectDocumentSummary } from '@/types/projects';
import { DataTable } from './datatable';

interface DocumentSectionProps {
    documents: Paginator<ProjectDocument>;
    summary: ProjectDocumentSummary;
    filters: { search?: string };
}

export function DocumentSection({ documents, summary, filters }: DocumentSectionProps) {
    const { data, current_page, last_page, per_page, total } = documents;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS = [
        {
            label: 'Total Dokumen',
            value: summary.total,
            badge: 'bg-slate-500 text-white',
            icon: <File className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Semua dokumen project</p>
                    <p className="text-muted-foreground">Dari seluruh project aktif</p>
                </>
            ),
        },
        {
            label: 'Terverifikasi',
            value: summary.verified,
            badge: 'bg-emerald-500 text-white',
            icon: <FileCheck className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Dokumen telah diverifikasi</p>
                    <p className="text-muted-foreground">{summary.pending_review} menunggu review</p>
                </>
            ),
        },
        {
            label: 'Menunggu Review',
            value: summary.pending_review,
            badge: 'bg-yellow-500 text-white',
            icon: <FileClock className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Dokumen sudah diunggah</p>
                    <p className="text-muted-foreground">Belum dikonfirmasi verifikator</p>
                </>
            ),
        },
        {
            label: 'Ditolak / Belum Upload',
            value: Number(summary.rejected) + Number(summary.not_uploaded),
            badge: 'bg-red-500 text-white',
            icon: <FileX className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">
                        {summary.rejected} ditolak · {summary.not_uploaded} belum diunggah
                    </p>
                    <p className="text-muted-foreground">Perlu tindak lanjut</p>
                </>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:border-none *:data-[slot=card]:bg-sidebar *:data-[slot=card]:shadow md:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:dark:shadow-none">
                {STATS.map(({ label, value, badge, icon, footer }) => (
                    <Card key={label}>
                        <CardHeader>
                            <CardDescription>{label}</CardDescription>
                            <CardTitle className="text-3xl font-semibold tabular-nums">{value}</CardTitle>
                            <CardAction>
                                <div className={`rounded-full px-3 py-1 ${badge}`}>{icon}</div>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start text-sm">{footer}</CardFooter>
                    </Card>
                ))}
            </div>

            <div className="w-full rounded-xl bg-sidebar p-4">
                <DataTable data={data} pageIndex={pageIndex} setPageIndex={setPageIndex} totalPages={last_page} totalItems={total} perPage={per_page} initialFilters={filters} />
            </div>
        </div>
    );
}
