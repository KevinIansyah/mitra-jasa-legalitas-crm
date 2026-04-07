import { useForm } from '@inertiajs/react';
import { FilePlus, ImagePlus, Pencil, Plus, Trash } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { formatSize, readImageAsDataURL, validateImageFile } from '@/lib/service';
import contents from '@/routes/contents';
import type { ClientCompanyFormData } from '@/types/contents';

export function ClientCompanyAddDrawer() {
    const [open, setOpen] = React.useState(false);
    const [filePreview, setFilePreview] = React.useState<{ src?: string; name: string; size: number; isImage: boolean } | null>(null);
    const [imageError, setImageError] = React.useState<string | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<ClientCompanyFormData>({
        name: '',
        logo: null,
        is_published: 1,
    });

    const handleFile = async (file: File | undefined) => {
        if (!file) return;

        const error = validateImageFile(file, 2048 * 1024);
        if (error) {
            setImageError(error);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setImageError(null);
        setData('logo', file);
        const src = await readImageAsDataURL(file);
        setFilePreview({ src, name: file.name, size: file.size, isImage: true });
    };

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
        void handleFile(e.dataTransfer.files[0]);
    };

    const handleRemoveFile = () => {
        setFilePreview(null);
        setImageError(null);
        setData('logo', null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    React.useEffect(() => {
        if (open) {
            reset();
            setFilePreview(null);
            setImageError(null);
            setIsDragging(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            clearErrors();
        }
    }, [open, reset, clearErrors]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const toastId = toast.loading('Menyimpan...', { description: 'Data perusahaan klien sedang ditambahkan.' });

        post(contents.clientCompanies.store.url(), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', { description: 'Perusahaan klien berhasil ditambahkan.' });
                reset();
                setOpen(false);
            },
            onError: () => {
                toast.error('Gagal', { description: 'Terjadi kesalahan saat menyimpan, coba lagi.' });
            },
            onFinish: () => {
                toast.dismiss(toastId);
            },
        });
    }

    return (
        <Drawer direction="bottom" open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button className="flex-1 gap-1.5 md:w-30">
                    <Plus />
                    Tambah
                </Button>
            </DrawerTrigger>

            <DrawerContent className="flex max-h-[95vh] flex-col">
                <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 overflow-y-auto">
                    <DrawerHeader className="px-4">
                        <DrawerTitle>Tambah Logo Klien</DrawerTitle>
                        <DrawerDescription>Nama perusahaan dan logo (opsional, maks. 2MB).</DrawerDescription>
                    </DrawerHeader>

                    <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Field className="col-span-2">
                                <FieldLabel>
                                    Nama perusahaan <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Contoh: PT. Contoh Indonesia" />
                                {errors.name && <FieldError>{errors.name}</FieldError>}
                            </Field>

                            <div className="col-span-2 flex items-start justify-start gap-4 rounded-lg border border-primary bg-transparent p-4 dark:bg-input/30">
                                <Switch checked={data.is_published === 1} onCheckedChange={(v) => setData('is_published', v ? 1 : 0)} />
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium">Publikasikan</Label>
                                    <p className="text-sm text-muted-foreground">Tampilkan logo di halaman publik.</p>
                                </div>
                            </div>

                            <Field className="col-span-2">
                                <FieldLabel>Logo</FieldLabel>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                                    className="hidden"
                                    onChange={(e) => void handleFile(e.target.files?.[0])}
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
                                                imageError
                                                    ? 'border-destructive bg-destructive/5'
                                                    : isDragging
                                                      ? 'border-primary bg-primary/10'
                                                      : 'border-border hover:border-primary hover:bg-muted/40',
                                            ].join(' ')}
                                        >
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                                <ImagePlus className="size-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{isDragging ? 'Lepaskan untuk mengunggah!' : 'Seret & lepas gambar di sini'}</p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    atau <span className="text-primary underline underline-offset-2">klik untuk memilih</span>
                                                </p>
                                            </div>
                                            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                                JPG · PNG · WEBP · SVG · Maks. 2 MB
                                            </span>
                                        </div>
                                        {imageError && <FieldError>{imageError}</FieldError>}
                                        {errors.logo && <FieldError>{errors.logo}</FieldError>}
                                    </>
                                ) : (
                                    <div className="relative overflow-visible">
                                        <div className="relative flex max-h-48 items-center justify-center rounded-lg border border-border bg-muted/20 p-4">
                                            {filePreview.isImage && filePreview.src && (
                                                <img src={filePreview.src} alt={filePreview.name} className="max-h-40 max-w-full object-contain" />
                                            )}
                                        </div>
                                        <div className="mt-2 flex items-center gap-3 rounded-lg border border-primary bg-input/30 px-3 py-2">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                                <FilePlus className="size-4 text-primary" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{filePreview.name}</p>
                                                {filePreview.size > 0 && <p className="text-xs text-muted-foreground">{formatSize(filePreview.size)}</p>}
                                            </div>
                                            <div className="space-x-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button type="button" variant="secondary" size="sm" className="h-8 w-8" onClick={() => fileInputRef.current?.click()}>
                                                            <Pencil className="size-3.5" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Ganti file</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button type="button" variant="destructive" size="sm" className="h-8 w-8" onClick={handleRemoveFile}>
                                                            <Trash className="size-3.5" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Hapus file</TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Field>
                        </div>

                        <DrawerFooter className="mt-auto px-0">
                            <Button type="submit" disabled={processing}>
                                {processing ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan'
                                )}
                            </Button>
                            <DrawerClose asChild>
                                <Button variant="secondary" type="button">
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
