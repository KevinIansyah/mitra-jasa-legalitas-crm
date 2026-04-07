import { useForm } from '@inertiajs/react';
import { FilePlus, ImagePlus, Pencil, Trash } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { formatSize, readImageAsDataURL, validateImageFile } from '@/lib/service';
import contents from '@/routes/contents';
import { CATEGORY_BUSINESS } from '@/types/contacts';
import type { ClientSuccessStory, ClientSuccessStoryFormData } from '@/types/contents';

const R2_PUBLIC_URL = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL;

type StoryEditDrawerProps = {
    story: ClientSuccessStory;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function StoryEditDrawer({ story, open, onOpenChange }: StoryEditDrawerProps) {
    const [imgLoading, setImgLoading] = React.useState(true);
    const [imageError, setImageError] = React.useState<string | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const loadingFocusRef = React.useRef<HTMLButtonElement>(null);

    const [filePreview, setFilePreview] = React.useState<{ src?: string; name: string; size: number; isImage: boolean } | null>(
        story.client_logo
            ? {
                  src: `${R2_PUBLIC_URL}/${story.client_logo}`,
                  name: story.client_logo.split('/').pop() || 'file',
                  size: 0,
                  isImage: /\.(jpg|jpeg|png|webp)$/i.test(story.client_logo),
              }
            : null,
    );

    const { data, setData, post, processing, errors } = useForm<ClientSuccessStoryFormData>({
        client_name: story.client_name,
        industry: story.industry,
        client_logo: null,
        metric_value: story.metric_value,
        metric_label: story.metric_label,
        challenge: story.challenge,
        solution: story.solution,
        stat_1_value: story.stat_1_value,
        stat_1_label: story.stat_1_label,
        stat_2_value: story.stat_2_value,
        stat_2_label: story.stat_2_label,
        stat_3_value: story.stat_3_value,
        stat_3_label: story.stat_3_label,
        is_published: story.is_published ? 1 : 0,
        remove_client_logo: false,
    });

    // ============================================================
    // FILE HANDLERS
    // ============================================================
    const handleFile = async (file: File | undefined) => {
        if (!file) return;
        const err = validateImageFile(file, 2048 * 1024);
        if (err) {
            setImageError(err);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
        setImageError(null);
        setData('client_logo', file);
        setData('remove_client_logo', false);
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
        setData('client_logo', null);
        setData('remove_client_logo', true);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ============================================================
    // SUBMIT HANDLER
    // ============================================================
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const toastId = toast.loading('Menyimpan...', { description: 'Kisah sukses sedang diperbarui.' });

        post(contents.clientSuccessStories.update({ client_success_story: story.id }).url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', { description: 'Kisah sukses berhasil diperbarui.' });
                onOpenChange(false);
            },
            onError: () => {
                toast.error('Gagal', { description: 'Terjadi kesalahan saat memperbarui kisah sukses, coba lagi.' });
            },
            onFinish: () => {
                toast.dismiss(toastId);
            },
        });
    }

    return (
        <Drawer direction="bottom" open={open} onOpenChange={onOpenChange}>
            <DrawerContent
                className="flex max-h-[95vh] flex-col"
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                    loadingFocusRef.current?.focus();
                }}
            >
                <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 overflow-y-auto">
                    <DrawerHeader className="px-4">
                        <DrawerTitle>Edit Kisah Sukses</DrawerTitle>
                        <DrawerDescription>Perbarui data kisah sukses. Industri memakai kategori bisnis yang sama dengan data kontak.</DrawerDescription>
                    </DrawerHeader>

                    <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Field className="col-span-2 md:col-span-1">
                                <FieldLabel>
                                    Nama Klien / Brand <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Input value={data.client_name} onChange={(e) => setData('client_name', e.target.value)} placeholder="Contoh: PT. Mitra Jasa Legalitas" />
                                {errors.client_name && <FieldError>{errors.client_name}</FieldError>}
                            </Field>

                            <Field className="col-span-2 md:col-span-1">
                                <FieldLabel>
                                    Industri <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Select value={data.industry} onValueChange={(v) => setData('industry', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih industri..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Kategori bisnis</SelectLabel>
                                            {CATEGORY_BUSINESS.map((c) => (
                                                <SelectItem key={c.value} value={c.value}>
                                                    <span className={`mr-2 inline-block h-2 w-2 rounded-full ${c.classes.replace('text-white', '')}`} />
                                                    {c.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.industry && <FieldError>{errors.industry}</FieldError>}
                            </Field>

                            <Field className="col-span-2">
                                <FieldLabel>Logo Klien</FieldLabel>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
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
                                                    atau <span className="text-primary underline underline-offset-2">klik untuk memilih</span> dari perangkat Anda
                                                </p>
                                                <p className="mt-2 text-xs font-medium text-muted-foreground/90">Placeholder: logo persegi atau lebar (opsional)</p>
                                            </div>
                                            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                                JPG · PNG · WEBP · Maks. 2 MB
                                            </span>
                                        </div>
                                        {imageError && <FieldError>{imageError}</FieldError>}
                                        {errors.client_logo && <FieldError>{errors.client_logo}</FieldError>}
                                    </>
                                ) : (
                                    <div className="relative overflow-visible">
                                        <div className="relative">
                                            {imgLoading && filePreview.isImage && <Skeleton className="aspect-video w-full rounded-lg" />}
                                            {filePreview.isImage && filePreview.src && (
                                                <img
                                                    src={filePreview.src}
                                                    alt={filePreview.name}
                                                    onLoad={() => setImgLoading(false)}
                                                    onError={() => setImgLoading(false)}
                                                    className={`aspect-video w-full rounded-lg border border-border object-cover ${imgLoading ? 'hidden' : 'block'}`}
                                                />
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
                            </Field>

                            <Field className="col-span-2 md:col-span-1">
                                <FieldLabel>
                                    Nilai metrik utama <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Input value={data.metric_value} onChange={(e) => setData('metric_value', e.target.value)} placeholder="Contoh: +200%" />
                                {errors.metric_value && <FieldError>{errors.metric_value}</FieldError>}
                            </Field>

                            <Field>
                                <FieldLabel>
                                    Label metrik <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Input value={data.metric_label} onChange={(e) => setData('metric_label', e.target.value)} placeholder="Contoh: Revenue setelah legal" />
                                {errors.metric_label && <FieldError>{errors.metric_label}</FieldError>}
                            </Field>

                            <Field className="col-span-2">
                                <FieldLabel>
                                    Tantangan <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Textarea
                                    className="min-h-28"
                                    value={data.challenge}
                                    onChange={(e) => setData('challenge', e.target.value)}
                                    placeholder="Contoh: Tidak ada kesepakatan kontrak"
                                />
                                {errors.challenge && <FieldError>{errors.challenge}</FieldError>}
                            </Field>

                            <Field className="col-span-2">
                                <FieldLabel>
                                    Solusi <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Textarea
                                    className="min-h-28"
                                    value={data.solution}
                                    onChange={(e) => setData('solution', e.target.value)}
                                    placeholder="Contoh: Mengajukan perubahan kontrak"
                                />
                                {errors.solution && <FieldError>{errors.solution}</FieldError>}
                            </Field>

                            <Field className="col-span-2 md:col-span-1">
                                <FieldLabel>Stat 1 - nilai</FieldLabel>
                                <Input value={data.stat_1_value ?? ''} onChange={(e) => setData('stat_1_value', e.target.value || null)} placeholder="Contoh: 14 hari" />
                            </Field>
                            <Field className="col-span-2 md:col-span-1">
                                <FieldLabel>Stat 1 - label</FieldLabel>
                                <Input value={data.stat_1_label ?? ''} onChange={(e) => setData('stat_1_label', e.target.value || null)} placeholder="Contoh: Waktu pengurusan" />
                            </Field>

                            <Field className="col-span-2 md:col-span-1">
                                <FieldLabel>Stat 2 - nilai</FieldLabel>
                                <Input value={data.stat_2_value ?? ''} onChange={(e) => setData('stat_2_value', e.target.value || null)} placeholder="Contoh: 100%" />
                            </Field>
                            <Field className="col-span-2 md:col-span-1">
                                <FieldLabel>Stat 2 - label</FieldLabel>
                                <Input value={data.stat_2_label ?? ''} onChange={(e) => setData('stat_2_label', e.target.value || null)} placeholder="Contoh: Izin lengkap" />
                            </Field>

                            <Field className="col-span-2 md:col-span-1">
                                <FieldLabel>Stat 3 - nilai</FieldLabel>
                                <Input value={data.stat_3_value ?? ''} onChange={(e) => setData('stat_3_value', e.target.value || null)} placeholder="Contoh: Rp 85jt" />
                            </Field>
                            <Field className="col-span-2 md:col-span-1">
                                <FieldLabel>Stat 3 - label</FieldLabel>
                                <Input value={data.stat_3_label ?? ''} onChange={(e) => setData('stat_3_label', e.target.value || null)} placeholder="Contoh: Omset bulan 1" />
                            </Field>

                            <div className="col-span-2 flex items-start justify-start gap-4 rounded-lg border border-primary bg-transparent p-4 dark:bg-input/30">
                                <Switch checked={data.is_published === 1} onCheckedChange={(v) => setData('is_published', v ? 1 : 0)} />
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium">Publikasikan</Label>
                                    <p className="text-sm text-muted-foreground">Tampilkan di halaman publik.</p>
                                </div>
                            </div>
                        </div>

                        <DrawerFooter className="mt-auto px-0">
                            <Button ref={loadingFocusRef} type="submit" disabled={processing}>
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
