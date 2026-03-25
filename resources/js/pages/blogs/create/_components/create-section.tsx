import { useForm } from '@inertiajs/react';
import { ImagePlus, Pencil, TableOfContents, Trash } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import MultiSelect from '@/components/multi-select';
import Tiptap from '@/components/tiptap';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatSize, readImageAsDataURL, validateImageFile } from '@/lib/service';
import blogs from '@/routes/blogs';
import type { BlogCategory, BlogRelatedService, BlogTag } from '@/types/blogs';
import type { LocalBlogSeo} from '../../_components/seo-card';
import { defaultSeo, SeoCard } from '../../_components/seo-card';

type FormData = {
    blog_category_id: number | '';
    title: string;
    slug: string;
    short_description: string;
    content: string;
    featured_image: File | null;
    is_published: boolean;
    is_featured: boolean;
    tag_ids: number[];
    service_ids: number[];
    seo: LocalBlogSeo;
};

type CreateSectionProps = {
    categories: BlogCategory[];
    tags: BlogTag[];
    services: BlogRelatedService[];
};

export function CreateSection({ categories, tags, services }: CreateSectionProps) {
    const [imagePreview, setImagePreview] = useState<{ src: string; name: string; size: number } | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        blog_category_id: '',
        title: '',
        slug: '',
        short_description: '',
        content: '',
        featured_image: null,
        is_published: false,
        is_featured: false,
        tag_ids: [],
        service_ids: [],
        seo: defaultSeo(),
    });

    const tagOptions     = tags.map((t) => ({ id: t.id, label: t.name }));
    const serviceOptions = services.map((s) => ({ id: s.id, label: s.name }));

    // ============================================================
    // IMAGE HANDLERS
    // ============================================================
    const handleFile = async (file: File | undefined) => {
        const error = validateImageFile(file);
        if (error) {
            setImageError(error);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
        setImageError(null);
        setData('featured_image', file!);
        const preview = await readImageAsDataURL(file!);
        setImagePreview({ src: preview, name: file!.name, size: file!.size });
    };

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
    }, []);

    const handleDragOver = (e: React.DragEvent) => e.preventDefault();

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setImageError(null);
        setData('featured_image', null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ============================================================
    // SUBMIT
    // ============================================================
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', { description: 'Blog sedang ditambahkan.' });

        post(blogs.store().url, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Berhasil', { description: 'Blog berhasil ditambahkan.' });
                handleCancel();
            },
            onError: (errs) => {
                const msg = Object.values(errs)[0] ?? 'Terjadi kesalahan saat menambahkan blog.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => toast.dismiss(id),
        });
    };

    const handleCancel = () => {
        reset();
        setImagePreview(null);
        setImageError(null);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs defaultValue="basic-information" className="w-full">
                <TabsList>
                    <TabsTrigger value="basic-information">Informasi Dasar</TabsTrigger>
                    <TabsTrigger value="content">Konten</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>

                {/* ───────────────── Basic Information ───────────────── */}
                <TabsContent value="basic-information">
                    <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold">Informasi Dasar Blog</h2>
                                <p className="mt-0.5 text-sm text-muted-foreground">Kelola identitas, kategori, tag, deskripsi singkat, dan pengaturan publikasi blog.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                                {/* Title */}
                                <Field>
                                    <FieldLabel htmlFor="title">
                                        Judul <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="title"
                                        type="text"
                                        name="title"
                                        required
                                        autoFocus
                                        placeholder="Masukkan judul blog"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                    />
                                    {errors.title && <FieldError>{errors.title}</FieldError>}
                                </Field>

                                {/* Slug */}
                                <Field>
                                    <FieldLabel htmlFor="slug">Slug</FieldLabel>
                                    <Input
                                        id="slug"
                                        type="text"
                                        name="slug"
                                        placeholder="contoh: cara-mendirikan-pt"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                    />
                                    {errors.slug && <FieldError>{errors.slug}</FieldError>}
                                </Field>

                                {/* Category */}
                                <Field>
                                    <FieldLabel htmlFor="category">
                                        Kategori <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Select
                                        value={data.blog_category_id ? String(data.blog_category_id) : ''}
                                        required
                                        onValueChange={(val) => setData('blog_category_id', Number(val))}
                                    >
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Kategori</SelectLabel>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={String(category.id)}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {errors.blog_category_id && <FieldError>{errors.blog_category_id}</FieldError>}
                                </Field>
                            </div>

                            {/* Tags */}
                            <Field>
                                <FieldLabel>Tag</FieldLabel>
                                <MultiSelect
                                    options={tagOptions}
                                    selected={data.tag_ids}
                                    onChange={(ids) => setData('tag_ids', ids)}
                                    placeholder="Pilih tag blog..."
                                />
                                {errors.tag_ids && <FieldError>{errors.tag_ids}</FieldError>}
                            </Field>

                            {/* Related Services */}
                            <Field>
                                <FieldLabel>Layanan Terkait</FieldLabel>
                                <MultiSelect
                                    options={serviceOptions}
                                    selected={data.service_ids}
                                    onChange={(ids) => setData('service_ids', ids)}
                                    placeholder="Pilih layanan terkait..."
                                />
                                {errors.service_ids && <FieldError>{errors.service_ids}</FieldError>}
                            </Field>

                            {/* Short Description */}
                            <Field>
                                <FieldLabel htmlFor="short_description">Deskripsi Singkat</FieldLabel>
                                <Textarea
                                    id="short_description"
                                    className="min-h-24"
                                    placeholder="Tambahkan deskripsi singkat blog"
                                    value={data.short_description}
                                    onChange={(e) => setData('short_description', e.target.value)}
                                />
                                {errors.short_description && <FieldError>{errors.short_description}</FieldError>}
                            </Field>

                            {/* Featured Image */}
                            <Field>
                                <FieldLabel>Gambar Utama</FieldLabel>
                                <Alert className="border-primary bg-primary/20">
                                    <TableOfContents />
                                    <AlertTitle>Panduan Ukuran Gambar Ideal</AlertTitle>
                                    <AlertDescription>
                                        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-foreground/70">
                                            <li><strong>Open Graph / Thumbnail:</strong> 1200×630px (Rasio 1.91:1)</li>
                                            <li><strong>Hero / Banner:</strong> 1920×1080px (16:9)</li>
                                            <li><strong>Format:</strong> JPG/PNG/WEBP · Maks. 5MB</li>
                                        </ul>
                                    </AlertDescription>
                                </Alert>

                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />

                                {!imagePreview ? (
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
                                                <p className="text-sm font-medium">{isDragging ? 'Lepaskan untuk mengunggah!' : 'Seret & lepas gambar di sini'}</p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    atau <span className="text-primary underline underline-offset-2">klik untuk memilih</span>
                                                </p>
                                            </div>
                                            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                                JPG · PNG · WEBP · Maks. 5 MB
                                            </span>
                                        </div>
                                        {imageError && <FieldError>{imageError}</FieldError>}
                                        {errors.featured_image && <FieldError>{errors.featured_image}</FieldError>}
                                    </>
                                ) : (
                                    <div className="relative overflow-visible">
                                        <img src={imagePreview.src} alt={imagePreview.name} className="aspect-video w-full rounded-lg border border-border object-cover" />
                                        <div className="mt-2 flex items-center gap-3 rounded-lg border border-primary bg-input/30 px-3 py-2">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                                                <ImagePlus className="size-4 text-primary" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{imagePreview.name}</p>
                                                <p className="text-xs text-muted-foreground">{formatSize(imagePreview.size)}</p>
                                            </div>
                                            <div className="space-x-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} className="h-8 w-8">
                                                            <Pencil className="size-3.5" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Ganti File</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button type="button" variant="destructive" size="sm" onClick={handleRemoveImage} className="h-8 w-8">
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

                            {/* Publication Settings */}
                            {/* <Field>
                                <FieldLabel>Pengaturan Tampilan</FieldLabel>
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                    <div className="flex items-start gap-4 rounded-lg border border-primary bg-transparent p-4 dark:bg-input/30">
                                        <Switch id="is_published" checked={data.is_published} onCheckedChange={(val) => setData('is_published', val)} />
                                        <div className="flex-1">
                                            <Label htmlFor="is_published" className="cursor-pointer text-sm font-medium">
                                                Publikasikan Blog
                                            </Label>
                                            <p className="text-sm text-muted-foreground">Jika aktif, blog akan tampil dan dapat diakses oleh pengunjung website.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 rounded-lg border border-primary bg-transparent p-4 dark:bg-input/30">
                                        <Switch id="is_featured" checked={data.is_featured} onCheckedChange={(val) => setData('is_featured', val)} />
                                        <div className="flex-1">
                                            <Label htmlFor="is_featured" className="cursor-pointer text-sm font-medium">
                                                Jadikan Blog Unggulan
                                            </Label>
                                            <p className="text-sm text-muted-foreground">Blog akan ditampilkan di bagian "Blog Unggulan" di halaman utama.</p>
                                        </div>
                                    </div>
                                </div>
                            </Field> */}
                        </div>
                    </div>
                </TabsContent>

                {/* ───────────────── Content Section ───────────────── */}
                <TabsContent value="content">
                    <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold">Konten Blog</h2>
                                <p className="mt-0.5 text-sm text-muted-foreground">Tulis konten utama blog. Gunakan heading, list, dan formatting untuk SEO yang optimal.</p>
                            </div>

                            <Field>
                                <FieldLabel>Konten</FieldLabel>
                                <Alert className="border-primary bg-primary/20">
                                    <TableOfContents />
                                    <AlertTitle>Panduan Penulisan Ideal</AlertTitle>
                                    <AlertDescription>Konten minimal 800 kata untuk SEO yang baik. Gunakan heading (H2, H3) dan paragraf yang jelas.</AlertDescription>
                                </Alert>
                                <Tiptap content={data.content} onChange={(html) => setData('content', html)} />
                                {errors.content && <FieldError>{errors.content}</FieldError>}
                            </Field>
                        </div>
                    </div>
                </TabsContent>

                {/* ───────────────── SEO Section ───────────────── */}
                <TabsContent value="seo">
                    <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold">Pengaturan SEO</h2>
                                <p className="mt-0.5 text-sm text-muted-foreground">Kelola meta tags, open graph, dan sitemap untuk halaman blog ini.</p>
                            </div>
                            <SeoCard seo={data.seo} onChange={(seo) => setData('seo', seo)} errors={errors} />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* ───────────────── Action Buttons ───────────────── */}
            <div className="flex items-center justify-start gap-2">
                <Button type="submit" className="flex-1 md:w-45 md:flex-none" disabled={processing}>
                    {processing ? (
                        <>
                            <Spinner className="mr-2" />
                            Menyimpan...
                        </>
                    ) : (
                        'Simpan'
                    )}
                </Button>
                <Button type="button" variant="secondary" className="flex-1 md:w-45 md:flex-none" onClick={handleCancel} disabled={processing}>
                    Batal
                </Button>
            </div>
        </form>
    );
}
