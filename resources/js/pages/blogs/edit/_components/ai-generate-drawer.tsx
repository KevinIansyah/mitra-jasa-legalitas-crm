import axios from 'axios';
import { AlertCircle, Check, CheckCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Spinner } from '@/components/ui/spinner';
import type { Blog } from '@/types/blogs';

export type AiDrawerType = 'content' | 'seo' | 'image';

type AiGenerateDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: AiDrawerType;
    blog: Blog;
    onApply: (data: Record<string, unknown>) => void;
};

type CompositedResult = {
    original: { preview: string; file: File };
    og: { preview: string; file: File };
    twitter: { preview: string; file: File };
};

const DRAWER_LABELS: Record<AiDrawerType, string> = {
    content: 'Konten',
    seo: 'SEO',
    image: 'Gambar Utama',
};

const BRAND_BLUE = { r: 30, g: 58, b: 138 };
const BRAND_ORANGE = { r: 234, g: 138, b: 27 };

// =============================================================================
// COMPOSITE IMAGE
// =============================================================================

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

            canvas.toBlob((blob) => {
                if (!blob) return reject(new Error('Canvas export gagal'));
                const file = new File([blob], `ai-blog-${targetWidth}x${targetHeight}-${Date.now()}.png`, { type: 'image/png' });
                resolve({ preview: canvas.toDataURL('image/png'), file });
            }, 'image/png');
        };

        img.crossOrigin = 'anonymous';
        img.onload = () => {
            imgLoaded = true;
            tryDraw();
        };
        img.onerror = () => reject(new Error('Gagal load gambar'));
        img.src = `data:image/png;base64,${base64}`;

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

export function AiGenerateDrawer({ open, onOpenChange, type, blog, onApply }: AiGenerateDrawerProps) {
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
                compositeImage(item.original, blog.title, 1920, 1080),
                compositeImage(item.og, blog.title, 1200, 630),
                compositeImage(item.twitter, blog.title, 1200, 628),
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
        setComposited({});
        setCompositing({});

        try {
            const { data } = await axios.post(`/blogs/${blog.id}/ai/generate/${type}`, {}, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
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

    const applyAll = () => {
        if (!result) return;
        onApply(result);
        const allKeys = Object.keys(result).reduce<Record<string, boolean>>((acc, key) => ({ ...acc, [key]: true }), {});
        setApplied(allKeys);
    };

    const allApplied = result
        ? Object.keys(result)
              .filter((k) => k !== 'tokens_used')
              .every((k) => applied[k])
        : false;

    const handleOpenChange = (isOpen: boolean) => {
        if (loading) return;
        onOpenChange(isOpen);
    };

    // ============================================================
    // RENDER RESULT
    // ============================================================

    const renderResult = () => {
        if (!result) return null;

        switch (type) {
            case 'content': {
                const shortDescription = result.short_description as string;
                const content = result.content as string;
                const readingTime = result.reading_time as number;

                return (
                    <div className="space-y-2">
                        <PreviewCard label="Deskripsi Singkat" applied={!!applied['short_description']} onApply={() => applyField('short_description', shortDescription)}>
                            <p className="line-clamp-3">{shortDescription}</p>
                        </PreviewCard>
                        <PreviewCard label="Konten Utama" applied={!!applied['content']} onApply={() => applyField('content', content)}>
                            <p className="line-clamp-4">{stripHtml(content)}</p>
                        </PreviewCard>
                        <PreviewCard label="Waktu Baca" applied={!!applied['reading_time']} onApply={() => applyField('reading_time', readingTime)}>
                            <p>{readingTime > 0 ? `${readingTime} menit` : 'Tidak diketahui'}</p>
                        </PreviewCard>
                    </div>
                );
            }

            case 'seo': {
                const fields = [
                    { key: 'meta_title', label: 'Meta Title' },
                    { key: 'meta_description', label: 'Meta Description' },
                    { key: 'focus_keyword', label: 'Focus Keyword' },
                ];
                return (
                    <div className="space-y-2">
                        {fields.map(({ key, label }) => (
                            <PreviewCard key={key} label={label} applied={!!applied[key]} onApply={() => applyField(key, result[key])}>
                                <p>{result[key] as string}</p>
                            </PreviewCard>
                        ))}
                    </div>
                );
            }

            case 'image': {
                const images = result.images as Array<{ original: string; og: string; twitter: string }> | undefined;
                if (!images?.length) return <Alert variant="destructive">...</Alert>;

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
                                            label={`Featured (1920×1080)`}
                                            applied={!!applied[`image_${index}`]}
                                            onApply={() => applyField(`image_${index}`, composited[index].original.file)}
                                        >
                                            <img src={composited[index].original.preview} className="w-full rounded-md object-cover" />
                                        </PreviewCard>
                                        <PreviewCard
                                            label={`OG Image (1200×630)`}
                                            applied={!!applied[`og_image_${index}`]}
                                            onApply={() => applyField(`og_image_${index}`, composited[index].og.file)}
                                        >
                                            <img src={composited[index].og.preview} className="w-full rounded-md object-cover" />
                                        </PreviewCard>
                                        <PreviewCard
                                            label={`Twitter Image (1200×628)`}
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

                    <div className="my-4 flex-1 overflow-y-auto px-4">
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

                        {!loading && error && (
                            <Alert variant="destructive" className="overflow-hidden">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Gagal Generate</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {!loading && result && (
                            <div className="space-y-2">
                                {tokensUsed > 0 && (
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
