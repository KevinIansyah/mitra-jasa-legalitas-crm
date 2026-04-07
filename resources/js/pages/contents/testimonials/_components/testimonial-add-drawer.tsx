import { useForm } from '@inertiajs/react';
import { FilePlus, ImagePlus, Pencil, Plus, Trash } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { formatSize, readImageAsDataURL, validateImageFile } from '@/lib/service';
import contents from '@/routes/contents';
import type { TestimonialFormData } from '@/types/contents';
import { TESTIMONIAL_RATING_OPTIONS } from '@/types/contents';
import type { Service } from '@/types/services';

export function TestimonialAddDrawer({ services }: { services: Service[] }) {
    const [open, setOpen] = React.useState(false);
    const [filePreview, setFilePreview] = React.useState<{ src?: string; name: string; size: number; isImage: boolean } | null>(null);
    const [imageError, setImageError] = React.useState<string | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm<TestimonialFormData>({
        service_id: null,
        client_name: '',
        client_position: null,
        client_company: null,
        client_avatar: null,
        rating: 5,
        content: '',
        is_published: 0,
    });

    // ============================================================
    // FILE HANDLERS
    // ============================================================
    const handleFile = async (file: File | undefined) => {
        if (!file) return;

        const error = validateImageFile(file, 2048 * 1024);
        if (error) {
            setImageError(error);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setImageError(null);
        setData('client_avatar', file);
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
        setData('client_avatar', null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ============================================================
    // SUBMIT HANDLER
    // ============================================================
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const toastId = toast.loading('Menyimpan...', { description: 'Testimoni sedang ditambahkan.' });

        post(contents.testimonials.store.url(), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', { description: 'Testimoni berhasil ditambahkan.' });
                reset();
                setOpen(false);
            },
            onError: () => {
                toast.error('Gagal', { description: 'Terjadi kesalahan saat menambahkan testimoni, coba lagi.' });
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

            <DrawerContent className="flex h-screen flex-col">
                <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 overflow-y-auto">
                    <DrawerHeader className="px-4">
                        <DrawerTitle>Tambah Testimoni</DrawerTitle>
                        <DrawerDescription>Data klien, rating, ulasan, dan opsional foto profil (maks. 2MB).</DrawerDescription>
                    </DrawerHeader>

                    <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Field className="col-span-2 md:col-span-1">
                                <FieldLabel>Layanan</FieldLabel>
                                <Select value={data.service_id != null ? String(data.service_id) : ''} onValueChange={(v) => setData('service_id', v ? Number(v) : null)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih layanan..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Layanan</SelectLabel>
                                            {services.map((item) => (
                                                <SelectItem key={item.id} value={String(item.id)}>
                                                    {item.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.service_id && <FieldError>{errors.service_id}</FieldError>}
                            </Field>

                            <Field className="col-span-2 md:col-span-1">
                                <FieldLabel>
                                    Nama klien <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Input value={data.client_name} onChange={(e) => setData('client_name', e.target.value)} placeholder="Contoh: John Doe" />
                                {errors.client_name && <FieldError>{errors.client_name}</FieldError>}
                            </Field>

                            <Field className="col-span-2 md:col-span-1">
                                <FieldLabel>Posisi / jabatan</FieldLabel>
                                <Input value={data.client_position ?? ''} onChange={(e) => setData('client_position', e.target.value || null)} placeholder="Contoh: Direktur" />
                                {errors.client_position && <FieldError>{errors.client_position}</FieldError>}
                            </Field>

                            <Field className="col-span-2 md:col-span-1">
                                <FieldLabel>Perusahaan</FieldLabel>
                                <Input
                                    value={data.client_company ?? ''}
                                    onChange={(e) => setData('client_company', e.target.value || null)}
                                    placeholder="Contoh: PT. Mitra Jasa Legalitas"
                                />
                                {errors.client_company && <FieldError>{errors.client_company}</FieldError>}
                            </Field>

                            <Field className="col-span-2">
                                <FieldLabel>
                                    Rating <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Select value={String(data.rating)} onValueChange={(v) => setData('rating', Number(v))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Rating</SelectLabel>
                                            {TESTIMONIAL_RATING_OPTIONS.map((item) => (
                                                <SelectItem key={item} value={String(item)}>
                                                    {item} / 5
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.rating && <FieldError>{errors.rating}</FieldError>}
                            </Field>

                            <div className="col-span-2 flex items-start justify-start gap-4 rounded-lg border border-primary bg-transparent p-4 dark:bg-input/30">
                                <Switch checked={data.is_published === 1} onCheckedChange={(v) => setData('is_published', v ? 1 : 0)} />
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium">Publikasikan</Label>
                                    <p className="text-sm text-muted-foreground">Tampilkan di halaman publik.</p>
                                </div>
                            </div>

                            <Field className="col-span-2">
                                <FieldLabel>
                                    Ulasan <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Textarea
                                    className="min-h-32"
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    placeholder="Testimoni saya sangat baik, terima kasih..."
                                />
                                {errors.content && <FieldError>{errors.content}</FieldError>}
                            </Field>

                            <Field className="col-span-2">
                                <FieldLabel>Foto profil</FieldLabel>
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
                                                <p className="mt-2 text-xs font-medium text-muted-foreground/90">Placeholder: foto profil klien (bulat, opsional)</p>
                                            </div>
                                            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                                JPG · PNG · WEBP · Maks. 2 MB
                                            </span>
                                        </div>
                                        {imageError && <FieldError>{imageError}</FieldError>}
                                        {errors.client_avatar && <FieldError>{errors.client_avatar}</FieldError>}
                                    </>
                                ) : (
                                    <div className="relative overflow-visible">
                                        <div className="relative">
                                            {filePreview.isImage && filePreview.src && (
                                                <img src={filePreview.src} alt={filePreview.name} className="aspect-video w-full rounded-lg border border-border object-cover" />
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
