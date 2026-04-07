import axios from 'axios';
import { AlertCircle, Check, CheckCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Spinner } from '@/components/ui/spinner';

import { uid } from '@/lib/service';
import type { Service } from '@/types/services';

export type AiDrawerType = 'content' | 'faq' | 'packages' | 'seo' | 'process-steps' | 'requirements' | 'legal-bases' | 'image';

type AiGenerateDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: AiDrawerType;
    service: Service;
    onApply: (data: Record<string, unknown>) => void;
};

const DRAWER_LABELS: Record<AiDrawerType, string> = {
    content: 'Konten',
    faq: 'FAQ',
    packages: 'Paket Harga',
    seo: 'SEO',
    'process-steps': 'Tahapan Proses',
    requirements: 'Persyaratan',
    'legal-bases': 'Dasar Hukum',
    image: 'Gambar Utama',
};

const BRAND_BLUE = { r: 30, g: 58, b: 138 };
const BRAND_ORANGE = { r: 234, g: 138, b: 27 };

type CompositedResult = {
    original: { preview: string; file: File };
    og: { preview: string; file: File };
    twitter: { preview: string; file: File };
};

// ============================================================
// COMPOSITE IMAGE
// ============================================================

async function compositeImage(base64: string, title: string, targetWidth: number, targetHeight: number): Promise<{ preview: string; file: File }> {
    const font = new FontFace('DMSans', 'url(/fonts/DMSans-VariableFont.ttf)', {
        weight: '100 900',
    });
    await font.load();
    document.fonts.add(font);
    await document.fonts.ready;

    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const img = new Image();
        const logo = new Image();
        let imgLoaded = false;
        let logoLoaded = false;

        const tryDraw = () => {
            if (!imgLoaded || !logoLoaded) return;

            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const w = canvas.width;
            const h = canvas.height;

            const imgRatio = img.naturalWidth / img.naturalHeight;
            const canvasRatio = w / h;
            let sx = 0,
                sy = 0,
                sw = img.naturalWidth,
                sh = img.naturalHeight;
            if (imgRatio > canvasRatio) {
                sw = img.naturalHeight * canvasRatio;
                sx = (img.naturalWidth - sw) / 2;
            } else {
                sh = img.naturalWidth / canvasRatio;
                sy = (img.naturalHeight - sh) / 2;
            }
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

            // Gradient
            const grad = ctx.createLinearGradient(0, 0, w, 0);
            const { r: br, g: bg, b: bb } = BRAND_BLUE;
            const { r: or, g: og, b: ob } = BRAND_ORANGE;
            grad.addColorStop(0, `rgba(${br}, ${bg}, ${bb}, 0.55)`);
            grad.addColorStop(0.3, `rgba(${br}, ${bg}, ${bb}, 0.20)`);
            grad.addColorStop(0.48, `rgba(${br}, ${bg}, ${bb}, 0.0)`);
            grad.addColorStop(0.52, `rgba(${or}, ${og}, ${ob}, 0.0)`);
            grad.addColorStop(0.72, `rgba(${or}, ${og}, ${ob}, 0.15)`);
            grad.addColorStop(1, `rgba(${or}, ${og}, ${ob}, 0.40)`);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Margin, text, logo
            const marginX = Math.round(w * 0.05);
            const marginY = Math.round(h * 0.07);
            const maxTextWidth = Math.round(w * 0.38);
            const fontSize = Math.round(h * 0.07);
            const lineHeight = fontSize * 1.15;

            ctx.font = `bold ${fontSize}px 'DMSans', sans-serif`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.textBaseline = 'top';

            const words = title.split(' ');
            const lines: string[] = [];
            let currentLine = '';
            for (const word of words) {
                const test = currentLine ? `${currentLine} ${word}` : word;
                if (ctx.measureText(test).width > maxTextWidth && currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = test;
                }
            }
            if (currentLine) lines.push(currentLine);

            const totalTextHeight = lines.length * lineHeight;
            const textStartY = Math.round((h - totalTextHeight) / 2) + Math.round(h * 0.015);

            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 2;
            lines.forEach((line, i) => ctx.fillText(line, marginX, textStartY + i * lineHeight));
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;

            if (logo.naturalWidth > 0) {
                const logoH = Math.round(h * 0.09);
                const logoW = Math.round(logo.naturalWidth * (logoH / logo.naturalHeight));
                ctx.globalAlpha = 0.75;
                ctx.drawImage(logo, marginX, h - logoH - marginY, logoW, logoH);
                ctx.globalAlpha = 1.0;
            }

            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject(new Error('Canvas export gagal'));
                    const file = new File([blob], `ai-blog-${targetWidth}x${targetHeight}-${Date.now()}.webp`, { type: 'image/webp' });
                    resolve({ preview: canvas.toDataURL('image/webp'), file });
                },
                'image/webp',
                0.85,
            );
        };

        img.crossOrigin = 'anonymous';
        img.onload = () => {
            imgLoaded = true;
            tryDraw();
        };
        img.onerror = () => reject(new Error('Gagal load gambar'));
        img.src = `data:image/webp;base64,${base64}`;

        logo.crossOrigin = 'anonymous';
        logo.onload = () => {
            logoLoaded = true;
            tryDraw();
        };
        logo.onerror = () => {
            logoLoaded = true;
            tryDraw();
        };
        logo.src = '/logo.png';
    });
}

// ============================================================
// PREVIEW CARD
// ============================================================

function PreviewCard({ label, applied, onApply, children }: { label: string; applied: boolean; onApply: () => void; children: React.ReactNode }) {
    return (
        <div className={`rounded-lg p-4 transition-colors ${applied ? 'bg-primary/30' : 'bg-primary/10 dark:bg-muted/40'}`}>
            <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{label}</span>
                {applied ? (
                    <Button type="button" size="sm" className="h-7 w-7">
                        <CheckCheck className="size-3" />
                    </Button>
                ) : (
                    <Button type="button" size="sm" variant="secondary" className="h-7 w-7" onClick={onApply}>
                        <Check className="size-3" />
                    </Button>
                )}
            </div>
            <div className="text-sm text-muted-foreground">{children}</div>
        </div>
    );
}

function stripHtml(html: string): string {
    return (
        html
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 200) + '...'
    );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function AiGenerateDrawer({ open, onOpenChange, type, service, onApply }: AiGenerateDrawerProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<Record<string, unknown> | null>(null);
    const [tokensUsed, setTokensUsed] = useState<number>(0);
    const [applied, setApplied] = useState<Record<string, boolean>>({});
    const [composited, setComposited] = useState<Record<number, CompositedResult>>({});
    const [compositing, setCompositing] = useState<Record<number, boolean>>({});
    const hasGenerated = useRef(false);

    useEffect(() => {
        if (open && !hasGenerated.current) {
            hasGenerated.current = true;
            generate();
        }

        if (!open) {
            hasGenerated.current = false;
            setResult(null);
            setError(null);
            setApplied({});
            setTokensUsed(0);
            setComposited({});
            setCompositing({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
        if (!result || type !== 'image') return;
        const images = result.images as Array<{ original: string; og: string; twitter: string }> | undefined;
        if (!images?.length) return;

        images.forEach((item, index) => {
            setCompositing((prev) => ({ ...prev, [index]: true }));
            Promise.all([
                compositeImage(item.original, service.name, 1920, 1080),
                compositeImage(item.og, service.name, 1200, 630),
                compositeImage(item.twitter, service.name, 1200, 628),
            ])
                .then(([original, og, twitter]) => {
                    setComposited((prev) => ({ ...prev, [index]: { original, og, twitter } }));
                })
                .catch(console.error)
                .finally(() => setCompositing((prev) => ({ ...prev, [index]: false })));
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [result, type]);

    const generate = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        setApplied({});

        try {
            const { data } = await axios.post(`/services/${service.id}/ai/generate/${type}`, {}, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });

            setResult(data.data);
            setTokensUsed(data.tokens_used ?? 0);
        } catch (err: unknown) {
            const message = axios.isAxiosError(err) ? (err.response?.data?.message ?? 'Terjadi kesalahan saat generate.') : 'Terjadi kesalahan saat generate.';

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const applyField = (key: string, value: unknown) => {
        onApply({ [key]: value });
        setApplied((prev) => ({ ...prev, [key]: true }));
    };

    const getMappedResult = (): Record<string, unknown> => {
        if (!result) return {};

        switch (type) {
            case 'faq': {
                const faqs = result.faqs as { question: string; answer: string }[];
                return {
                    faqs: faqs.map((faq, index) => ({
                        ...faq,
                        _key: uid(),
                        sort_order: index,
                        status: 'active',
                    })),
                };
            }
            case 'packages': {
                const packages = result.packages as { name: string; price: number; short_description: string; features: { feature_name: string; is_included: boolean }[] }[];
                return {
                    packages: packages.map((packageItem, packageIndex) => ({
                        ...packageItem,
                        _key: uid(),
                        sort_order: packageIndex,
                        status: 'active',
                        features: packageItem.features.map((feature, featureIndex) => ({
                            ...feature,
                            _key: uid(),
                            sort_order: featureIndex,
                        })),
                    })),
                };
            }
            case 'process-steps': {
                const steps = result.process_steps as { title: string; description: string }[];
                return {
                    process_steps: steps.map((step, index) => ({
                        ...step,
                        _key: uid(),
                        sort_order: index,
                        status: 'active',
                    })),
                };
            }
            case 'requirements': {
                const categories = result.requirement_categories as { name: string; requirements: { name: string; is_required: boolean }[] }[];
                return {
                    requirement_categories: categories.map((category, categoryIndex) => ({
                        ...category,
                        _key: uid(),
                        sort_order: categoryIndex,
                        status: 'active',
                        requirements: category.requirements.map((requirement, requirementIndex) => ({
                            ...requirement,
                            _key: uid(),
                            sort_order: requirementIndex,
                        })),
                    })),
                };
            }
            case 'legal-bases': {
                const legalBases = result.legal_bases as { document_type: string; document_number: string; title: string }[];
                return {
                    legal_bases: legalBases.map((legalBasis, index) => ({
                        ...legalBasis,
                        _key: uid(),
                        sort_order: index,
                        status: 'active',
                    })),
                };
            }
            default:
                return result;
        }
    };

    const applyAll = () => {
        if (!result) return;

        const mapped = getMappedResult();
        onApply(mapped);

        const allKeys = Object.keys(mapped).reduce<Record<string, boolean>>((accumulator, key) => ({ ...accumulator, [key]: true }), {});

        setApplied(allKeys);
    };

    const allApplied = result
        ? Object.keys(result)
              .filter((key) => key !== 'tokens_used')
              .every((key) => applied[key])
        : false;

    const handleOpenChange = (isOpen: boolean) => {
        if (loading) return;
        onOpenChange(isOpen);
    };

    // ============================================================
    // RENDER RESULT PER TYPE
    // ============================================================

    const renderResult = () => {
        if (!result) return null;

        switch (type) {
            // Content
            case 'content': {
                const introduction = result.introduction as string;
                const content = result.content as string;

                return (
                    <div className="space-y-2">
                        <PreviewCard label="Pengantar" applied={!!applied['introduction']} onApply={() => applyField('introduction', introduction)}>
                            <p className="line-clamp-4">{stripHtml(introduction)}</p>
                        </PreviewCard>

                        <PreviewCard label="Konten Utama" applied={!!applied['content']} onApply={() => applyField('content', content)}>
                            <p className="line-clamp-4">{stripHtml(content)}</p>
                        </PreviewCard>
                    </div>
                );
            }

            // SEO
            case 'seo': {
                const seoFields: { key: string; label: string }[] = [
                    { key: 'meta_title', label: 'Meta Title' },
                    { key: 'meta_description', label: 'Meta Description' },
                    { key: 'focus_keyword', label: 'Focus Keyword' },
                ];

                return (
                    <div className="space-y-2">
                        {seoFields.map(({ key, label }) => (
                            <PreviewCard key={key} label={label} applied={!!applied[key]} onApply={() => applyField(key, result[key])}>
                                <p>{result[key] as string}</p>
                            </PreviewCard>
                        ))}
                    </div>
                );
            }

            // FAQ
            case 'faq': {
                const faqs = result.faqs as { question: string; answer: string }[];

                return (
                    <div className="space-y-2">
                        {faqs.map((faq, index) => (
                            <div key={index} className="rounded-lg bg-primary/10 p-4 dark:bg-muted/40">
                                <p className="text-sm font-medium text-foreground">FAQ #{index + 1}</p>
                                <p className="mt-1 text-sm font-medium">{faq.question}</p>
                                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                );
            }

            // Packages
            case 'packages': {
                type FeatureItem = { feature_name: string; is_included: boolean };
                type PackageItem = { name: string; price: number; short_description: string; features: FeatureItem[] };
                const packages = result.packages as PackageItem[];

                return (
                    <div className="space-y-2">
                        {packages.map((packageItem, index) => (
                            <div key={index} className="rounded-lg bg-primary/10 p-4 dark:bg-muted/40">
                                <p className="text-sm font-medium text-foreground">{packageItem.name}</p>
                                <p className="mt-1 text-sm font-medium text-foreground">Rp {packageItem.price.toLocaleString('id-ID')}</p>
                                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{packageItem.short_description}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {packageItem.features.filter((feature) => feature.is_included).length}/{packageItem.features.length} fitur tersedia
                                </p>
                            </div>
                        ))}
                    </div>
                );
            }

            // Process Steps
            case 'process-steps': {
                type ProcessStepItem = { title: string; description: string; duration?: string };
                const steps = result.process_steps as ProcessStepItem[];

                return (
                    <div className="space-y-2">
                        {steps.map((step, index) => (
                            <div key={index} className="rounded-lg bg-primary/10 p-4 dark:bg-muted/40">
                                <p className="text-sm font-medium text-foreground">
                                    Tahap {index + 1} - {step.title}
                                </p>
                                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{step.description}</p>
                                {step.duration && <p className="mt-1 text-xs text-muted-foreground">Durasi: {step.duration}</p>}
                            </div>
                        ))}
                    </div>
                );
            }

            // Requirements
            case 'requirements': {
                type RequirementItem = { name: string; is_required: boolean };
                type CategoryItem = { name: string; requirements: RequirementItem[] };
                const categories = result.requirement_categories as CategoryItem[];

                return (
                    <div className="space-y-2">
                        {categories.map((category, index) => (
                            <div key={index} className="rounded-lg bg-primary/10 p-4 dark:bg-muted/40">
                                <p className="text-sm font-medium text-foreground">{category.name}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{category.requirements.length} persyaratan</p>
                                <ul className="mt-1 space-y-0.5">
                                    {category.requirements.slice(0, 3).map((requirement, requirementIndex) => (
                                        <li key={requirementIndex} className="text-xs text-muted-foreground">
                                            {requirement.is_required ? '✓' : '○'} {requirement.name}
                                        </li>
                                    ))}
                                    {category.requirements.length > 3 && <li className="text-xs text-muted-foreground">+{category.requirements.length - 3} lainnya</li>}
                                </ul>
                            </div>
                        ))}
                    </div>
                );
            }

            // Legal Bases
            case 'legal-bases': {
                type LegalBasisItem = { document_type: string; document_number: string; title: string };
                const legalBases = result.legal_bases as LegalBasisItem[];

                return (
                    <div className="space-y-2">
                        {legalBases.map((legalBasis, index) => (
                            <div key={index} className="rounded-lg bg-primary/10 p-4 dark:bg-muted/40">
                                <p className="text-xs font-medium text-foreground">{legalBasis.document_type}</p>
                                <p className="mt-0.5 text-xs font-medium text-muted-foreground">{legalBasis.document_number}</p>
                                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{legalBasis.title}</p>
                            </div>
                        ))}
                    </div>
                );
            }

            case 'image': {
                const images = result.images as Array<{ original: string; og: string; twitter: string }> | undefined;

                if (!images?.length) {
                    return (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Tidak ada gambar</AlertTitle>
                            <AlertDescription>AI tidak menghasilkan gambar. Coba regenerate.</AlertDescription>
                        </Alert>
                    );
                }

                return (
                    <div className="space-y-4">
                        {images.map((_, index) => (
                            <div key={index} className="space-y-2">
                                {compositing[index] && (
                                    <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                                        <Spinner className="size-4" />
                                        Menyiapkan preview...
                                    </div>
                                )}
                                {composited[index] && (
                                    <>
                                        <PreviewCard
                                            label={`Gambar ${index + 1} - Featured (1920×1080)`}
                                            applied={!!applied[`image_${index}`]}
                                            onApply={() => applyField(`image_${index}`, composited[index].original.file)}
                                        >
                                            <img src={composited[index].original.preview} className="w-full rounded-md object-cover" />
                                        </PreviewCard>
                                        <PreviewCard
                                            label={`Gambar ${index + 1} - OG Image (1200×630)`}
                                            applied={!!applied[`og_image_${index}`]}
                                            onApply={() => applyField(`og_image_${index}`, composited[index].og.file)}
                                        >
                                            <img src={composited[index].og.preview} className="w-full rounded-md object-cover" />
                                        </PreviewCard>
                                        <PreviewCard
                                            label={`Gambar ${index + 1} - Twitter Image (1200×628)`}
                                            applied={!!applied[`twitter_image_${index}`]}
                                            onApply={() => applyField(`twitter_image_${index}`, composited[index].twitter.file)}
                                        >
                                            <img src={composited[index].twitter.preview} className="w-full rounded-md object-cover" />
                                        </PreviewCard>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                );
            }

            default:
                return null;
        }
    };

    return (
        <Drawer direction="right" open={open} onOpenChange={handleOpenChange}>
            <DrawerContent
                className="fixed right-0 bottom-0 mt-0 flex h-screen w-full flex-col rounded-none sm:max-w-md"
                onInteractOutside={(e) => loading && e.preventDefault()}
                onEscapeKeyDown={(e) => loading && e.preventDefault()}
            >
                <div className="flex flex-1 flex-col overflow-hidden">
                    <DrawerHeader>
                        <DrawerTitle>Generate AI</DrawerTitle>
                        <DrawerDescription>{DRAWER_LABELS[type]}</DrawerDescription>
                    </DrawerHeader>

                    {/* ───────────────── Content Section ───────────────── */}
                    <div className="my-4 flex-1 overflow-y-auto px-4">
                        {/* Loading */}
                        {loading && (
                            <div className="flex h-[calc(100%-4rem)] flex-col items-center justify-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                    <Spinner className="size-5 text-primary" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium">Sedang generate...</p>
                                    <p className="mt-1 text-sm text-muted-foreground">Harap tunggu, jangan tutup drawer ini</p>
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {!loading && error && (
                            <Alert variant="destructive" className="overflow-hidden">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Gagal Generate</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Result */}
                        {!loading && result && (
                            <div className="space-y-2">
                                {tokensUsed > 0 && type !== 'image' && (
                                    <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                                        <span>Token digunakan</span>
                                        <span className="font-medium">{tokensUsed.toLocaleString('id-ID')}</span>
                                    </div>
                                )}
                                {renderResult()}
                            </div>
                        )}
                    </div>

                    <div className="px-4 pb-4">
                        <div className="flex flex-col gap-2">
                            {result && !allApplied && type !== 'image' && (
                                <Button type="button" className="w-full" disabled={loading} onClick={applyAll}>
                                    Terapkan Semua
                                </Button>
                            )}

                            <div className="flex flex-col gap-2 md:flex-row">
                                <Button type="button" className="flex-1" disabled={loading} onClick={generate}>
                                    Regenerate
                                </Button>

                                <Button type="button" variant="secondary" className="flex-1" disabled={loading} onClick={() => onOpenChange(false)}>
                                    Selesai
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
