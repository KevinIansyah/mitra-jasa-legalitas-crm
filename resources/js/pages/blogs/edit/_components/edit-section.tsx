import { useForm } from '@inertiajs/react';
import { ImagePlus, Pencil, Sparkles, TableOfContents, Trash } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import MultiSelect from '@/components/multi-select';
import Tiptap from '@/components/tiptap';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { formatSize, readImageAsDataURL, validateImageFile } from '@/lib/service';
import blogs from '@/routes/blogs';
import type { Blog, BlogCategory, BlogTag } from '@/types/blogs';
import type { Service } from '@/types/services';
import { defaultSeo, SeoCard, type LocalBlogSeo } from '../../_components/seo-card';
import { AiGenerateDrawer, type AiDrawerType } from './ai-generate-drawe';

const R2_PUBLIC_URL = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL;

// ============================================================
// TYPES
// ============================================================

type BasicInfoFormData = {
    blog_category_id: number | '';
    title: string;
    short_description: string;
    featured_image: File | null;
    remove_image: boolean;
    is_published: boolean;
    is_featured: boolean;
    tag_ids: number[];
    service_ids: number[];
};

type ContentFormData = {
    content: string;
};

type TabId = 'basic-information' | 'content' | 'seo';

type EditSectionProps = {
    blog: Blog;
    categories: BlogCategory[];
    tags: BlogTag[];
    services: Service[];
};

// ============================================================
// HELPERS
// ============================================================

function resolveImageUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    return path.startsWith('http') ? path : `${R2_PUBLIC_URL}/${path}`;
}

// ============================================================
// COMPONENT
// ============================================================

export function EditSection({ blog, categories, tags, services }: EditSectionProps) {
    const tagOptions = tags.map((t) => ({ id: t.id, label: t.name }));
    const serviceOptions = services.map((s) => ({ id: s.id, label: s.name }));
    const existingTagIds = blog.tags?.map((t) => t.id) ?? [];
    const existingServiceIds = blog.services?.map((s) => s.id) ?? [];
    const [activeTab, setActiveTab] = useState<TabId>('basic-information');
    const [aiDrawer, setAiDrawer] = useState<{ open: boolean; type: AiDrawerType }>({ open: false, type: 'content' });
    const openAiDrawer = (type: AiDrawerType) => setAiDrawer({ open: true, type });

    // ============================================================
    // BASIC INFORMATION FORM
    // ============================================================

    const [imagePreview, setImagePreview] = useState<{ src: string; name: string; size: number } | null>(() => {
        const url = resolveImageUrl(blog.featured_image);
        if (!url) return null;
        return { src: url, name: blog.featured_image!.split('/').pop() || 'image', size: 0 };
    });
    const [imageError, setImageError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        data: basicData,
        setData: setBasicData,
        post: postBasic,
        processing: processingBasic,
        errors: basicErrors,
        isDirty: basicIsDirty,
    } = useForm<BasicInfoFormData>({
        blog_category_id: blog.blog_category_id ?? '',
        title: blog.title ?? '',

        short_description: blog.short_description ?? '',
        featured_image: null,
        remove_image: false,
        is_published: blog.is_published ?? false,
        is_featured: blog.is_featured ?? false,
        tag_ids: existingTagIds,
        service_ids: existingServiceIds,
    });

    const handleFile = async (file: File | undefined) => {
        const error = validateImageFile(file);
        if (error) {
            setImageError(error);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
        setImageError(null);
        setBasicData('featured_image', file!);
        setBasicData('remove_image', false);
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

    const handleRemoveImage = () => {
        setImagePreview(null);
        setImageError(null);
        setBasicData('featured_image', null);
        setBasicData('remove_image', true);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmitBasic = (e: React.FormEvent) => {
        e.preventDefault();
        const id = toast.loading('Memproses...', { description: 'Informasi dasar blog sedang diperbarui.' });
        postBasic(blogs.update.basicInformation(blog.id).url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => toast.success('Berhasil', { description: 'Informasi dasar berhasil diperbarui.' }),
            onError: (errs) => {
                const msg = Object.values(errs)[0] ?? 'Terjadi kesalahan.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => toast.dismiss(id),
        });
    };

    // ============================================================
    // CONTENT FORM
    // ============================================================

    const contentForm = useForm<ContentFormData>({
        content: blog.content ?? '',
    });

    const handleSubmitContent = (e: React.FormEvent) => {
        e.preventDefault();
        const id = toast.loading('Memproses...', { description: 'Konten blog sedang diperbarui.' });
        contentForm.patch(blogs.update.content(blog.id).url, {
            preserveScroll: true,
            onSuccess: () => toast.success('Berhasil', { description: 'Konten berhasil diperbarui.' }),
            onError: (errs) => {
                const msg = Object.values(errs)[0] ?? 'Terjadi kesalahan.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => toast.dismiss(id),
        });
    };

    // ============================================================
    // SEO FORM
    // ============================================================

    const initSeo = (): LocalBlogSeo => {
        const s = blog.seo;
        return {
            ...defaultSeo(),
            meta_title: s?.meta_title ?? '',
            meta_description: s?.meta_description ?? '',
            canonical_url: s?.canonical_url ?? '',
            focus_keyword: s?.focus_keyword ?? '',
            secondary_keywords: s?.secondary_keywords ?? [],
            og_title: s?.og_title ?? '',
            og_description: s?.og_description ?? '',
            og_image: null,
            og_image_url: s?.og_image ?? null,
            remove_og_image: false,
            twitter_card: (s?.twitter_card as LocalBlogSeo['twitter_card']) ?? 'summary_large_image',
            twitter_title: s?.twitter_title ?? '',
            twitter_description: s?.twitter_description ?? '',
            twitter_image: null,
            twitter_image_url: s?.twitter_image ?? null,
            remove_twitter_image: false,
            robots: (s?.robots as LocalBlogSeo['robots']) ?? 'index,follow',
            in_sitemap: s?.in_sitemap ?? true,
            sitemap_priority: (s?.sitemap_priority as LocalBlogSeo['sitemap_priority']) ?? '0.7',
            sitemap_changefreq: (s?.sitemap_changefreq as LocalBlogSeo['sitemap_changefreq']) ?? 'weekly',
        };
    };

    const {
        data: seoData,
        setData: setSeoData,
        post: postSeo,
        processing: processingSeo,
        errors: seoErrors,
        isDirty: seoIsDirty,
    } = useForm<{ seo: LocalBlogSeo }>({
        seo: initSeo(),
    });

    const handleSubmitSeo = (e: React.FormEvent) => {
        e.preventDefault();
        const id = toast.loading('Memproses...', { description: 'SEO blog sedang diperbarui.' });
        postSeo(blogs.update.seo(blog.id).url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => toast.success('Berhasil', { description: 'SEO berhasil diperbarui.' }),
            onError: (errs) => {
                const msg = Object.values(errs)[0] ?? 'Terjadi kesalahan.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => toast.dismiss(id),
        });
    };

    // ============================================================
    // TAB CHANGE GUARD (unsaved changes warning)
    // ============================================================

    const hasUnsavedChanges: Record<TabId, boolean> = {
        'basic-information': basicIsDirty,
        content: contentForm.isDirty,
        seo: seoIsDirty,
    };

    const handleTabChange = (value: string) => {
        const newTab = value as TabId;

        if (hasUnsavedChanges[activeTab]) {
            toast('Perubahan belum disimpan', {
                description: 'Yakin ingin pindah tab?',
                action: {
                    label: 'Pindah',
                    onClick: () => setActiveTab(newTab),
                },
            });
            return;
        }

        setActiveTab(newTab);
    };

    // ============================================================
    // AI APPLY HANDLER
    // ============================================================

    const handleAiApply = (data: Record<string, unknown>) => {
        if (data.short_description !== undefined) setBasicData('short_description', data.short_description as string);
        if (data.content !== undefined) contentForm.setData('content', data.content as string);

        const seoUpdates: Partial<LocalBlogSeo> = {};
        if (data.meta_title !== undefined) seoUpdates.meta_title = data.meta_title as string;
        if (data.meta_description !== undefined) seoUpdates.meta_description = data.meta_description as string;
        if (data.focus_keyword !== undefined) seoUpdates.focus_keyword = data.focus_keyword as string;

        if (Object.keys(seoUpdates).length > 0) {
            setSeoData('seo', { ...seoData.seo, ...seoUpdates });
        }
    };
    // ============================================================
    // RENDER
    // ============================================================

    return (
        <>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-4">
                <TabsList>
                    <TabsTrigger value="basic-information">
                        Informasi Dasar
                        {hasUnsavedChanges['basic-information'] && <div className="ml-1 h-2 w-2 rounded-full border border-destructive bg-destructive" />}
                    </TabsTrigger>
                    <TabsTrigger value="content">
                        Konten
                        {hasUnsavedChanges.content && <div className="ml-1 h-2 w-2 rounded-full border border-destructive bg-destructive" />}
                    </TabsTrigger>
                    <TabsTrigger value="seo">
                        SEO
                        {hasUnsavedChanges.seo && <div className="ml-1 h-2 w-2 rounded-full border border-destructive bg-destructive" />}
                    </TabsTrigger>
                </TabsList>

                {/* ───────────────── Basic Information ───────────────── */}
                <TabsContent value="basic-information">
                    <form onSubmit={handleSubmitBasic} className="space-y-4">
                        <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-semibold">Informasi Dasar Blog</h2>
                                    <p className="mt-0.5 text-sm text-muted-foreground">Kelola identitas, kategori, tag, deskripsi singkat, dan pengaturan publikasi blog.</p>
                                </div>

                                {/* Title / Category */}
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                    <Field>
                                        <FieldLabel htmlFor="title">
                                            Judul <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="title"
                                            type="text"
                                            required
                                            autoFocus
                                            placeholder="Masukkan judul blog"
                                            value={basicData.title}
                                            onChange={(e) => setBasicData('title', e.target.value)}
                                        />
                                        {basicErrors.title && <FieldError>{basicErrors.title}</FieldError>}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="category">
                                            Kategori <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Select
                                            required
                                            value={basicData.blog_category_id ? String(basicData.blog_category_id) : ''}
                                            onValueChange={(val) => setBasicData('blog_category_id', Number(val))}
                                        >
                                            <SelectTrigger id="category">
                                                <SelectValue placeholder="Pilih kategori" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Kategori</SelectLabel>
                                                    {categories.map((cat) => (
                                                        <SelectItem key={cat.id} value={String(cat.id)}>
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {basicErrors.blog_category_id && <FieldError>{basicErrors.blog_category_id}</FieldError>}
                                    </Field>
                                </div>

                                {/* Tags */}
                                <Field>
                                    <FieldLabel>Tag</FieldLabel>
                                    <MultiSelect
                                        options={tagOptions}
                                        selected={basicData.tag_ids}
                                        onChange={(ids) => setBasicData('tag_ids', ids)}
                                        placeholder="Pilih tag blog..."
                                    />
                                    {basicErrors.tag_ids && <FieldError>{basicErrors.tag_ids}</FieldError>}
                                </Field>

                                {/* Service */}
                                <Field>
                                    <FieldLabel>Layanan</FieldLabel>
                                    <MultiSelect
                                        options={serviceOptions}
                                        selected={basicData.service_ids}
                                        onChange={(ids) => setBasicData('service_ids', ids)}
                                        placeholder="Pilih layanan blog..."
                                    />
                                    {basicErrors.service_ids && <FieldError>{basicErrors.service_ids}</FieldError>}
                                </Field>

                                {/* Short Description */}
                                <Field>
                                    <FieldLabel htmlFor="short_description">Deskripsi Singkat</FieldLabel>
                                    <Textarea
                                        id="short_description"
                                        className="min-h-24"
                                        placeholder="Tambahkan deskripsi singkat blog"
                                        value={basicData.short_description}
                                        onChange={(e) => setBasicData('short_description', e.target.value)}
                                    />
                                    {basicErrors.short_description && <FieldError>{basicErrors.short_description}</FieldError>}
                                </Field>

                                {/* Featured Image */}
                                <Field>
                                    <FieldLabel>Gambar Utama</FieldLabel>
                                    <Alert className="border-primary bg-primary/20">
                                        <TableOfContents />
                                        <AlertTitle>Panduan Ukuran Gambar Ideal</AlertTitle>
                                        <AlertDescription>
                                            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-foreground/70">
                                                <li>
                                                    <strong>Open Graph / Thumbnail:</strong> 1200×630px (Rasio 1.91:1)
                                                </li>
                                                <li>
                                                    <strong>Hero / Banner:</strong> 1920×1080px (16:9)
                                                </li>
                                                <li>
                                                    <strong>Format:</strong> JPG/PNG/WEBP · Maks. 5MB
                                                </li>
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
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    setIsDragging(false);
                                                    handleFile(e.dataTransfer.files[0]);
                                                }}
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
                                            {basicErrors.featured_image && <FieldError>{basicErrors.featured_image}</FieldError>}
                                        </>
                                    ) : (
                                        <div>
                                            <img src={imagePreview.src} alt={imagePreview.name} className="aspect-video w-full rounded-lg border border-border object-cover" />
                                            <div className="mt-2 flex items-center gap-3 rounded-lg border border-primary bg-input/30 px-3 py-2">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                                                    <ImagePlus className="size-4 text-primary" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">{imagePreview.name}</p>
                                                    {imagePreview.size > 0 && <p className="text-xs text-muted-foreground">{formatSize(imagePreview.size)}</p>}
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

                                {/* Display Settings */}
                                <Field>
                                    <FieldLabel>Pengaturan Tampilan</FieldLabel>
                                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                        <div className="flex items-start gap-4 rounded-lg border border-primary bg-transparent p-4 dark:bg-input/30">
                                            <Switch id="is_published" checked={basicData.is_published} onCheckedChange={(val) => setBasicData('is_published', val)} />
                                            <div className="flex-1">
                                                <Label htmlFor="is_published" className="cursor-pointer text-sm font-medium">
                                                    Publikasikan Blog
                                                </Label>
                                                <p className="text-sm text-muted-foreground">Jika aktif, blog akan tampil dan dapat diakses oleh pengunjung website.</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 rounded-lg border border-primary bg-transparent p-4 dark:bg-input/30">
                                            <Switch id="is_featured" checked={basicData.is_featured} onCheckedChange={(val) => setBasicData('is_featured', val)} />
                                            <div className="flex-1">
                                                <Label htmlFor="is_featured" className="cursor-pointer text-sm font-medium">
                                                    Jadikan Blog Unggulan
                                                </Label>
                                                <p className="text-sm text-muted-foreground">Blog akan ditampilkan di bagian "Blog Unggulan" di halaman utama.</p>
                                            </div>
                                        </div>
                                    </div>
                                </Field>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button type="submit" className="flex-1 md:w-45 md:flex-none" disabled={processingBasic || !hasUnsavedChanges['basic-information']}>
                                {processingBasic ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan'
                                )}
                            </Button>
                        </div>
                    </form>
                </TabsContent>

                {/* ───────────────── Content Section ───────────────── */}
                <TabsContent value="content">
                    <form onSubmit={handleSubmitContent} className="space-y-4">
                        <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                            <div className="space-y-6">
                                <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
                                    <div>
                                        <h2 className="text-xl font-semibold">Konten Blog</h2>
                                        <p className="mt-0.5 text-sm text-muted-foreground">
                                            Tulis konten utama blog. Gunakan heading, list, dan formatting untuk SEO yang optimal.
                                        </p>
                                    </div>
                                    <Button type="button" variant="secondary" className="w-full md:w-30" onClick={() => openAiDrawer('content')}>
                                        <Sparkles className="size-4" />
                                        Generate AI
                                    </Button>
                                </div>

                                <Field>
                                    <FieldLabel>Konten</FieldLabel>
                                    <Alert className="border-primary bg-primary/20">
                                        <TableOfContents />
                                        <AlertTitle>Panduan Penulisan Ideal</AlertTitle>
                                        <AlertDescription>Konten minimal 800 kata untuk SEO yang baik. Gunakan heading (H2, H3) dan paragraf yang jelas.</AlertDescription>
                                    </Alert>
                                    <Tiptap content={contentForm.data.content} onChange={(html) => contentForm.setData('content', html)} />
                                    {contentForm.errors.content && <FieldError>{contentForm.errors.content}</FieldError>}
                                </Field>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button type="submit" className="flex-1 md:w-45 md:flex-none" disabled={contentForm.processing || !hasUnsavedChanges.content}>
                                {contentForm.processing ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan'
                                )}
                            </Button>
                        </div>
                    </form>
                </TabsContent>

                {/* ───────────────── SEO Section ───────────────── */}
                <TabsContent value="seo">
                    <form onSubmit={handleSubmitSeo} className="space-y-4">
                        <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                            <div className="space-y-6">
                                <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
                                    <div>
                                        <h2 className="text-xl font-semibold">Pengaturan SEO</h2>
                                        <p className="mt-0.5 text-sm text-muted-foreground">Kelola meta tags, open graph, dan sitemap untuk halaman blog ini.</p>
                                    </div>
                                    <Button type="button" variant="secondary" className="w-full md:w-30" onClick={() => openAiDrawer('seo')}>
                                        <Sparkles className="size-4" />
                                        Generate AI
                                    </Button>
                                </div>

                                <SeoCard seo={seoData.seo} onChange={(seo) => setSeoData('seo', seo)} errors={seoErrors} schemaMarkup={blog.seo?.schema_markup ?? null} />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button type="submit" className="flex-1 md:w-45 md:flex-none" disabled={processingSeo || !hasUnsavedChanges.seo}>
                                {processingSeo ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan'
                                )}
                            </Button>
                        </div>
                    </form>
                </TabsContent>
            </Tabs>

            <AiGenerateDrawer
                open={aiDrawer.open}
                onOpenChange={(open) => setAiDrawer((prev) => ({ ...prev, open }))}
                type={aiDrawer.type}
                blogId={blog.id}
                onApply={handleAiApply}
            />
        </>
    );
}
