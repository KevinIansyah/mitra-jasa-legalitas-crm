import { router } from '@inertiajs/react';
import { FilePlus, Pencil, Trash } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { formatSize, readImageAsDataURL, validateFile, validateImageFile } from '@/lib/service';
import projects from '@/routes/projects';

const DELIVERABLE_MAX_FILE_SIZE = 50 * 1024 * 1024;

export type DeliverableFormData = {
    project_id: number;
    name: string;
    description: string;
    version: string;
    notes: string;
    is_final: boolean;
    is_encrypted: boolean;
    file: File | null;
};

type DeliverableAddFormProps = {
    projectId: number;
    onSuccess: () => void;
    onCancel: () => void;
};

export function DeliverableAddForm({ projectId, onSuccess, onCancel }: DeliverableAddFormProps) {
    const [data, setData] = React.useState<DeliverableFormData>({
        project_id: projectId,
        name: '',
        description: '',
        version: '',
        notes: '',
        is_final: false,
        is_encrypted: false,
        file: null,
    });
    const [filePreview, setFilePreview] = React.useState<{
        src?: string;
        name: string;
        size: number;
        isImage: boolean;
    } | null>(null);
    const [fileError, setFileError] = React.useState<string | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [imgLoading, setImgLoading] = React.useState(true);
    const [processing, setProcessing] = React.useState(false);

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const set = (val: Partial<DeliverableFormData>) => setData((prev) => ({ ...prev, ...val }));

    const handleFile = React.useCallback(
        async (picked: File | undefined) => {
            if (!picked) return;

            const isImage = picked.type.startsWith('image/');
            const error = isImage ? validateImageFile(picked, DELIVERABLE_MAX_FILE_SIZE) : validateFile(picked, DELIVERABLE_MAX_FILE_SIZE);

            if (error) {
                setFileError(error);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            setFileError(null);
            set({ file: picked, name: data.name || picked.name.replace(/\.[^/.]+$/, '') });

            if (isImage) {
                const preview = await readImageAsDataURL(picked);
                setFilePreview({ src: preview, name: picked.name, size: picked.size, isImage: true });
            } else {
                setFilePreview({ name: picked.name, size: picked.size, isImage: false });
            }
        },
        [data.name],
    );

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
        setFilePreview(null);
        setFileError(null);
        set({ file: null });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    function handleSubmit() {
        if (!data.file) {
            setFileError('File wajib diunggah.');
            return;
        }
        if (!data.name.trim()) return;

        setProcessing(true);
        const toastId = toast.loading('Mengunggah...', { description: 'Hasil akhir sedang diunggah.' });

        router.post(
            projects.deliverables.store(projectId).url,
            { ...data },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Hasil akhir berhasil diunggah.' });
                    onSuccess();
                },
                onError: (errors) => {
                    const msg = errors.file ?? errors.name ?? 'Terjadi kesalahan saat mengunggah hasil akhir, coba lagi.';
                    toast.error('Gagal', { description: msg });
                    if (errors.file) setFileError(errors.file);
                },
                onFinish: () => {
                    setProcessing(false);
                    toast.dismiss(toastId);
                },
            },
        );
    }

    return (
        <div className="space-y-4 rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
            {/* Is final & encrypted */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg border border-primary bg-transparent dark:bg-input/30 p-3">
                    <Switch id="is_final" checked={data.is_final} onCheckedChange={(v) => set({ is_final: v })} />
                    <div>
                        <Label htmlFor="is_final" className="cursor-pointer text-sm font-medium">
                            Versi Final
                        </Label>
                        <p className="text-sm text-muted-foreground">{data.is_final ? 'Ini adalah versi final' : 'Ini masih draft / revisi'}</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-primary bg-transparent dark:bg-input/30 p-3">
                    <Switch id="is_encrypted" checked={data.is_encrypted} onCheckedChange={(v) => set({ is_encrypted: v })} />
                    <div>
                        <Label htmlFor="is_encrypted" className="cursor-pointer text-sm font-medium">
                            Enkripsi File
                        </Label>
                        <p className="text-sm text-muted-foreground">{data.is_encrypted ? 'File akan dienkripsi' : 'File tidak dienkripsi'}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Name */}
                <Field className="md:col-span-2">
                    <FieldLabel>
                        Nama <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input value={data.name} onChange={(e) => set({ name: e.target.value })} placeholder="Contoh: Akta Pendirian CV" />
                </Field>

                <Field>
                    <FieldLabel>Versi</FieldLabel>
                    <Input value={data.version} onChange={(e) => set({ version: e.target.value })} placeholder="Contoh: v1.0" />
                </Field>

                {/* Description */}
                <Field className="md:col-span-3">
                    <FieldLabel>Deskripsi</FieldLabel>
                    <Textarea
                        value={data.description}
                        onChange={(e) => set({ description: e.target.value })}
                        placeholder="Jelaskan detail hasil akhir ini"
                        className="min-h-24 resize-none"
                        rows={2}
                    />
                </Field>

                {/* Notes */}
                <Field className="md:col-span-3">
                    <FieldLabel>Catatan</FieldLabel>
                    <Textarea
                        value={data.notes}
                        onChange={(e) => set({ notes: e.target.value })}
                        placeholder="Catatan tambahan (opsional)"
                        className="min-h-24 resize-none"
                        rows={2}
                    />
                </Field>
            </div>

            {/* File upload */}
            <div className="space-y-2">
                <FieldLabel>
                    File <span className="text-destructive">*</span>
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
                                'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors select-none',
                                fileError
                                    ? 'border-destructive bg-destructive/5'
                                    : isDragging
                                      ? 'border-primary bg-primary/10'
                                      : 'border-border hover:border-primary hover:bg-muted/40',
                            ].join(' ')}
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                <FilePlus className="size-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">{isDragging ? 'Lepaskan untuk mengunggah!' : 'Seret & lepas file di sini'}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    atau <span className="text-primary underline underline-offset-2">klik untuk memilih</span> dari perangkat Anda
                                </p>
                            </div>
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                JPG · PNG · PDF · DOC · XLS · PPT · ZIP · Maks. 50 MB
                            </span>
                        </div>
                        {fileError && <FieldError>{fileError}</FieldError>}
                    </>
                ) : (
                    <div className="space-y-2">
                        {filePreview.isImage && filePreview.src && (
                            <div className="relative">
                                {imgLoading && <Skeleton className="aspect-video w-full rounded-lg" />}
                                <img
                                    src={filePreview.src}
                                    alt={filePreview.name}
                                    onLoad={() => setImgLoading(false)}
                                    onError={() => setImgLoading(false)}
                                    className={`aspect-video w-full rounded-lg border border-border object-cover ${imgLoading ? 'hidden' : 'block'}`}
                                />
                            </div>
                        )}
                        <div className="flex items-center gap-3 rounded-lg border border-primary bg-input/30 px-3 py-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                <FilePlus className="size-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{filePreview.name}</p>
                                <p className="text-xs text-muted-foreground">{formatSize(filePreview.size)}</p>
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
                                        <Button type="button" variant="destructive" size="sm" className="h-8 w-8" onClick={handleRemoveFile}>
                                            <Trash className="size-3.5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Hapus File</TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                <Button type="button" disabled={processing || !data.name.trim() || !data.file} onClick={handleSubmit}>
                    {processing ? (
                        <>
                            <Spinner className="mr-2" />
                            Menyimpan...
                        </>
                    ) : (
                        'Simpan'
                    )}
                </Button>
                <Button type="button" variant="secondary" onClick={onCancel} disabled={processing}>
                    Batal
                </Button>
            </div>
        </div>
    );
}
