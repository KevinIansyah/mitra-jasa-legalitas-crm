import { router } from '@inertiajs/react';
import { Download, FileArchive, FileCheck, FileSpreadsheet, FileText, FileType, Image, Pencil } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { formatDate, formatFileSize } from '@/lib/utils';
import projects from '@/routes/projects';
import type { ProjectDeliverable } from '@/types/projects';
import { DeliverableEditForm } from './deliverable-edit-form';

function FileIcon({ fileType }: { fileType: string }) {
    let icon = <FileText className="size-5 text-muted-foreground" />;
    let bg = 'bg-muted/10';

    if (fileType.startsWith('image/')) {
        icon = <Image className="size-5 text-sky-500" />;
        bg = 'bg-sky-500/10';
    } else if (fileType === 'application/pdf') {
        icon = <FileText className="size-5 text-red-500" />;
        bg = 'bg-red-500/10';
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
        icon = <FileSpreadsheet className="size-5 text-emerald-500" />;
        bg = 'bg-emerald-500/10';
    } else if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('archive')) {
        icon = <FileArchive className="size-5 text-amber-500" />;
        bg = 'bg-amber-500/10';
    } else if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
        icon = <FileType className="size-5 text-violet-500" />;
        bg = 'bg-violet-500/10';
    } else {
        icon = <FileText className="size-5 text-slate-500" />;
        bg = 'bg-slate-500/10';
    }

    return <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>{icon}</div>;
}

type EditData = {
    name: string;
    description: string;
    version: string;
    notes: string;
    is_final: boolean;
};

type DeliverableCardProps = {
    deliverable: ProjectDeliverable;
    projectId: number;
};

export function DeliverableCard({ deliverable, projectId }: DeliverableCardProps) {
    const [mode, setMode] = useState<'view' | 'edit'>('view');
    const [loading, setLoading] = useState(false);

    const [editData, setEditData] = useState<EditData>({
        name: deliverable.name,
        description: deliverable.description ?? '',
        version: deliverable.version ?? '',
        notes: deliverable.notes ?? '',
        is_final: deliverable.is_final,
    });
    const set = (val: Partial<EditData>) => setEditData((prev) => ({ ...prev, ...val }));

    function handleView() {
        if (!deliverable.file_path) return;
        window.open(
            projects.deliverables.view({
                project: deliverable.project_id,
                deliverable: deliverable.id,
                filename: deliverable.name,
            }).url,
            '_blank',
            'noopener,noreferrer',
        );
    }

    function handleDownload() {
        window.location.href = projects.deliverables.download({ project: projectId, deliverable: deliverable.id }).url;
    }

    function handleEditSubmit() {
        if (!editData.name.trim()) return;
        setLoading(true);

        const toastId = toast.loading('Memproses...', { description: 'Data hasil akhir sedang diperbarui.' });

        router.patch(projects.deliverables.update({ project: projectId, deliverable: deliverable.id }).url, editData, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', { description: 'Hasil akhir berhasil diperbarui.' });
                setMode('view');
            },
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui hasil akhir, coba lagi.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => {
                setLoading(false);
                toast.dismiss(toastId);
            },
        });
    }

    return (
        <div className="rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
            {mode === 'edit' ? (
                <DeliverableEditForm id={deliverable.id} data={editData} loading={loading} onChange={set} onSubmit={handleEditSubmit} onCancel={() => setMode('view')} />
            ) : (
                <div className="space-y-4">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="order-2 flex items-start gap-3 lg:order-1">
                            <FileIcon fileType={deliverable.file_type} />
                            <div className="space-y-4">
                                <span className="font-semibold">{deliverable.name}</span>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    {deliverable.version && <Badge className="bg-blue-600 text-white">{deliverable.version}</Badge>}
                                    {deliverable.is_final && <Badge className="bg-emerald-500 text-white">Final</Badge>}
                                    {deliverable.is_encrypted && <Badge variant="secondary">Terenkripsi</Badge>}
                                </div>
                            </div>
                        </div>

                        <div className="order-1 flex shrink-0 items-center gap-1 lg:order-2">
                            <HasPermission permission="view-project-deliverables">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="secondary" className="h-8 w-8" onClick={handleView}>
                                            <FileCheck className="size-3.5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Lihat File</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="secondary" className="h-8 w-8" onClick={handleDownload}>
                                            <Download className="size-3.5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Unduh File</TooltipContent>
                                </Tooltip>
                            </HasPermission>

                            <HasPermission permission="edit-project-deliverables">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="secondary" className="h-8 w-8" disabled={loading} onClick={() => setMode('edit')}>
                                            <Pencil className="size-3.5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit Hasil Akhir</TooltipContent>
                                </Tooltip>
                            </HasPermission>

                            <HasPermission permission="delete-project-deliverables">
                                <DialogDelete
                                    description={`Tindakan ini tidak dapat dibatalkan. Data hasil akhir "${deliverable.name}" akan dihapus secara permanen dari sistem.`}
                                    deleteUrl={projects.deliverables.destroy({ project: projectId, deliverable: deliverable.id }).url}
                                    tooltipText="Hapus Hasil Akhir"
                                    isDisabled={loading}
                                />
                            </HasPermission>
                        </div>
                    </div>

                    {deliverable.description && <p className="text-sm whitespace-normal text-muted-foreground">{deliverable.description}</p>}

                    <hr />

                    <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Format</p>
                            <p className="uppercase">{deliverable.file_type ? deliverable.file_type.split('/').pop() : '-'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Ukuran File</p>
                            <p>{formatFileSize(deliverable.file_size) ? formatFileSize(deliverable.file_size) : '-'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Diunggah</p>
                            <p>{deliverable.uploaded_at ? formatDate(deliverable.uploaded_at) : '-'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Oleh</p>
                            <p>{deliverable.uploader ? deliverable.uploader.name : '-'}</p>
                        </div>
                    </div>

                    {deliverable.notes && (
                        <div className="space-y-1 text-sm whitespace-normal text-foreground">
                            <p className="text-xs text-muted-foreground">Catatan</p>
                            <p>{deliverable.notes}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
