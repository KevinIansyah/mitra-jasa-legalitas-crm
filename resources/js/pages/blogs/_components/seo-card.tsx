import { ChevronDown, ChevronUp, Code, FilePlus, Globe, ImagePlus, Pencil, Search, Settings2, Share2, Trash, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { formatSize, readImageAsDataURL, validateImageFile } from '@/lib/service';
import {
    ROBOTS_OPTIONS,
    SCHEMA_LABELS,
    SITEMAP_CHANGEFREQ_OPTIONS,
    SITEMAP_PRIORITY_OPTIONS,
    TWITTER_CARD_OPTIONS,
    type RobotsDirective,
    type SitemapChangefreq,
    type SitemapPriority,
    type TwitterCard,
} from '@/types/blogs';

const R2_PUBLIC_URL = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL;

export type LocalBlogSeo = {
    meta_title: string;
    meta_description: string;
    canonical_url: string;
    focus_keyword: string;
    secondary_keywords: string[];
    og_title: string;
    og_description: string;
    og_image: File | null;
    og_image_url?: string | null;
    remove_og_image?: boolean;
    twitter_card: TwitterCard;
    twitter_title: string;
    twitter_description: string;
    twitter_image: File | null;
    twitter_image_url?: string | null;
    remove_twitter_image?: boolean;
    robots: RobotsDirective;
    in_sitemap: boolean;
    sitemap_priority: SitemapPriority;
    sitemap_changefreq: SitemapChangefreq;
};

export const defaultSeo = (): LocalBlogSeo => ({
    meta_title: '',
    meta_description: '',
    canonical_url: '',
    focus_keyword: '',
    secondary_keywords: [],
    og_title: '',
    og_description: '',
    og_image: null,
    og_image_url: null,
    remove_og_image: false,
    twitter_card: 'summary_large_image',
    twitter_title: '',
    twitter_description: '',
    twitter_image: null,
    twitter_image_url: null,
    remove_twitter_image: false,
    robots: 'index,follow',
    in_sitemap: true,
    sitemap_priority: '0.7',
    sitemap_changefreq: 'monthly',
});

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
    const len = value.length;
    const color = len > max ? 'text-destructive' : len >= ideal ? 'text-emerald-500' : 'text-muted-foreground';
    const hint = len > max ? 'Terlalu panjang' : len >= ideal ? 'Ideal' : 'Terlalu pendek';
    return (
        <p className={`text-xs ${color}`}>
            {len}/{max} karakter - {hint}
        </p>
    );
}

// ============================================================
// IMAGE UPLOAD
// ============================================================
function ImageUploadSmall({
    label,
    hint,
    currentUrl,
    externalFile,
    onChange,
    onRemove,
    errors,
}: {
    label: string;
    hint?: string;
    currentUrl?: string | null;
    externalFile?: File | null;
    onChange: (file: File) => void;
    onRemove: () => void;
    errors?: string;
}) {
    const resolvedUrl = currentUrl ? (currentUrl.startsWith('http') ? currentUrl : `${R2_PUBLIC_URL}/${currentUrl}`) : null;

    const [preview, setPreview] = useState<{ src: string; name: string; size: number } | null>(
        resolvedUrl ? { src: resolvedUrl, name: currentUrl!.split('/').pop() || 'image', size: 0 } : null,
    );
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!externalFile) return;
        readImageAsDataURL(externalFile).then((src) => {
            setPreview({ src, name: externalFile.name, size: externalFile.size });
        });
    }, [externalFile]);

    const handleFile = async (file: File | undefined) => {
        if (!file) return;
        const err = validateImageFile(file);
        if (err) {
            setError(err);
            if (ref.current) ref.current.value = '';
            return;
        }
        setError(null);
        onChange(file);
        const src = await readImageAsDataURL(file);
        setPreview({ src, name: file.name, size: file.size });
    };

    const handleRemove = () => {
        setPreview(null);
        setError(null);
        onRemove();
        if (ref.current) ref.current.value = '';
    };

    return (
        <Field>
            <FieldLabel>{label}</FieldLabel>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            <input ref={ref} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />

            {!preview ? (
                <>
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={() => ref.current?.click()}
                        onKeyDown={(e) => e.key === 'Enter' && ref.current?.click()}
                        onDragEnter={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={(e) => {
                            e.preventDefault();
                            if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            handleFile(e.dataTransfer.files[0]);
                        }}
                        className={[
                            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors select-none',
                            error ? 'border-destructive bg-destructive/5' : isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary hover:bg-muted/40',
                        ].join(' ')}
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                            <FilePlus className="size-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">{isDragging ? 'Lepaskan file di sini!' : 'Klik untuk unggah atau seret & lepas'}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                PNG · JPG · WEBP · <span className="text-primary">Maks. 5 MB</span>
                            </p>
                        </div>
                    </div>
                    {error && <FieldError>{error}</FieldError>}
                    {errors && <FieldError>{errors}</FieldError>}
                </>
            ) : (
                <div className="space-y-2">
                    <div className="flex h-auto w-full justify-center overflow-hidden rounded-lg border border-border bg-black">
                        <img src={preview.src} alt={preview.name} className="h-full w-full object-cover object-center md:w-1/2 lg:w-[30vw]" />
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-primary bg-input/30 px-3 py-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                            <ImagePlus className="size-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{preview.name}</p>
                            {preview.size > 0 && <p className="text-xs text-muted-foreground">{formatSize(preview.size)}</p>}
                        </div>
                        <div className="space-x-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button type="button" variant="secondary" size="sm" className="h-8 w-8" onClick={() => ref.current?.click()}>
                                        <Pencil className="size-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Ganti File</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button type="button" variant="destructive" size="sm" className="h-8 w-8" onClick={handleRemove}>
                                        <Trash className="size-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Hapus File</TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                    {error && <FieldError>{error}</FieldError>}
                    {errors && <FieldError>{errors}</FieldError>}
                </div>
            )}
        </Field>
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
// SEO CARD
// ============================================================
type SeoCardProps = {
    seo: LocalBlogSeo;
    onChange: (seo: LocalBlogSeo) => void;
    errors?: Record<string, string>;
    schemaMarkup?: Record<string, unknown> | null;
};

export function SeoCard({ seo, onChange, errors = {}, schemaMarkup }: SeoCardProps) {
    const [keywordInput, setKeywordInput] = useState('');

    const update = (patch: Partial<LocalBlogSeo>) => onChange({ ...seo, ...patch });

    const addKeyword = () => {
        const trimmed = keywordInput.trim();
        if (!trimmed || seo.secondary_keywords.includes(trimmed)) return;
        update({ secondary_keywords: [...seo.secondary_keywords, trimmed] });
        setKeywordInput('');
    };

    const removeKeyword = (kw: string) => update({ secondary_keywords: seo.secondary_keywords.filter((k) => k !== kw) });

    const handleMetaTitleChange = (val: string) => {
        update({
            meta_title: val,
            og_title: seo.og_title === '' ? val : seo.og_title,
            twitter_title: seo.twitter_title === '' ? val : seo.twitter_title,
        });
    };

    const handleMetaDescChange = (val: string) => {
        update({
            meta_description: val,
            og_description: seo.og_description === '' ? val : seo.og_description,
            twitter_description: seo.twitter_description === '' ? val : seo.twitter_description,
        });
    };

    return (
        <div className="space-y-8">
            {/* ───────────────── Meta Tags ───────────────── */}
            <div className="space-y-4">
                <SectionHeader icon={Search} title="Meta Tags" description="Informasi utama yang dibaca mesin pencari" />

                <Field>
                    <FieldLabel>
                        Meta Title <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                        value={seo.meta_title}
                        onChange={(e) => handleMetaTitleChange(e.target.value)}
                        placeholder="Contoh: Jasa Pendirian PT Surabaya Profesional & Terpercaya"
                        maxLength={80}
                    />
                    <CharCounter value={seo.meta_title} max={70} ideal={55} />
                    {errors['seo.meta_title'] && <FieldError>{errors['seo.meta_title']}</FieldError>}
                </Field>

                <Field>
                    <FieldLabel>Meta Description</FieldLabel>
                    <Textarea
                        value={seo.meta_description}
                        onChange={(e) => handleMetaDescChange(e.target.value)}
                        placeholder="Contoh: Layanan pendirian PT profesional di Surabaya. Proses cepat, harga terjangkau, didampingi konsultan berpengalaman."
                        className="min-h-20 resize-none"
                        rows={3}
                        maxLength={170}
                    />
                    <CharCounter value={seo.meta_description} max={160} ideal={140} />
                    {errors['seo.meta_description'] && <FieldError>{errors['seo.meta_description']}</FieldError>}
                </Field>

                <Field>
                    <FieldLabel>Canonical URL</FieldLabel>
                    <Input
                        value={seo.canonical_url}
                        onChange={(e) => update({ canonical_url: e.target.value })}
                        placeholder="https://mitrajasalegalitas.co.id/layanan/jasa-pendirian-pt"
                    />
                    <p className="text-xs text-muted-foreground">Kosongkan jika menggunakan URL default halaman</p>
                    {errors['seo.canonical_url'] && <FieldError>{errors['seo.canonical_url']}</FieldError>}
                </Field>
            </div>

            {/* ───────────────── Keywords ───────────────── */}
            <div className="space-y-4">
                <SectionHeader icon={Search} title="Keyword" description="Kata kunci target untuk optimasi SEO" />

                <Field>
                    <FieldLabel>Focus Keyword</FieldLabel>
                    <Input value={seo.focus_keyword} onChange={(e) => update({ focus_keyword: e.target.value })} placeholder="Contoh: jasa pendirian PT Surabaya" />
                    <p className="text-xs text-muted-foreground">Satu kata kunci utama yang paling ingin di-ranking</p>
                    {errors['seo.focus_keyword'] && <FieldError>{errors['seo.focus_keyword']}</FieldError>}
                </Field>

                <Field>
                    <FieldLabel>Secondary Keywords</FieldLabel>
                    {seo.secondary_keywords.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2">
                            {seo.secondary_keywords.map((kw) => (
                                <Badge key={kw} variant="secondary" className="gap-1.5 pr-1.5">
                                    {kw}
                                    <button type="button" onClick={() => removeKeyword(kw)} className="rounded-full hover:text-destructive">
                                        <X className="size-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                    <Input
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                        placeholder="Ketik keyword lalu Enter"
                    />
                    <p className="text-xs text-muted-foreground">Tekan Enter untuk menambahkan keyword</p>
                    {errors['seo.secondary_keywords'] && <FieldError>{errors['seo.secondary_keywords']}</FieldError>}
                </Field>
            </div>

            {/* ───────────────── Open Graph ───────────────── */}
            <div className="space-y-4">
                <SectionHeader icon={Share2} title="Open Graph" description="Tampilan saat dibagikan di Facebook, WhatsApp, LinkedIn" />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field>
                        <FieldLabel>OG Title</FieldLabel>
                        <Input value={seo.og_title} onChange={(e) => update({ og_title: e.target.value })} placeholder="Otomatis dari Meta Title jika kosong" maxLength={95} />
                        {errors['seo.og_title'] && <FieldError>{errors['seo.og_title']}</FieldError>}
                    </Field>
                    <Field>
                        <FieldLabel>OG Description</FieldLabel>
                        <Input
                            value={seo.og_description}
                            onChange={(e) => update({ og_description: e.target.value })}
                            placeholder="Otomatis dari Meta Description jika kosong"
                            maxLength={200}
                        />
                        {errors['seo.og_description'] && <FieldError>{errors['seo.og_description']}</FieldError>}
                    </Field>
                </div>

                <ImageUploadSmall
                    label="OG Image"
                    hint="Rekomendasi: 1200×630px - ditampilkan saat halaman dibagikan"
                    currentUrl={seo.og_image_url}
                    externalFile={seo.og_image}
                    onChange={(file) => update({ og_image: file })}
                    onRemove={() => update({ remove_og_image: true, og_image: null, og_image_url: null })}
                    errors={errors['seo.og_image']}
                />
            </div>

            {/* ───────────────── Twitter Card ───────────────── */}
            <div className="space-y-4">
                <SectionHeader icon={Share2} title="Twitter / X Card" description="Tampilan saat dibagikan di Twitter / X" />

                <Field>
                    <FieldLabel>Twitter Card Type</FieldLabel>
                    <Select value={seo.twitter_card} onValueChange={(val) => update({ twitter_card: val as TwitterCard })}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Tipe Card</SelectLabel>
                                {TWITTER_CARD_OPTIONS.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    {errors['seo.twitter_card'] && <FieldError>{errors['seo.twitter_card']}</FieldError>}
                </Field>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field>
                        <FieldLabel>Twitter Title</FieldLabel>
                        <Input
                            value={seo.twitter_title}
                            onChange={(e) => update({ twitter_title: e.target.value })}
                            placeholder="Otomatis dari Meta Title jika kosong"
                            maxLength={70}
                        />
                        {errors['seo.twitter_title'] && <FieldError>{errors['seo.twitter_title']}</FieldError>}
                    </Field>
                    <Field>
                        <FieldLabel>Twitter Description</FieldLabel>
                        <Input
                            value={seo.twitter_description}
                            onChange={(e) => update({ twitter_description: e.target.value })}
                            placeholder="Otomatis dari Meta Description jika kosong"
                            maxLength={200}
                        />
                        {errors['seo.twitter_description'] && <FieldError>{errors['seo.twitter_description']}</FieldError>}
                    </Field>
                </div>

                <ImageUploadSmall
                    label="Twitter Image"
                    hint="Rekomendasi: 1200×628px untuk summary_large_image"
                    currentUrl={seo.twitter_image_url}
                    externalFile={seo.twitter_image}
                    onChange={(file) => update({ twitter_image: file })}
                    onRemove={() => update({ remove_twitter_image: true, twitter_image: null, twitter_image_url: null })}
                    errors={errors['seo.twitter_image']}
                />
            </div>

            {/* ───────────────── Indexing & Sitemap ───────────────── */}
            <div className="space-y-4">
                <SectionHeader icon={Settings2} title="Indexing & Sitemap" description="Kontrol bagaimana mesin pencari mengindex halaman ini" />

                <Field>
                    <FieldLabel>Robots Directive</FieldLabel>
                    <Select value={seo.robots} onValueChange={(val) => update({ robots: val as RobotsDirective })}>
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
                    {errors['seo.robots'] && <FieldError>{errors['seo.robots']}</FieldError>}
                </Field>

                <div className="flex items-center justify-between rounded-lg border border-primary bg-input/30 p-4">
                    <div>
                        <p className="text-sm font-medium">Masukkan ke Sitemap</p>
                        <p className="text-sm text-muted-foreground">Halaman ini akan disertakan dalam sitemap XML</p>
                    </div>
                    <Switch checked={seo.in_sitemap} onCheckedChange={(val) => update({ in_sitemap: val })} />
                </div>

                {seo.in_sitemap && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field>
                            <FieldLabel>Sitemap Priority</FieldLabel>
                            <Select value={seo.sitemap_priority} onValueChange={(val) => update({ sitemap_priority: val as SitemapPriority })}>
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
                            {errors['seo.sitemap_priority'] && <FieldError>{errors['seo.sitemap_priority']}</FieldError>}
                        </Field>

                        <Field>
                            <FieldLabel>Change Frequency</FieldLabel>
                            <Select value={seo.sitemap_changefreq} onValueChange={(val) => update({ sitemap_changefreq: val as SitemapChangefreq })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Frekuensi</SelectLabel>
                                        {SITEMAP_CHANGEFREQ_OPTIONS.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {errors['seo.sitemap_changefreq'] && <FieldError>{errors['seo.sitemap_changefreq']}</FieldError>}
                        </Field>
                    </div>
                )}
            </div>

            {/* ───────────────── Schema Markup ───────────────── */}
            <div className="space-y-4">
                <SectionHeader icon={Code} title="Schema Markup" description="JSON-LD otomatis di-generate dari data layanan" />

                <div className="space-y-2">
                    {(['article', 'breadcrumb'] as const).map((type) => (
                        <SchemaTypeRow key={type} type={type} schema={schemaMarkup?.[type] ?? null} />
                    ))}
                </div>

                <p className="text-xs text-muted-foreground">Schema JSON-LD di-generate otomatis dan diperbarui setiap kali data layanan berubah.</p>
            </div>

            {/* ───────────────── Google Preview ───────────────── */}
            {(seo.meta_title || seo.meta_description) && (
                <div className="space-y-4">
                    <SectionHeader icon={Globe} title="Preview Google" description="Perkiraan tampilan di hasil pencarian Google" />
                    <div className="rounded-lg border border-border bg-muted/20 p-4">
                        <p className="truncate text-xs text-muted-foreground">
                            https://mitrajasalegalitas.co.id/layanan/
                            {seo.meta_title
                                .toLowerCase()
                                .replace(/\s+/g, '-')
                                .replace(/[^a-z0-9-]/g, '') || '...'}
                        </p>
                        <p className="mt-1 truncate text-lg font-medium text-blue-600 dark:text-blue-400">{seo.meta_title || 'Meta Title...'}</p>
                        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{seo.meta_description || 'Meta description akan tampil di sini...'}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
