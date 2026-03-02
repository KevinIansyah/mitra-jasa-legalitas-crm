import { router } from '@inertiajs/react';
import { AlertTriangle, ArrowDown, ArrowUp, ChevronDown, Download, FileCheck, Lock, Pencil, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { formatDate, formatFileSize } from '@/lib/utils';
import projects from '@/routes/projects';
import { DOCUMENT_STATUS_ICONS, DOCUMENT_STATUSES, DOCUMENT_STATUSES_MAP, UNDELETABLE_DOCUMENT_STATUSES, type DocumentStatus, type ProjectDocument } from '@/types/project';
import { DocumentForm } from './document-form';

export type DocumentStatusMeta = {
    label: string;
    classes: string;
};

type DocumentCardProps = {
    document: ProjectDocument;
    index: number;
    projectId: number;
    isFirst: boolean;
    isLast: boolean;
    onReorderUp: () => void;
    onReorderDown: () => void;
    onUpload: () => void;
    canApproveDocuments?: boolean;
};

export function DocumentCard({ document, index, projectId, isFirst, isLast, onReorderUp, onReorderDown, onUpload }: DocumentCardProps) {
    const [mode, setMode] = useState<'view' | 'edit'>('view');
    const [confirmStatus, setConfirmStatus] = useState<DocumentStatus | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [confirmEncrypt, setConfirmEncrypt] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);

    const status = DOCUMENT_STATUSES_MAP[document.status];
    const icon = DOCUMENT_STATUS_ICONS[document.status];
    const targetStatus = confirmStatus ? DOCUMENT_STATUSES_MAP[confirmStatus] : null;
    const canDelete = !UNDELETABLE_DOCUMENT_STATUSES.includes(document.status);
    const hasFile = !!document.file_path;

    const isVerified = document.status === 'verified';
    const isRejected = document.status === 'rejected';
    const isPendingReview = document.status === 'pending_review';
    const isUploaded = document.status === 'uploaded';

    function handleView() {
        if (!document.file_path) return;
        window.open(
            projects.documents.view({
                project: document.project_id,
                document: document.id,
                filename: document.name,
            }).url,
            '_blank',
            'noopener,noreferrer',
        );
    }

    function handleDownload() {
        if (!document.file_path) return;
        window.location.href = projects.documents.download({ project: projectId, document: document.id }).url;
    }

    function handleStatusConfirm() {
        if (!confirmStatus) return;
        const isRejecting = confirmStatus === 'rejected';
        setConfirmStatus(null);
        setLoading(true);

        const toastId = toast.loading('Memproses...', { description: 'Status dokumen sedang diperbarui.' });

        router.patch(
            projects.documents.updateStatus({ project: projectId, document: document.id }).url,
            {
                status: confirmStatus,
                ...(isRejecting ? { rejection_reason: rejectionReason } : {}),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Status dokumen berhasil diperbarui.' });
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui status, coba lagi.';
                    toast.error('Gagal', { description: String(msg) });
                },
                onFinish: () => {
                    setLoading(false);
                    setRejectionReason('');
                    toast.dismiss(toastId);
                },
            },
        );
    }

    function handleEncryptConfirm() {
        if (confirmEncrypt === null) return;
        setConfirmEncrypt(null);
        setLoading(true);

        const toastId = toast.loading('Memproses...', { description: 'Mengubah enkripsi dokumen.' });

        router.patch(
            projects.documents.updateEncrypt({ project: projectId, document: document.id }).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success('Berhasil', {
                        description: document.is_encrypted ? 'Enkripsi dokumen berhasil dinonaktifkan.' : 'Enkripsi dokumen berhasil diaktifkan.',
                    }),
                onError: (errors) => {
                    const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui enkripsi, coba lagi.';
                    toast.error('Gagal', { description: String(msg) });
                },
                onFinish: () => {
                    setLoading(false);
                    toast.dismiss(toastId);
                },
            },
        );
    }

    return (
        <>
            <div className="flex gap-4">
                <div className="flex flex-col items-center">
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            isVerified
                                ? 'bg-emerald-500/10'
                                : isRejected
                                  ? 'bg-red-500/10'
                                  : isPendingReview
                                    ? 'bg-yellow-500/10'
                                    : isUploaded
                                      ? 'bg-blue-600/10'
                                      : 'bg-secondary/10'
                        }`}
                    >
                        {icon}
                    </div>
                    {!isLast && <div className="w-px flex-1 bg-border" />}
                </div>

                {/* Content */}
                <div className={`${!isLast ? 'mb-4' : ''} flex-1`}>
                    {mode === 'edit' ? (
                        <DocumentForm
                            initial={{
                                project_id: projectId,
                                name: document.name,
                                description: document.description ?? '',
                                document_format: document.document_format ?? 'pdf',
                                is_required: document.is_required,
                                notes: document.notes ?? '',
                            }}
                            submitUrl={projects.documents.update({ project: projectId, document: document.id }).url}
                            method="put"
                            onSuccess={() => setMode('view')}
                            onCancel={() => setMode('view')}
                        />
                    ) : (
                        <div className="space-y-4 rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                            {/* Header */}
                            <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
                                <div className="order-2 space-y-2 lg:order-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-muted-foreground">#{index + 1}</span>
                                        <h3 className="font-semibold">{document.name}</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {document.is_required && <Badge variant="destructive">Wajib</Badge>}
                                        {document.is_encrypted && <Badge variant="secondary">Terenkripsi</Badge>}
                                    </div>
                                </div>

                                <div className="order-1 flex shrink-0 flex-wrap items-center gap-1 lg:order-2">
                                    <HasPermission permission="edit-project-documents">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="secondary" className="h-8 w-8" disabled={isFirst || loading} onClick={onReorderUp}>
                                                    <ArrowUp className="size-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Naikkan Urutan</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="secondary" className="h-8 w-8" disabled={isLast || loading} onClick={onReorderDown}>
                                                    <ArrowDown className="size-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Turunkan Urutan</TooltipContent>
                                        </Tooltip>
                                    </HasPermission>

                                    <HasPermission permission="view-project-documents">
                                        {hasFile && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="secondary" className="h-8 w-8" onClick={handleView}>
                                                        <FileCheck className="size-3.5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Lihat Dokumen</TooltipContent>
                                            </Tooltip>
                                        )}

                                        {hasFile && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="secondary" className="h-8 w-8" onClick={handleDownload}>
                                                        <Download className="size-3.5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Unduh Dokumen</TooltipContent>
                                            </Tooltip>
                                        )}
                                    </HasPermission>

                                    <HasPermission permission="edit-project-documents">
                                        {!isVerified && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="secondary" className="h-8 w-8" disabled={loading} onClick={onUpload}>
                                                        <Upload className="size-3.5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>{hasFile ? 'Ganti File' : 'Unggah Dokumen'}</TooltipContent>
                                            </Tooltip>
                                        )}

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="secondary" className="h-8 w-8" disabled={loading} onClick={() => setMode('edit')}>
                                                    <Pencil className="size-3.5" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit Dokumen</TooltipContent>
                                        </Tooltip>
                                    </HasPermission>

                                    <HasPermission permission="delete-project-documents">
                                        <DialogDelete
                                            description={`Tindakan ini tidak dapat dibatalkan. Data dokumen "${document.name}" akan dihapus secara permanen dari sistem.`}
                                            deleteUrl={projects.documents.destroy({ project: projectId, document: document.id }).url}
                                            tooltipText="Hapus Dokumen"
                                            isDisabled={loading || !canDelete}
                                        />
                                    </HasPermission>

                                    {/* Status dropdown */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button>
                                                <Badge className={`${status?.classes} px-3 py-1`}>
                                                    {status?.label}
                                                    {document.status !== 'verified' && document.status !== 'rejected' && (
                                                        <HasPermission permission="edit-project-documents">
                                                            <ChevronDown className="size-3" />
                                                        </HasPermission>
                                                    )}
                                                </Badge>
                                            </button>
                                        </DropdownMenuTrigger>
                                        {document.status !== 'verified' && document.status !== 'rejected' && (
                                            <HasPermission permission="edit-project-documents">
                                                <DropdownMenuContent align="end">
                                                    {DOCUMENT_STATUSES.map((status) => (
                                                        <DropdownMenuItem
                                                            key={status.value}
                                                            disabled={!hasFile || status.value === document.status || (isPendingReview && status.value === 'not_uploaded')}
                                                            onSelect={() => setConfirmStatus(status.value as DocumentStatus)}
                                                        >
                                                            <span className={`mr-2 inline-block h-2 w-2 rounded-full ${status.classes}`} />
                                                            {status.label}
                                                        </DropdownMenuItem>
                                                    ))}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem disabled={isPendingReview} onSelect={() => setConfirmEncrypt(!document.is_encrypted)}>
                                                        <Lock className="size-3.5 text-current" />
                                                        {document.is_encrypted ? 'Nonaktifkan Enkripsi' : 'Aktifkan Enkripsi'}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </HasPermission>
                                        )}
                                    </DropdownMenu>
                                </div>
                            </div>

                            {document.description && <p className="text-sm text-muted-foreground">{document.description}</p>}

                            {/* Details */}
                            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Format</p>
                                    <p className="uppercase">{document.document_format ?? '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Ukuran File</p>
                                    <p>{document.file_size ? formatFileSize(document.file_size) : '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Diunggah</p>
                                    <p>{document.uploaded_at ? formatDate(document.uploaded_at) : '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Diverifikasi</p>
                                    <p>{document.verified_at ? formatDate(document.verified_at) : '-'}</p>
                                </div>
                            </div>

                            {((document.status === 'rejected' && document.rejection_reason) || document.notes) && <hr className="my-4" />}

                            {/* Rejection reason */}
                            {document.status === 'rejected' && document.rejection_reason && (
                                <Alert className="border-destructive bg-destructive/10 text-destructive">
                                    <AlertTriangle />
                                    <AlertTitle>Alasan Penolakan:</AlertTitle>
                                    <AlertDescription>{document.rejection_reason}</AlertDescription>
                                </Alert>
                            )}

                            {/* Notes */}
                            {document.notes && (
                                <div className="text-xs text-foreground">
                                    <span className="text-muted-foreground">Catatan: </span>
                                    {document.notes}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Status Modal */}
            <Dialog
                open={!!confirmStatus}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmStatus(null);
                        setRejectionReason('');
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ubah Status Dokumen</DialogTitle>
                        <DialogDescription asChild>
                            <div className="space-y-1">
                                <p>
                                    Anda akan mengubah status <span className="font-medium text-foreground">"{document.name}"</span> menjadi:
                                </p>
                                <Badge className={targetStatus?.classes ?? 'bg-muted text-muted-foreground'}>{targetStatus?.label}</Badge>
                            </div>
                        </DialogDescription>
                    </DialogHeader>

                    {confirmStatus === 'rejected' && (
                        <div className="space-y-2">
                            <Label htmlFor="rejection_reason" className="text-sm font-medium">
                                Alasan Penolakan <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="rejection_reason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Jelaskan alasan dokumen ini ditolak..."
                                className="min-h-24 resize-none"
                                rows={3}
                            />
                            <p className="text-xs text-muted-foreground">Alasan ini akan ditampilkan kepada pemilik dokumen.</p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setConfirmStatus(null);
                                setRejectionReason('');
                            }}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleStatusConfirm}
                            disabled={confirmStatus === 'rejected' && !rejectionReason.trim()}
                            variant={confirmStatus === 'rejected' ? 'destructive' : 'default'}
                        >
                            Ya, Ubah Status
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Encrypt Modal */}
            <Dialog open={confirmEncrypt !== null} onOpenChange={() => setConfirmEncrypt(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{confirmEncrypt ? 'Aktifkan Enkripsi' : 'Nonaktifkan Enkripsi'}</DialogTitle>
                        <DialogDescription>
                            Anda akan {confirmEncrypt ? 'mengaktifkan' : 'menonaktifkan'} enkripsi pada dokumen
                            <span className="font-medium text-foreground">"{document.name}"</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setConfirmEncrypt(null)}>
                            Batal
                        </Button>
                        <Button onClick={handleEncryptConfirm}>Ya, {confirmEncrypt ? 'Aktifkan' : 'Nonaktifkan'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
