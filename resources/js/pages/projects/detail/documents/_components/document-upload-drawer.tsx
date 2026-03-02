import { router } from '@inertiajs/react';
import { FilePlus, Pencil, Trash } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { FieldError, FieldLabel } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { formatSize, readImageAsDataURL, validateFile, validateImageFile } from '@/lib/service';
import projects from '@/routes/projects';
import type { ProjectDocument } from '@/types/project';

const DOCUMENT_MAX_FILE_SIZE = 20 * 1024 * 1024;

type DocumentUploadDrawerProps = {
    projectId: number;
    document: ProjectDocument;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function DocumentUploadDrawer({ projectId, document, open, onOpenChange }: DocumentUploadDrawerProps) {
    const [file, setFile] = React.useState<File | null>(null);
    const [filePreview, setFilePreview] = React.useState<{
        src?: string;
        name: string;
        size: number;
        isImage: boolean;
    } | null>(
        document.file_path
            ? {
                  name: document.file_path.split('/').pop() ?? 'file',
                  size: document.file_size ?? 0,
                  isImage: false,
              }
            : null,
    );
    const [fileError, setFileError] = React.useState<string | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [imgLoading, setImgLoading] = React.useState(true);
    const [processing, setProcessing] = React.useState(false);
    const [loadingDelete, setLoadingDelete] = React.useState(false);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (open) {
            setFile(null);
            setFileError(null);
            setIsDragging(false);
            setImgLoading(true);
            setFilePreview(
                document.file_path
                    ? {
                          name: document.file_path.split('/').pop() ?? 'file',
                          size: document.file_size ?? 0,
                          isImage: false,
                      }
                    : null,
            );
        }
    }, [open, document]);

    const handleFile = React.useCallback(async (picked: File | undefined) => {
        if (!picked) return;

        const isImage = picked.type.startsWith('image/');
        const error = isImage ? validateImageFile(picked, DOCUMENT_MAX_FILE_SIZE) : validateFile(picked, DOCUMENT_MAX_FILE_SIZE);

        if (error) {
            setFileError(error);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setFileError(null);
        setFile(picked);

        if (isImage) {
            const preview = await readImageAsDataURL(picked);
            setFilePreview({ src: preview, name: picked.name, size: picked.size, isImage: true });
        } else {
            setFilePreview({ name: picked.name, size: picked.size, isImage: false });
        }
    }, []);

    const handleDragEnter = React.useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = React.useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
    }, []);

    const handleDragOver = (e: React.DragEvent) => e.preventDefault();

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const handleRemoveFile = () => {
        setFile(null);
        setFilePreview(null);
        setFileError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!file) {
            setFileError('File dokumen wajib dipilih.');
            return;
        }

        setProcessing(true);
        const toastId = toast.loading('Mengunggah...', { description: 'Dokumen sedang diunggah ke server.' });

        router.post(
            projects.documents.upload({ project: projectId, document: document.id }).url,
            { file },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Dokumen berhasil diunggah dan menunggu review.' });
                    onOpenChange(false);
                },
                onError: (errors) => {
                    const msg = errors.file ?? 'Terjadi kesalahan saat mengunggah dokumen, coba lagi.';
                    toast.error('Gagal', { description: msg });
                    setFileError(errors.file ?? null);
                },
                onFinish: () => {
                    setProcessing(false);
                    toast.dismiss(toastId);
                },
            },
        );
    };

    const handleDelete = () => {
        if (file) {
            handleRemoveFile();
            return;
        }

        if (!document.file_path) return;

        setLoadingDelete(true);
        const toastId = toast.loading('Menghapus...', { description: 'File sedang dihapus dari server.' });

        router.delete(projects.documents.deleteFile({ project: projectId, document: document.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', { description: 'File berhasil dihapus.' });
                setFilePreview(null);
                setFile(null);
            },
            onError: () => {
                toast.error('Gagal', { description: 'Terjadi kesalahan saat menghapus file.' });
            },
            onFinish: () => {
                setLoadingDelete(false);
                toast.dismiss(toastId);
            },
        });
    };

    return (
        <Drawer direction="bottom" open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="flex h-screen flex-col">
                <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 overflow-y-auto">
                    <DrawerHeader className="px-4">
                        <DrawerTitle>Unggah Dokumen</DrawerTitle>
                        <DrawerDescription>
                            Unggah file untuk dokumen <span className="font-medium text-foreground">"{document.name}"</span>. File akan masuk status{' '}
                            <span className="font-medium text-foreground">Menunggu Review</span> setelah diunggah.
                        </DrawerDescription>
                    </DrawerHeader>

                    <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-4">
                        <div className="space-y-3">
                            <FieldLabel>
                                File Dokumen <span className="text-destructive">*</span>
                            </FieldLabel>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                                className="hidden"
                                onChange={(e) => handleFile(e.target.files?.[0])}
                            />

                            {!filePreview ? (
                                <>
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => fileInputRef.current?.click()}
                                        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                                        onDragEnter={handleDragEnter}
                                        onDragLeave={handleDragLeave}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                        className={[
                                            'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors select-none',
                                            fileError
                                                ? 'border-destructive bg-destructive/5'
                                                : isDragging
                                                  ? 'border-primary bg-primary/10'
                                                  : 'border-border hover:border-primary hover:bg-muted/40',
                                        ].join(' ')}
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                                            <FilePlus className="size-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{isDragging ? 'Lepaskan untuk mengunggah!' : 'Seret & lepas file di sini'}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                atau <span className="text-primary underline underline-offset-2">klik untuk memilih</span> dari perangkat Anda
                                            </p>
                                        </div>
                                        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                            JPG · PNG · PDF · DOC · XLS · PPT · ZIP · Maks. 20 MB
                                        </span>
                                    </div>
                                    {fileError && <FieldError>{fileError}</FieldError>}
                                </>
                            ) : (
                                <div className="relative overflow-visible">
                                    {/* Image preview */}
                                    {filePreview.isImage && filePreview.src && (
                                        <div className="relative mb-2">
                                            {imgLoading && <Skeleton className="aspect-video w-full rounded-lg border border-border" />}
                                            <img
                                                src={filePreview.src}
                                                alt={filePreview.name}
                                                onLoad={() => setImgLoading(false)}
                                                onError={() => setImgLoading(false)}
                                                className={`aspect-video w-full rounded-lg border border-border object-cover ${imgLoading ? 'hidden' : 'block'}`}
                                            />
                                        </div>
                                    )}

                                    {/* File info bar */}
                                    <div className="flex items-center gap-3 rounded-lg border border-primary bg-input/30 px-3 py-2">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                            <FilePlus className="size-4 text-primary" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-foreground">{filePreview.name}</p>
                                            {filePreview.size > 0 && <p className="text-xs text-muted-foreground">{formatSize(filePreview.size)}</p>}
                                        </div>
                                        <div className="space-x-1">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button type="button" variant="secondary" size="sm" className="h-8 w-8" onClick={() => fileInputRef.current?.click()}>
                                                        <Pencil className="size-3.5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Ganti File</TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button type="button" variant="destructive" size="sm" className="h-8 w-8" onClick={handleDelete}>
                                                        {loadingDelete ? <Spinner /> : <Trash className="size-3.5" />}
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Hapus File</TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>

                                    {fileError && <FieldError className="mt-1">{fileError}</FieldError>}
                                </div>
                            )}

                            {/* Document info */}
                            {document.document_format && (
                                <p className="text-xs text-muted-foreground">
                                    Format yang diharapkan: <span className="font-medium text-foreground uppercase">{document.document_format}</span>
                                </p>
                            )}
                            {document.notes && (
                                <p className="text-xs text-muted-foreground">
                                    Catatan: <span className="text-foreground">{document.notes}</span>
                                </p>
                            )}
                        </div>

                        <DrawerFooter className="mt-auto px-0">
                            <Button type="submit" disabled={processing || !file}>
                                {processing ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Mengunggah...
                                    </>
                                ) : (
                                    'Unggah Dokumen'
                                )}
                            </Button>
                            <DrawerClose asChild>
                                <Button variant="secondary" type="button" disabled={processing}>
                                    Batal
                                </Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
