import { router, useForm } from '@inertiajs/react';
import { ChevronDown, ChevronUp, Code, Globe, Search, Settings2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import Tiptap from '@/components/tiptap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import services from '@/routes/services';
import { ROBOTS_OPTIONS, SCHEMA_LABELS, SITEMAP_PRIORITY_OPTIONS, type RobotsDirective, type SitemapPriority } from '@/types/service';
import type { ServiceCityPage } from '@/types/service';
import { FaqEditor } from '../../_components/faq-editor';
import { AiCityPageDrawer } from './ai-city-page-drawer';

type TabId = 'content' | 'seo';

type ContentFormData = {
    heading: string;
    introduction: string;
    content: string;
    faq: { question: string; answer: string }[];
    meta_title: string;
    meta_description: string;
    focus_keyword: string;
    robots: RobotsDirective;
    in_sitemap: boolean;
    sitemap_priority: SitemapPriority;
    is_published: boolean;
};

// ============================================================
// SECTION HEADER
// ============================================================
function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
    return (
        <div className="flex items-center gap-3 border-b border-border pb-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="size-4 text-primary" />
            </div>
            <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}

// ============================================================
// CHAR COUNTER
// ============================================================
function CharCounter({ value, max, ideal }: { value: string; max: number; ideal: number }) {
    const length = value.length;
    const color = length > max ? 'text-destructive' : length >= ideal ? 'text-emerald-500' : 'text-muted-foreground';
    const hint = length > max ? 'Terlalu panjang' : length >= ideal ? 'Ideal' : 'Terlalu pendek';

    return (
        <p className={`text-xs ${color}`}>
            {length}/{max} karakter — {hint}
        </p>
    );
}

// ============================================================
// SCHEMA TYPE ROW
// ============================================================
function SchemaTypeRow({ type, schema }: { type: string; schema: unknown | null }) {
    const [open, setOpen] = useState(false);
    const { title, description } = SCHEMA_LABELS[type];
    const hasData = Boolean(schema && typeof schema === 'object' && Object.keys(schema).length > 0);

    return (
        <div className="rounded-lg border border-border">
            <div className="flex items-center justify-between px-4 py-3">
                <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={hasData ? 'default' : 'secondary'}>{hasData ? 'Tersedia' : 'Kosong'}</Badge>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button type="button" variant="secondary" size="sm" className="h-8 w-8" onClick={() => setOpen(!open)} disabled={!hasData}>
                                {open ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Lihat Preview</TooltipContent>
                    </Tooltip>
                </div>
            </div>

            {open && hasData && (
                <div className="border-t border-border px-4 py-3">
                    <pre className="max-h-64 overflow-auto rounded-md bg-primary/10 p-4 text-xs text-foreground dark:bg-muted/40">{JSON.stringify(schema, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

// ============================================================
// EDIT SECTION
// ============================================================

type EditSectionProps = {
    cityPage: ServiceCityPage;
};

export function EditSection({ cityPage }: EditSectionProps) {
    const [activeTab, setActiveTab] = useState<TabId>('content');
    const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

    const form = useForm<ContentFormData>({
        heading: cityPage.heading ?? '',
        introduction: cityPage.introduction ?? '',
        content: cityPage.content ?? '',
        faq: cityPage.faq ?? [],
        meta_title: cityPage.meta_title ?? '',
        meta_description: cityPage.meta_description ?? '',
        focus_keyword: cityPage.focus_keyword ?? '',
        robots: cityPage.robots ?? 'index,follow',
        in_sitemap: cityPage.in_sitemap ?? true,
        sitemap_priority: cityPage.sitemap_priority ?? '0.7',
        is_published: cityPage.is_published ?? false,
    });

    const hasUnsavedChanges: Record<TabId, boolean> = {
        content: form.isDirty,
        seo: form.isDirty,
    };

    const handleTabChange = (value: string) => {
        const newTab = value as TabId;

        if (form.isDirty) {
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

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const toastId = toast.loading('Memproses...', { description: 'Halaman kota sedang diperbarui.' });

        form.patch(services.cityPages.update(cityPage.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', { description: 'Halaman kota berhasil diperbarui.' });
                form.clearErrors();
            },
            onError: (errors) => {
                console.log(errors);
                const msg = Object.values(errors)[0] ?? 'Gagal memperbarui. Periksa kembali data yang diisi.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => toast.dismiss(toastId),
        });
    };

    const handleAiApply = (data: Record<string, unknown>) => {
        if (data.heading !== undefined) form.setData('heading', data.heading as string);
        if (data.introduction !== undefined) form.setData('introduction', data.introduction as string);
        if (data.content !== undefined) form.setData('content', data.content as string);
        if (data.faq !== undefined) form.setData('faq', data.faq as { question: string; answer: string }[]);
        if (data.meta_title !== undefined) form.setData('meta_title', data.meta_title as string);
        if (data.meta_description !== undefined) form.setData('meta_description', data.meta_description as string);
        if (data.focus_keyword !== undefined) form.setData('focus_keyword', data.focus_keyword as string);
    };

    return (
        <>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList>
                    <TabsTrigger value="content">
                        Konten
                        {hasUnsavedChanges.content && <div className="ml-1 h-2 w-2 rounded-full border border-destructive bg-destructive" />}
                    </TabsTrigger>
                    <TabsTrigger value="seo">
                        SEO
                        {hasUnsavedChanges.seo && <div className="ml-1 h-2 w-2 rounded-full border border-destructive bg-destructive" />}
                    </TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit}>
                    {/* ───────────────── Content Section ───────────────── */}
                    <TabsContent value="content" className="space-y-4">
                        <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                            <div className="space-y-4">
                                <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
                                    <div>
                                        <h2 className="text-xl font-semibold">Konten Halaman</h2>

                                        <p className="mt-0.5 text-sm text-muted-foreground">
                                            Kelola konten halaman untuk layanan {cityPage.service?.name} di {cityPage.city?.name}.
                                        </p>
                                    </div>
                                    <Button type="button" variant="secondary" className="w-full md:w-auto" onClick={() => setAiDrawerOpen(true)}>
                                        <Sparkles className="size-4" />
                                        Generate AI
                                    </Button>
                                </div>

                                {/* Heading */}
                                <Field>
                                    <FieldLabel>
                                        Nama <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input
                                        value={form.data.heading}
                                        onChange={(event) => form.setData('heading', event.target.value)}
                                        placeholder={`Jasa ${cityPage.service?.name} di ${cityPage.city?.name}`}
                                        maxLength={100}
                                    />

                                    {form.errors.heading && <FieldError>{form.errors.heading}</FieldError>}
                                </Field>

                                {/* Publikasi */}
                                <div className="flex items-start gap-4 rounded-lg border border-primary bg-transparent p-4 dark:bg-input/30">
                                    <Switch id="is_published" checked={form.data.is_published} onCheckedChange={(val) => form.setData('is_published', val)} />
                                    <div className="flex-1">
                                        <Label htmlFor="is_published" className="cursor-pointer text-sm font-medium">
                                            Publikasikan Halaman
                                        </Label>
                                        <p className="text-sm text-muted-foreground">Jika aktif, halaman akan tampil dan dapat diakses pengunjung.</p>
                                    </div>
                                </div>

                                {/* Introduction */}
                                <Field>
                                    <FieldLabel>Pengantar</FieldLabel>
                                    <Tiptap content={form.data.introduction} onChange={(html) => form.setData('introduction', html)} />
                                    {form.errors.introduction && <FieldError>{form.errors.introduction}</FieldError>}
                                </Field>

                                {/* Content */}
                                <Field>
                                    <FieldLabel>Konten Utama</FieldLabel>
                                    <Tiptap content={form.data.content} onChange={(html) => form.setData('content', html)} />
                                    {form.errors.content && <FieldError>{form.errors.content}</FieldError>}
                                </Field>

                                {/* FAQ */}
                                <Field>
                                    <FieldLabel>FAQ</FieldLabel>
                                    <FaqEditor faqs={form.data.faq} onChange={(faqs) => form.setData('faq', faqs)} />
                                </Field>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                            <Button type="submit" disabled={form.processing || !form.isDirty} className="flex-1 md:w-45 md:flex-none">
                                {form.processing ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan'
                                )}
                            </Button>
                            <Button type="button" variant="secondary" className="flex-1 md:w-45 md:flex-none" onClick={() => router.visit(services.cityPages.index().url)}>
                                Kembali
                            </Button>
                        </div>
                    </TabsContent>

                    {/*  ───────────────── SEO Section ───────────────── */}
                    <TabsContent value="seo">
                        <form onSubmit={handleSubmit}>
                            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                                <div className="space-y-4">
                                    <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
                                        <div>
                                            <h2 className="text-xl font-semibold">Pengaturan SEO</h2>
                                            <p className="mt-0.5 text-sm text-muted-foreground">Kelola meta tags, open graph, dan sitemap untuk halaman layanan ini.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <SectionHeader icon={Search} title="Meta Tags" description="Informasi utama yang dibaca mesin pencari" />

                                            {/* Meta Title */}
                                            <Field>
                                                <FieldLabel>
                                                    Meta Title <span className="text-destructive">*</span>
                                                </FieldLabel>
                                                <Input
                                                    value={form.data.meta_title}
                                                    onChange={(event) => form.setData('meta_title', event.target.value)}
                                                    placeholder={`${cityPage.service?.name} di ${cityPage.city?.name} — ${cityPage.service?.name}`}
                                                    maxLength={80}
                                                />
                                                <CharCounter value={form.data.meta_title} max={70} ideal={55} />
                                                {form.errors.meta_title && <FieldError>{form.errors.meta_title}</FieldError>}
                                            </Field>

                                            {/* Meta Description */}
                                            <Field>
                                                <FieldLabel>Meta Description</FieldLabel>
                                                <Textarea
                                                    value={form.data.meta_description}
                                                    onChange={(event) => form.setData('meta_description', event.target.value)}
                                                    placeholder={`Butuh ${cityPage.service?.name} di ${cityPage.city?.name}? Kami siap membantu...`}
                                                    className="min-h-20 resize-none"
                                                    rows={3}
                                                    maxLength={170}
                                                />
                                                <CharCounter value={form.data.meta_description} max={160} ideal={140} />
                                                {form.errors.meta_description && <FieldError>{form.errors.meta_description}</FieldError>}
                                            </Field>

                                            {/* Focus Keyword */}
                                            <Field>
                                                <FieldLabel>Focus Keyword</FieldLabel>
                                                <Input
                                                    value={form.data.focus_keyword}
                                                    onChange={(event) => form.setData('focus_keyword', event.target.value)}
                                                    placeholder={`${cityPage.service?.name?.toLowerCase()} ${cityPage.city?.name?.toLowerCase()}`}
                                                />
                                                {form.errors.focus_keyword && <FieldError>{form.errors.focus_keyword}</FieldError>}
                                            </Field>
                                        </div>

                                        <div className="space-y-4">
                                            <SectionHeader icon={Settings2} title="Indexing & Sitemap" description="Kontrol bagaimana mesin pencari mengindex halaman ini" />

                                            {/* Robots Directive */}
                                            <Field>
                                                <FieldLabel>Robots Directive</FieldLabel>
                                                <Select value={form.data.robots} onValueChange={(value) => form.setData('robots', value as RobotsDirective)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectLabel>Robots</SelectLabel>
                                                            {ROBOTS_OPTIONS.map((item) => (
                                                                <SelectItem key={item.value} value={item.value}>
                                                                    {item.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                                {form.errors.robots && <FieldError>{form.errors.robots}</FieldError>}
                                            </Field>

                                            <div className="flex items-center justify-between rounded-lg border border-primary bg-input/30 p-4">
                                                <div>
                                                    <p className="text-sm font-medium">Masukkan ke Sitemap</p>
                                                    <p className="text-sm text-muted-foreground">Halaman ini akan disertakan dalam sitemap XML</p>
                                                </div>
                                                <Switch checked={form.data.in_sitemap} onCheckedChange={(value) => form.setData('in_sitemap', value)} />
                                            </div>

                                            {/* Sitemap Priority */}
                                            {form.data.in_sitemap && (
                                                <Field>
                                                    <FieldLabel>Sitemap Priority</FieldLabel>
                                                    <Select
                                                        value={form.data.sitemap_priority}
                                                        onValueChange={(value) => form.setData('sitemap_priority', value as SitemapPriority)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectLabel>Priority</SelectLabel>
                                                                {SITEMAP_PRIORITY_OPTIONS.map((item) => (
                                                                    <SelectItem key={item.value} value={item.value}>
                                                                        {item.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                    {form.errors.sitemap_priority && <FieldError>{form.errors.sitemap_priority}</FieldError>}
                                                </Field>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <SectionHeader icon={Code} title="Schema Markup" description="JSON-LD otomatis di-generate dari data halaman" />

                                            <div className="space-y-2">
                                                {(['webpage', 'breadcrumb', 'faq'] as const).map((type) => (
                                                    <SchemaTypeRow key={type} type={type} schema={cityPage.schema_markup?.[type] ?? null} />
                                                ))}
                                            </div>

                                            <p className="text-xs text-muted-foreground">Schema JSON-LD di-generate otomatis saat konten atau SEO diperbarui.</p>
                                        </div>

                                        {(form.data.meta_title || form.data.meta_description) && (
                                            <div className="space-y-4">
                                                <SectionHeader icon={Globe} title="Preview Google" description="Perkiraan tampilan di hasil pencarian Google" />

                                                <div className="rounded-lg border border-border bg-muted/20 p-4">
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        https://mitrajasalegalitas.co.id/layanan/{cityPage.service?.slug}/di-{cityPage.city?.slug}
                                                    </p>
                                                    <p className="mt-1 truncate text-lg font-medium text-blue-600 dark:text-blue-400">{form.data.meta_title || 'Meta Title...'}</p>
                                                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                                                        {form.data.meta_description || 'Meta description akan tampil di sini...'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="mt-4 flex items-center gap-2">
                            <Button type="submit" disabled={form.processing || !form.isDirty} className="flex-1 md:w-45 md:flex-none">
                                {form.processing ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan'
                                )}
                            </Button>
                            <Button type="button" variant="secondary" className="flex-1 md:w-45 md:flex-none" onClick={() => router.visit(services.cityPages.index().url)}>
                                Kembali
                            </Button>
                        </div>
                    </TabsContent>
                </form>
            </Tabs>

            <AiCityPageDrawer open={aiDrawerOpen} onOpenChange={setAiDrawerOpen} cityPageId={cityPage.id} onApply={handleAiApply} />
        </>
    );
}
