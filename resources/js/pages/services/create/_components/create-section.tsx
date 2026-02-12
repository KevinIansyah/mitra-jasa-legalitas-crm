import { useForm } from '@inertiajs/react';
import { ImagePlus, Plus, Sparkles, TableOfContents, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
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
import services from '@/routes/services';
import type { ServiceCategory } from '@/types/service';
import { FaqCard, type LocalFaq } from './faq-card';
import { LegalBasisCard, type LocalLegalBasis } from './legal-basis-card';
import { PackageCard, type LocalPackage } from './package-card';
import { ProcessStepCard, type LocalProcessStep } from './process-step-card';
import { RequirementCard, type LocalRequirementCategory } from './requirement-card';

type FormData = {
    service_category_id: number | '';
    name: string;
    slug: string;
    short_description: string;
    introduction: string;
    content: string;
    featured_image: File | null;
    is_published: boolean;
    is_featured: boolean;
    is_popular: boolean;
    packages: LocalPackage[];
    faqs: LocalFaq[];
    legal_bases: LocalLegalBasis[];
    requirement_categories: LocalRequirementCategory[];
    process_steps: LocalProcessStep[];
};

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
    features: [],
});

const makeFaq = (sort_order: number): LocalFaq => ({
    _key: uid(),
    question: '',
    answer: '',
    sort_order,
});

const makeLegalBasis = (sort_order: number): LocalLegalBasis => ({
    _key: uid(),
    document_type: 'Undang-Undang (UU)',
    document_number: '',
    title: '',
    issued_date: '',
    url: '',
    description: '',
    sort_order,
});

const makeRequirementCategory = (sort_order: number): LocalRequirementCategory => ({
    _key: uid(),
    name: '',
    description: '',
    sort_order,
    requirements: [],
});

const makeProcessStep = (sort_order: number): LocalProcessStep => ({
    _key: uid(),
    title: '',
    description: '',
    duration: '',
    duration_days: null,
    required_documents: [],
    notes: '',
    icon: '',
    sort_order,
});

const MAX_IMAGE_SIZE = 1 * 1024 * 1024;

type CreateSectionProps = {
    categories: ServiceCategory[];
};

export function CreateSection({ categories }: CreateSectionProps) {
    const [imagePreview, setImagePreview] = useState<{ src: string; name: string; size: number } | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        service_category_id: '',
        name: '',
        slug: '',
        short_description: '',
        introduction: '',
        content: '',
        featured_image: null,
        is_published: false,
        is_featured: false,
        is_popular: false,
        packages: [],
        faqs: [],
        legal_bases: [],
        requirement_categories: [],
        process_steps: [],
    });

    const handleFile = (file: File | undefined) => {
        if (!file || !file.type.startsWith('image/')) return;
        if (file.size > MAX_IMAGE_SIZE) {
            setImageError(`Ukuran file terlalu besar (${formatSize(file.size)}). Maksimal 1 MB.`);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
        setImageError(null);
        setData('featured_image', file);
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
        setData('featured_image', null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Generic move handlers
    const createMoveHandlers = <T extends { sort_order: number }>(items: T[], setItems: (items: T[]) => void) => ({
        moveUp: (index: number) => {
            if (index === 0) return;
            const newItems = [...items];
            [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
            const reindexed = newItems.map((item, idx) => ({ ...item, sort_order: idx }));
            setItems(reindexed);
        },
        moveDown: (index: number) => {
            if (index === items.length - 1) return;
            const newItems = [...items];
            [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
            const reindexed = newItems.map((item, idx) => ({ ...item, sort_order: idx }));
            setItems(reindexed);
        },
    });

    // Package handlers
    const addPackage = () => setData('packages', [...data.packages, makePackage(data.packages.length)]);
    const updatePackage = (_key: string, updated: LocalPackage) =>
        setData(
            'packages',
            data.packages.map((p) => (p._key === _key ? updated : p)),
        );
    const deletePackage = (_key: string) =>
        setData(
            'packages',
            data.packages.filter((p) => p._key !== _key),
        );
    const packageHandlers = createMoveHandlers(data.packages, (packages) => setData('packages', packages));

    // FAQ handlers
    const addFaq = () => setData('faqs', [...data.faqs, makeFaq(data.faqs.length)]);
    const updateFaq = (_key: string, updated: LocalFaq) =>
        setData(
            'faqs',
            data.faqs.map((f) => (f._key === _key ? updated : f)),
        );
    const deleteFaq = (_key: string) => {
        const filtered = data.faqs.filter((f) => f._key !== _key);
        const reindexed = filtered.map((f, idx) => ({ ...f, sort_order: idx }));
        setData('faqs', reindexed);
    };
    const faqHandlers = createMoveHandlers(data.faqs, (faqs) => setData('faqs', faqs));

    // Legal Basis handlers
    const addLegalBasis = () => setData('legal_bases', [...data.legal_bases, makeLegalBasis(data.legal_bases.length)]);
    const updateLegalBasis = (_key: string, updated: LocalLegalBasis) =>
        setData(
            'legal_bases',
            data.legal_bases.map((l) => (l._key === _key ? updated : l)),
        );
    const deleteLegalBasis = (_key: string) =>
        setData(
            'legal_bases',
            data.legal_bases.filter((l) => l._key !== _key),
        );
    const legalBasisHandlers = createMoveHandlers(data.legal_bases, (legal_bases) => setData('legal_bases', legal_bases));

    // Requirement handlers
    const addRequirementCategory = () => setData('requirement_categories', [...data.requirement_categories, makeRequirementCategory(data.requirement_categories.length)]);
    const updateRequirementCategory = (_key: string, updated: LocalRequirementCategory) =>
        setData(
            'requirement_categories',
            data.requirement_categories.map((r) => (r._key === _key ? updated : r)),
        );
    const deleteRequirementCategory = (_key: string) =>
        setData(
            'requirement_categories',
            data.requirement_categories.filter((r) => r._key !== _key),
        );
    const requirementCategoryHandlers = createMoveHandlers(data.requirement_categories, (requirement_categories) => setData('requirement_categories', requirement_categories));

    // Process Step handlers
    const addProcessStep = () => setData('process_steps', [...data.process_steps, makeProcessStep(data.process_steps.length)]);
    const updateProcessStep = (_key: string, updated: LocalProcessStep) =>
        setData(
            'process_steps',
            data.process_steps.map((p) => (p._key === _key ? updated : p)),
        );
    const deleteProcessStep = (_key: string) =>
        setData(
            'process_steps',
            data.process_steps.filter((p) => p._key !== _key),
        );
    const processStepHandlers = createMoveHandlers(data.process_steps, (process_steps) => setData('process_steps', process_steps));

    // Submit handlers
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(services.store().url, {
            forceFormData: true,
            onError: () => {
                toast.error('Gagal', {
                    description: 'Gagal menambahkan data layanan. Silakan periksa kembali data layanan yang diisi.',
                });
            },
        });
    };

    // Reset handlers
    const handleBatal = () => {
        reset();
        setImagePreview(null);
        setImageError(null);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Tabs defaultValue="basic-information" className="w-full">
                <TabsList>
                    <TabsTrigger value="basic-information">Informasi Dasar</TabsTrigger>
                    <TabsTrigger value="content">Konten</TabsTrigger>
                    <TabsTrigger value="package">Paket Harga</TabsTrigger>
                    <TabsTrigger value="faq">FAQ</TabsTrigger>
                    <TabsTrigger value="legal-basis">Dasar Hukum</TabsTrigger>
                    <TabsTrigger value="requirement">Persyaratan</TabsTrigger>
                    <TabsTrigger value="timeline">Tahapan</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>

                {/* Tab: Informasi Dasar */}
                <TabsContent value="basic-information">
                    <div className="w-full rounded-md bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                        <div className="space-y-6">
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
                                        autoFocus
                                        placeholder="Masukkan nama layanan"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    {errors.name && <FieldError>{errors.name}</FieldError>}
                                </Field>

                                <Field>
                                    {/* Service Slug */}
                                    <FieldLabel htmlFor="slug">Slug</FieldLabel>
                                    <Input
                                        id="slug"
                                        type="text"
                                        name="slug"
                                        placeholder="Masukkan slug, contoh: slug-kategori-layanan"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                    />
                                    {errors.slug && <FieldError>{errors.slug}</FieldError>}
                                </Field>

                                <Field>
                                    {/* Service Category */}
                                    <FieldLabel htmlFor="category">
                                        Kategori <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Select
                                        required
                                        value={data.service_category_id ? String(data.service_category_id) : ''}
                                        onValueChange={(val) => setData('service_category_id', Number(val))}
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
                                    {errors.service_category_id && <FieldError>{errors.service_category_id}</FieldError>}
                                </Field>
                            </div>

                            {/* Short Description */}
                            <Field>
                                <FieldLabel htmlFor="short_description">Deskripsi Singkat</FieldLabel>
                                <Textarea
                                    id="short_description"
                                    className="min-h-24"
                                    placeholder="Tambahkan deskripsi singkat layanan"
                                    value={data.short_description}
                                    onChange={(e) => setData('short_description', e.target.value)}
                                />
                                {errors.short_description && <FieldError>{errors.short_description}</FieldError>}
                            </Field>

                            {/* Featured Image */}
                            <Field>
                                <FieldLabel htmlFor="featured_image">Gambar Utama</FieldLabel>
                                <Alert className="border-primary bg-primary/20">
                                    <TableOfContents />
                                    <AlertTitle>Panduan Ukuran Gambar Ideal</AlertTitle>
                                    <AlertDescription>
                                        <ul className="list-inside list-disc space-y-1.5 text-sm">
                                            <li>
                                                <strong>Hero Background:</strong> 1920x1080px (16:9 aspect ratio)
                                                <br />
                                                <span className="ml-5">Untuk background section hero dengan gradient overlay</span>
                                            </li>
                                            <li>
                                                <strong>Sidebar Card:</strong> 800x600px (4:3) atau 800x450px (16:9)
                                                <br />
                                                <span className="ml-5">Untuk card vertikal di sidebar proposal</span>
                                            </li>
                                            <li>
                                                <strong>Format & Kualitas:</strong> JPG/PNG, maksimal 1MB
                                                <br />
                                                <span className="ml-5">Kompresi 80-90% untuk performa optimal</span>
                                            </li>
                                            <li>
                                                <strong>Tips:</strong> Gunakan gambar profesional terkait legal/bisnis
                                                <br />
                                                <span className="ml-5">Hindari gambar stock yang terlalu umum</span>
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
                                        {errors.featured_image && <FieldError>{errors.featured_image}</FieldError>}
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
                                                <p className="text-xs text-muted-foreground">{formatSize(imagePreview.size)}</p>
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

                            {/* Apperance Settings */}
                            <Field>
                                <FieldLabel>Pengaturan Tampilan</FieldLabel>
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                                    <div className="flex items-start gap-4 rounded-lg border border-primary/60 bg-transparent p-4 dark:bg-input/30">
                                        <Switch id="is_published" checked={data.is_published} onCheckedChange={(val) => setData('is_published', val)} />
                                        <div className="flex-1">
                                            <Label htmlFor="is_published" className="cursor-pointer text-sm font-medium">
                                                Publikasikan Layanan
                                            </Label>
                                            <p className="text-sm text-muted-foreground">Jika aktif, layanan akan tampil dan dapat diakses oleh pengunjung website.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 rounded-lg border border-primary/60 bg-transparent p-4 dark:bg-input/30">
                                        <Switch id="is_featured" checked={data.is_featured} onCheckedChange={(val) => setData('is_featured', val)} />
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
                                        <Switch id="is_popular" checked={data.is_popular} onCheckedChange={(val) => setData('is_popular', val)} />
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
                </TabsContent>

                {/* Tab: Konten */}
                <TabsContent value="content">
                    <div className="w-full rounded-md bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-bold">Konten Layanan</h2>
                                    <p className="mt-0.5 text-sm text-muted-foreground">Kelola pengantar dan konten utama layanan untuk kebutuhan informasi dan optimasi SEO.</p>
                                </div>
                                <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1.5" disabled>
                                    <Sparkles className="size-3.5" />
                                    AI Generate
                                </Button>
                            </div>

                            {/* Introduction */}
                            <Field>
                                <FieldLabel>Pengantar Layanan</FieldLabel>
                                <Alert className="border-primary bg-primary/20">
                                    <TableOfContents />
                                    <AlertTitle>Panduan Penulisan Ideal</AlertTitle>
                                    <AlertDescription>2-3 paragraf pembuka yang merangkum keseluruhan layanan (200-300 kata)</AlertDescription>
                                </Alert>
                                <Tiptap content={data.introduction} onChange={(html) => setData('introduction', html)} />
                                {errors.introduction && <FieldError>{errors.introduction}</FieldError>}
                            </Field>

                            {/* Content */}
                            <Field>
                                <FieldLabel>Konten Pilar</FieldLabel>
                                <Alert className="border-primary bg-primary/20">
                                    <TableOfContents />
                                    <AlertTitle>Panduan Penulisan Ideal</AlertTitle>
                                    <AlertDescription>
                                        Konten utama untuk SEO (minimal 1000 kata, ideal 1200-1500 kata). Gunakan HTML formatting. Konten ini menjadi tulang punggung SEO halaman.
                                        Gunakan heading (h2, h3), list, dan anchor links ke tab struktur untuk navigasi.
                                    </AlertDescription>
                                </Alert>
                                <Tiptap content={data.content} onChange={(html) => setData('content', html)} />
                                {errors.content && <FieldError>{errors.content}</FieldError>}
                            </Field>
                        </div>
                    </div>
                </TabsContent>

                {/*  Tab: Package Pricing */}
                <TabsContent value="package">
                    <div className="w-full rounded-md bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
                                <div>
                                    <h2 className="text-xl font-bold">Paket Harga</h2>
                                    <p className="mt-0.5 text-sm text-muted-foreground">Kelola paket harga dengan dokumen/fitur yang berbeda untuk setiap paket</p>
                                </div>
                                <div className="flex w-full items-center gap-2 md:w-auto">
                                    <Button type="button" variant="outline" size="sm" className="flex-1 shrink-0 gap-1.5 md:flex-0" disabled>
                                        <Sparkles className="size-3.5" />
                                        AI Generate
                                    </Button>
                                    <Button type="button" onClick={addPackage} size="sm" className="flex-1 gap-1.5 md:flex-0">
                                        <Plus className="size-4" />
                                        Tambah Paket
                                    </Button>
                                </div>
                            </div>

                            {data.packages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border py-16 text-muted-foreground">
                                    <p className="text-sm">Belum ada paket harga</p>
                                    <Button type="button" variant="outline" size="sm" onClick={addPackage} className="gap-1.5">
                                        <Plus className="size-4" />
                                        Tambah Paket Pertama
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {data.packages.map((pkg, i) => (
                                        <PackageCard
                                            key={pkg._key}
                                            pkg={pkg}
                                            index={i}
                                            onChange={(updated) => updatePackage(pkg._key, updated)}
                                            onDelete={() => deletePackage(pkg._key)}
                                            onMoveUp={() => packageHandlers.moveUp(i)}
                                            onMoveDown={() => packageHandlers.moveDown(i)}
                                            totalItems={data.packages.length}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* Tab: FAQ */}
                <TabsContent value="faq">
                    <div className="w-full rounded-md bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                        <div className="space-y-6">
                            <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
                                <div>
                                    <h2 className="text-xl font-bold">FAQ (Frequently Asked Questions)</h2>
                                    <p className="mt-0.5 text-sm text-muted-foreground">Kelola pertanyaan yang sering diajukan terkait layanan ini.</p>
                                </div>
                                <Button type="button" onClick={addFaq} size="sm" className="w-full gap-1.5 md:w-auto">
                                    <Plus className="size-4" />
                                    Tambah FAQ
                                </Button>
                            </div>

                            {data.faqs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border py-16 text-muted-foreground">
                                    <p className="text-sm">Belum ada FAQ</p>
                                    <Button type="button" variant="outline" size="sm" onClick={addFaq} className="gap-1.5">
                                        <Plus className="size-4" />
                                        Tambah FAQ Pertama
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {data.faqs.map((faq, i) => (
                                        <FaqCard
                                            key={faq._key}
                                            faq={faq}
                                            index={i}
                                            onChange={(updated) => updateFaq(faq._key, updated)}
                                            onDelete={() => deleteFaq(faq._key)}
                                            onMoveUp={() => faqHandlers.moveUp(i)}
                                            onMoveDown={() => faqHandlers.moveDown(i)}
                                            totalItems={data.faqs.length}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* Tab: Legal Basis */}
                <TabsContent value="legal-basis">
                    <div className="w-full rounded-md bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                        <div className="space-y-6">
                            <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
                                <div>
                                    <h2 className="text-xl font-bold">Dasar Hukum</h2>
                                    <p className="mt-0.5 text-sm text-muted-foreground">Kelola referensi peraturan dan undang-undang yang menjadi dasar layanan.</p>
                                </div>
                                <Button type="button" onClick={addLegalBasis} size="sm" className="w-full gap-1.5 md:w-auto">
                                    <Plus className="size-4" />
                                    Tambah Dasar Hukum
                                </Button>
                            </div>

                            {data.legal_bases.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border py-16 text-muted-foreground">
                                    <p className="text-sm">Belum ada dasar hukum</p>
                                    <Button type="button" variant="outline" size="sm" onClick={addLegalBasis} className="gap-1.5">
                                        <Plus className="size-4" />
                                        Tambah Dasar Hukum Pertama
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {data.legal_bases.map((legal, i) => (
                                        <LegalBasisCard
                                            key={legal._key}
                                            legalBasis={legal}
                                            index={i}
                                            onChange={(updated) => updateLegalBasis(legal._key, updated)}
                                            onDelete={() => deleteLegalBasis(legal._key)}
                                            onMoveUp={() => legalBasisHandlers.moveUp(i)}
                                            onMoveDown={() => legalBasisHandlers.moveDown(i)}
                                            totalItems={data.legal_bases.length}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* Tab: Requirements */}
                <TabsContent value="requirement">
                    <div className="w-full rounded-md bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                        <div className="space-y-6">
                            <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
                                <div>
                                    <h2 className="text-xl font-bold">Persyaratan</h2>
                                    <p className="mt-0.5 text-sm text-muted-foreground">Kelola kategori dan daftar persyaratan dokumen yang dibutuhkan.</p>
                                </div>
                                <Button type="button" onClick={addRequirementCategory} size="sm" className="w-full gap-1.5 md:w-auto">
                                    <Plus className="size-4" />
                                    Tambah Kategori
                                </Button>
                            </div>

                            {data.requirement_categories.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border py-16 text-muted-foreground">
                                    <p className="text-sm">Belum ada kategori persyaratan</p>
                                    <Button type="button" variant="outline" size="sm" onClick={addRequirementCategory} className="gap-1.5">
                                        <Plus className="size-4" />
                                        Tambah Kategori Pertama
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {data.requirement_categories.map((cat, i) => (
                                        <RequirementCard
                                            key={cat._key}
                                            category={cat}
                                            index={i}
                                            onChange={(updated) => updateRequirementCategory(cat._key, updated)}
                                            onDelete={() => deleteRequirementCategory(cat._key)}
                                            onMoveUp={() => requirementCategoryHandlers.moveUp(i)}
                                            onMoveDown={() => requirementCategoryHandlers.moveDown(i)}
                                            totalItems={data.requirement_categories.length}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* Tab: Process Steps */}
                <TabsContent value="timeline">
                    <div className="w-full rounded-md bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                        <div className="space-y-6">
                            <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
                                <div>
                                    <h2 className="text-xl font-bold">Tahapan Proses</h2>
                                    <p className="mt-0.5 text-sm text-muted-foreground">Kelola langkah-langkah proses pengerjaan layanan secara berurutan.</p>
                                </div>
                                <Button type="button" onClick={addProcessStep} size="sm" className="w-full gap-1.5 md:w-auto">
                                    <Plus className="size-4" />
                                    Tambah Tahap
                                </Button>
                            </div>

                            {data.process_steps.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border py-16 text-muted-foreground">
                                    <p className="text-sm">Belum ada tahapan proses</p>
                                    <Button type="button" variant="outline" size="sm" onClick={addProcessStep} className="gap-1.5">
                                        <Plus className="size-4" />
                                        Tambah Tahap Pertama
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {data.process_steps.map((step, i) => (
                                        <ProcessStepCard
                                            key={step._key}
                                            step={step}
                                            index={i}
                                            onChange={(updated) => updateProcessStep(step._key, updated)}
                                            onDelete={() => deleteProcessStep(step._key)}
                                            onMoveUp={() => processStepHandlers.moveUp(i)}
                                            onMoveDown={() => processStepHandlers.moveDown(i)}
                                            totalItems={data.process_steps.length}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Footer Actions  */}
            <div className="mt-4 flex items-center gap-3">
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
                <Button type="button" variant="outline" onClick={handleBatal} disabled={processing}>
                    Batal
                </Button>
            </div>
        </form>
    );
}
