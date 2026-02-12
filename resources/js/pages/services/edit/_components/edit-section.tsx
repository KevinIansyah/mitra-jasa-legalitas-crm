import { router, useForm } from '@inertiajs/react';
import { ImagePlus, Plus, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import Tiptap from '@/components/tiptap';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import services from '@/routes/services';
import type { Service, ServiceCategory } from '@/types/service';
import { PackageCard, type LocalPackage } from './package-card';

type BasicInfoFormData = {
    service_category_id: number;
    name: string;
    slug: string;
    short_description: string;
    featured_image: File | null;
    remove_image: boolean;
    is_published: boolean;
    is_featured: boolean;
    is_popular: boolean;
};

type ContentFormData = {
    introduction: string;
    content: string;
};

type PackageFormData = {
    packages: LocalPackage[];
};

type TabId = 'basic-information' | 'content' | 'package';

const uid = () => Math.random().toString(36).slice(2, 9);

const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const makePackage = (sort_order: number): LocalPackage => ({
    _key: uid(),
    name: 'Paket Baru',
    price: 0,
    original_price: null,
    duration: '7-14 hari',
    duration_days: null,
    short_description: null,
    is_highlighted: false,
    badge: null,
    sort_order,
    status: 'active',
    features: [],
});

const MAX_IMAGE_SIZE = 1 * 1024 * 1024;

type EditSectionProps = {
    service: Service;
    categories: ServiceCategory[];
};

export function EditSection({ service, categories }: EditSectionProps) {
    const [activeTab, setActiveTab] = useState<TabId>('basic-information');

    // Image state
    const [imagePreview, setImagePreview] = useState<{ src: string; name: string; size: number } | null>(
        service.featured_image
            ? {
                  src: `/storage/${service.featured_image}`,
                  name: service.featured_image.split('/').pop() || 'image',
                  size: 0,
              }
            : null,
    );
    const [imageError, setImageError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Forms
    // Basic Info Form
    const basicInfoForm = useForm<BasicInfoFormData>({
        service_category_id: service.service_category_id,
        name: service.name,
        slug: service.slug,
        short_description: service.short_description || '',
        featured_image: null,
        remove_image: false,
        is_published: service.is_published,
        is_featured: service.is_featured,
        is_popular: service.is_popular,
    });

    // Content Form
    const contentForm = useForm<ContentFormData>({
        introduction: service.introduction || '',
        content: service.content || '',
    });

    // Package Form
    const packageForm = useForm<PackageFormData>({
        packages: (service.packages ?? []).map((pkg) => ({
            id: pkg.id,
            _key: `pkg-${pkg.id}`,
            name: pkg.name,
            price: Number(pkg.price),
            original_price: pkg.original_price ? Number(pkg.original_price) : null,
            duration: pkg.duration,
            duration_days: pkg.duration_days,
            short_description: pkg.short_description,
            is_highlighted: pkg.is_highlighted,
            badge: pkg.badge,
            sort_order: pkg.sort_order,
            status: pkg.status,
            features: (pkg.features ?? []).map((feat) => ({
                id: feat.id,
                _key: `feat-${feat.id}`,
                feature_name: feat.feature_name,
                description: feat.description,
                is_included: feat.is_included,
                sort_order: feat.sort_order,
            })),
        })),
    });

    // Track changes
    const hasUnsavedChanges = {
        'basic-information': basicInfoForm.isDirty,
        content: contentForm.isDirty,
        package: packageForm.isDirty,
    } satisfies Record<TabId, boolean>;

    const handleTabChange = (value: string) => {
        const newTab = value as TabId;

        if (hasUnsavedChanges[activeTab]) {
            const confirmed = window.confirm('Ada perubahan yang belum disimpan. Yakin ingin pindah tab?');
            if (!confirmed) return;
        }

        setActiveTab(newTab);
    };

    // Image handlers
    const handleFile = (file: File | undefined) => {
        if (!file || !file.type.startsWith('image/')) return;
        if (file.size > MAX_IMAGE_SIZE) {
            setImageError(`Ukuran file terlalu besar (${formatSize(file.size)}). Maksimal 1 MB.`);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
        setImageError(null);
        basicInfoForm.setData('featured_image', file);
        basicInfoForm.setData('remove_image', false);
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview({ src: e.target?.result as string, name: file.name, size: file.size });
        reader.readAsDataURL(file);
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
        basicInfoForm.setData('featured_image', null);
        basicInfoForm.setData('remove_image', true);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Package handlers
    const addPackage = () => packageForm.setData('packages', [...packageForm.data.packages, makePackage(packageForm.data.packages.length)]);

    const updatePackage = (_key: string, updated: LocalPackage) =>
        packageForm.setData(
            'packages',
            packageForm.data.packages.map((p) => (p._key === _key ? updated : p)),
        );

    const deletePackage = (_key: string) =>
        packageForm.setData(
            'packages',
            packageForm.data.packages.filter((p) => p._key !== _key),
        );

    // Submit handlers
    const handleSubmitBasicInfo = (e: React.FormEvent) => {
        e.preventDefault();

        basicInfoForm.transform((data) => ({
            ...data,
            _method: 'PATCH',
        }));

        // basicInfoForm.post(services.update.basicInformation(service.id.toString()).url, {
        //     forceFormData: true,
        //     preserveScroll: true,
        //     onSuccess: () => {
        //         basicInfoForm.clearErrors();
        //     },
        //     onError: () => {
        //         toast.error('Gagal', {
        //             description: 'Gagal memperbarui informasi dasar. Silakan periksa kembali data informasi dasar yang diisi.',
        //         });
        //     },
        // });
    };

    const handleSubmitContent = (e: React.FormEvent) => {
        e.preventDefault();

        // contentForm.patch(services.update.content(service.id.toString()).url, {
        //     preserveScroll: true,
        //     onSuccess: () => {
        //         contentForm.clearErrors();
        //     },
        //     onError: () => {
        //         toast.error('Gagal', {
        //             description: 'Gagal memperbarui konten. Silakan periksa kembali data konten yang diisi.',
        //         });
        //     },
        // });
    };

    const handleSubmitPackages = (e: React.FormEvent) => {
        e.preventDefault();

        if (packageForm.data.packages.length === 0) {
            toast.error('Gagal', {
                description: 'Minimal harus ada 1 paket',
            });
            return;
        }

        // packageForm.patch(services.update.packages(service.id).url, {
        //     preserveScroll: true,
        //     onSuccess: () => {
        //         packageForm.clearErrors();
        //     },
        //     onError: () => {
        //         toast.error('Gagal', {
        //             description: 'Gagal memperbarui paket harga. Silakan periksa kembali data paket yang diisi.',
        //         });
        //     },
        // });
    };

    return (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList>
                <TabsTrigger value="basic-information" className="relative">
                    Informasi Dasar
                    {hasUnsavedChanges['basic-information'] && <div className="ml-1 h-2 w-2 rounded-full border border-destructive bg-destructive"></div>}
                </TabsTrigger>
                <TabsTrigger value="content" className="relative">
                    Konten
                    {hasUnsavedChanges.content && <div className="ml-1 h-2 w-2 rounded-full border border-destructive bg-destructive"></div>}
                </TabsTrigger>
                <TabsTrigger value="package" className="relative">
                    Paket Harga
                    {hasUnsavedChanges.package && <div className="ml-1 h-2 w-2 rounded-full border border-destructive bg-destructive"></div>}
                </TabsTrigger>
            </TabsList>

            {/* Tab: Informasi Dasar  */}
            <TabsContent value="basic-information">
                <form onSubmit={handleSubmitBasicInfo}>
                    <div className="w-full rounded-md bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-xl font-bold">Informasi Dasar Layanan</h2>
                                <p className="mt-0.5 text-sm text-muted-foreground">Kelola identitas, kategori, deskripsi singkat, dan pengaturan publikasi layanan.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                                {/* Service Name */}
                                <Field>
                                    <FieldLabel htmlFor="name">
                                        Nama <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="name"
                                        type="text"
                                        name="name"
                                        required
                                        placeholder="Masukkan nama layanan"
                                        value={basicInfoForm.data.name}
                                        onChange={(e) => basicInfoForm.setData('name', e.target.value)}
                                    />
                                    {basicInfoForm.errors.name && <FieldError>{basicInfoForm.errors.name}</FieldError>}
                                </Field>

                                {/* Service Slug */}
                                <Field>
                                    <FieldLabel htmlFor="slug">Slug</FieldLabel>
                                    <Input
                                        id="slug"
                                        type="text"
                                        name="slug"
                                        placeholder="Masukkan slug, contoh: slug-kategori-layanan"
                                        value={basicInfoForm.data.slug}
                                        onChange={(e) => basicInfoForm.setData('slug', e.target.value)}
                                    />
                                    {basicInfoForm.errors.slug && <FieldError>{basicInfoForm.errors.slug}</FieldError>}
                                </Field>

                                {/* Service Category */}
                                <Field>
                                    <FieldLabel htmlFor="category">
                                        Kategori <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Select
                                        required
                                        value={String(basicInfoForm.data.service_category_id)}
                                        onValueChange={(val) => basicInfoForm.setData('service_category_id', Number(val))}
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
                                    {basicInfoForm.errors.service_category_id && <FieldError>{basicInfoForm.errors.service_category_id}</FieldError>}
                                </Field>
                            </div>

                            {/* Service Short Description */}
                            <Field>
                                <FieldLabel htmlFor="short_description">Deskripsi Singkat</FieldLabel>
                                <Textarea
                                    id="short_description"
                                    className="min-h-24"
                                    placeholder="Tambahkan deskripsi singkat layanan"
                                    value={basicInfoForm.data.short_description}
                                    onChange={(e) => basicInfoForm.setData('short_description', e.target.value)}
                                />
                                {basicInfoForm.errors.short_description && <FieldError>{basicInfoForm.errors.short_description}</FieldError>}
                            </Field>

                            {/* Service Featured Image */}
                            <Field>
                                <FieldLabel htmlFor="featured_image">Gambar Utama</FieldLabel>
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
                                                      : 'border-border hover:border-primary/60 hover:bg-muted/40',
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
                                            </div>
                                            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                                JPG · PNG · WEBP · GIF · SVG · Maks. 1 MB
                                            </span>
                                        </div>
                                        {imageError && <FieldError>{imageError}</FieldError>}
                                        {basicInfoForm.errors.featured_image && <FieldError>{basicInfoForm.errors.featured_image}</FieldError>}
                                    </>
                                ) : (
                                    <div className="relative overflow-visible">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={handleRemoveImage}
                                            className="absolute -top-3 -right-3 z-10 h-7 w-7 rounded-full shadow-md"
                                            title="Hapus gambar"
                                        >
                                            <X className="size-3.5" />
                                        </Button>
                                        <img src={imagePreview.src} alt={imagePreview.name} className="aspect-video w-full rounded-lg border border-border object-cover" />
                                        <div className="mt-2 flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                                                <ImagePlus className="size-4 text-primary" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-foreground">{imagePreview.name}</p>
                                                {imagePreview.size > 0 && <p className="text-xs text-muted-foreground">{formatSize(imagePreview.size)}</p>}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="shrink-0 text-xs text-primary underline underline-offset-2 hover:text-primary/80"
                                            >
                                                Ganti
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Field>

                            {/* Service Display Settings */}
                            <Field>
                                <FieldLabel>Pengaturan Tampilan</FieldLabel>
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                                    <div className="flex items-start gap-4 rounded-lg border border-primary/60 bg-transparent p-4 dark:bg-input/30">
                                        <Switch id="is_published" checked={basicInfoForm.data.is_published} onCheckedChange={(val) => basicInfoForm.setData('is_published', val)} />
                                        <div className="flex-1">
                                            <Label htmlFor="is_published" className="cursor-pointer text-sm font-medium">
                                                Publikasikan Layanan
                                            </Label>
                                            <p className="text-sm text-muted-foreground">Jika aktif, layanan akan tampil dan dapat diakses oleh pengunjung website.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 rounded-lg border border-primary/60 bg-transparent p-4 dark:bg-input/30">
                                        <Switch id="is_featured" checked={basicInfoForm.data.is_featured} onCheckedChange={(val) => basicInfoForm.setData('is_featured', val)} />
                                        <div className="flex-1">
                                            <Label htmlFor="is_featured" className="cursor-pointer text-sm font-medium">
                                                Jadikan Layanan Unggulan
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Layanan akan ditampilkan di bagian khusus "Layanan Unggulan" dan diprioritaskan di halaman utama.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 rounded-lg border border-primary/60 bg-transparent p-4 dark:bg-input/30">
                                        <Switch id="is_popular" checked={basicInfoForm.data.is_popular} onCheckedChange={(val) => basicInfoForm.setData('is_popular', val)} />
                                        <div className="flex-1">
                                            <Label htmlFor="is_popular" className="cursor-pointer text-sm font-medium">
                                                Tandai sebagai Layanan Populer
                                            </Label>
                                            <p className="text-sm text-muted-foreground">Layanan akan diberi penanda populer dan diprioritaskan dalam urutan tampilan.</p>
                                        </div>
                                    </div>
                                </div>
                            </Field>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-4 flex items-center gap-3">
                        <Button type="submit" disabled={basicInfoForm.processing || !hasUnsavedChanges['basic-information']} className="gap-2">
                            {basicInfoForm.processing ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Perubahan'
                            )}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.visit(services.index().url)}>
                            Kembali
                        </Button>
                    </div>
                </form>
            </TabsContent>

            {/*  Tab: Konten  */}
            <TabsContent value="content">
                <form onSubmit={handleSubmitContent}>
                    <div className="w-full rounded-md bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-xl font-bold">Konten Layanan</h2>
                                <p className="mt-0.5 text-sm text-muted-foreground">Kelola pengantar dan konten utama layanan untuk kebutuhan informasi dan optimasi SEO.</p>
                            </div>

                            {/* Service Introduction */}
                            <Field>
                                <FieldLabel>Pengantar Layanan</FieldLabel>
                                <Tiptap content={contentForm.data.introduction} onChange={(html) => contentForm.setData('introduction', html)} />
                                {contentForm.errors.introduction && <FieldError>{contentForm.errors.introduction}</FieldError>}
                            </Field>

                            {/* Service Content */}
                            <Field>
                                <FieldLabel>Konten Pilar</FieldLabel>
                                <Tiptap content={contentForm.data.content} onChange={(html) => contentForm.setData('content', html)} />
                                {contentForm.errors.content && <FieldError>{contentForm.errors.content}</FieldError>}
                            </Field>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-4 flex items-center gap-3">
                        <Button type="submit" disabled={contentForm.processing || !hasUnsavedChanges.content} className="gap-2">
                            {contentForm.processing ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Perubahan'
                            )}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.visit(services.index().url)}>
                            Kembali
                        </Button>
                    </div>
                </form>
            </TabsContent>

            {/*  Tab: Paket Harga  */}
            <TabsContent value="package">
                <form onSubmit={handleSubmitPackages}>
                    <div className="w-full rounded-md bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                        <div className="space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-bold">Paket Harga</h2>
                                    <p className="mt-0.5 text-sm text-muted-foreground">Buat paket harga dengan dokumen/fitur yang berbeda untuk setiap paket</p>
                                </div>
                                <Button type="button" onClick={addPackage} size="sm" className="gap-1.5">
                                    <Plus className="size-4" />
                                    Tambah Paket
                                </Button>
                            </div>

                            {/* {packageForm.data.packages.length > 0 && (
                                <Field>
                                    <FieldLabel>
                                        Paket Harga <span className="text-destructive">*</span>
                                    </FieldLabel>
                                </Field>
                            )} */}

                            {packageForm.data.packages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border py-16 text-muted-foreground">
                                    <p className="text-sm">Belum ada paket harga</p>
                                    <Button type="button" variant="outline" size="sm" onClick={addPackage} className="gap-1.5">
                                        <Plus className="size-4" />
                                        Tambah Paket Pertama
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {packageForm.data.packages.map((pkg, i) => (
                                        <PackageCard
                                            key={pkg._key}
                                            pkg={pkg}
                                            index={i}
                                            onChange={(updated) => updatePackage(pkg._key, updated)}
                                            onDelete={() => deletePackage(pkg._key)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-4 flex items-center gap-3">
                        <Button type="submit" disabled={packageForm.processing || !hasUnsavedChanges.package} className="gap-2">
                            {packageForm.processing ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Perubahan'
                            )}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.visit(services.index().url)}>
                            Kembali
                        </Button>
                    </div>
                </form>
            </TabsContent>
        </Tabs>
    );
}
