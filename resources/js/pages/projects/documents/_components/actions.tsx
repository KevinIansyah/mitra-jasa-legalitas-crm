import { router } from '@inertiajs/react';
import { ArrowDownToLine, ArrowUpToLine, ChevronDown, ChevronUp, FileCheck, Lock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import type { DocumentStatus } from '@/types/projects';
import { DOCUMENT_STATUSES, DOCUMENT_STATUSES_MAP, UNDELETABLE_DOCUMENT_STATUSES, type ProjectDocument } from '@/types/projects';
import { DocumentUploadDrawer } from '../../detail/documents/_components/document-upload-drawer';
import projects from '@/routes/projects';

type ActionsProps = {
    document: ProjectDocument;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
};

export default function Actions({ document, isExpanded, onToggleExpand }: ActionsProps) {
    const [confirmStatus, setConfirmStatus] = useState<DocumentStatus | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [confirmEncrypt, setConfirmEncrypt] = useState<boolean | null>(null);
    const [uploadingDocument, setUploadingDocument] = useState<ProjectDocument | null>(null);
    const [loading, setLoading] = useState(false);

    const status = DOCUMENT_STATUSES_MAP[document.status];
    const targetStatus = confirmStatus ? DOCUMENT_STATUSES_MAP[confirmStatus] : null;
    const canDelete = !UNDELETABLE_DOCUMENT_STATUSES.includes(document.status);
    const hasFile = !!document.file_path;
    const isVerified = document.status === 'verified';
    const isPendingReview = document.status === 'pending_review';

    function handleView() {
        if (!document.file_path) return;
        window.open(
            projects.documents.view({
                project: document.project_id,
                document: document.id,
            }).url,
            '_blank',
            'noopener,noreferrer',
        );
    }

    function handleDownload() {
        if (!document.file_path) return;
        window.location.href = projects.documents.download({ project: document.project_id, document: document.id }).url;
    }

    function handleStatusConfirm() {
        if (!confirmStatus) return;
        const isRejecting = confirmStatus === 'rejected';
        setConfirmStatus(null);
        setLoading(true);

        const toastId = toast.loading('Memproses...', { description: 'Status dokumen sedang diperbarui.' });

        router.patch(
            projects.documents.updateStatus({ project: document.project_id, document: document.id }).url,
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
            projects.documents.updateEncrypt({ project: document.project_id, document: document.id }).url,
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
            <div className="flex items-center gap-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="secondary" className="h-8 w-8" onClick={onToggleExpand}>
                            {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isExpanded ? 'Tutup Detail' : 'Lihat Detail'}</TooltipContent>
                </Tooltip>

                <HasPermission permission="view-project-documents">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" className="h-8 w-8" disabled={!hasFile || document.is_encrypted} onClick={handleView}>
                                <FileCheck className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Lihat Dokumen</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" className="h-8 w-8" disabled={!hasFile} onClick={handleDownload}>
                                <ArrowDownToLine className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Unduh Dokumen</TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="edit-project-documents">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" className="h-8 w-8" disabled={loading || isVerified} onClick={() => setUploadingDocument(document)}>
                                <ArrowUpToLine className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{hasFile ? 'Ganti File' : 'Unggah Dokumen'}</TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="delete-project-documents">
                    <DialogDelete
                        description={`Tindakan ini tidak dapat dibatalkan. Data dokumen "${document.name}" akan dihapus secara permanen dari sistem.`}
                        deleteUrl={projects.documents.destroy({ project: document.project_id, document: document.id }).url}
                        tooltipText="Hapus Dokumen"
                        isDisabled={loading || !canDelete}
                    />
                </HasPermission>

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

            {/* ───────────────── Dialog: Confirm Status ───────────────── */}
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

            {/* ───────────────── Dialog: Confirm Encrypt ───────────────── */}
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

            {uploadingDocument && (
                <DocumentUploadDrawer
                    projectId={document.project_id}
                    document={uploadingDocument}
                    open={!!uploadingDocument}
                    onOpenChange={(open) => {
                        if (!open) setUploadingDocument(null);
                    }}
                />
            )}
        </>
    );
}
