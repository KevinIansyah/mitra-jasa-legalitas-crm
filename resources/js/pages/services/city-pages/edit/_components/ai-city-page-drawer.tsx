import axios from 'axios';
import { AlertCircle, Check, CheckCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Spinner } from '@/components/ui/spinner';

import services from '@/routes/services';

type AiCityPageDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cityPageId: number;
    onApply: (data: Record<string, unknown>) => void;
};

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

export function AiCityPageDrawer({ open, onOpenChange, cityPageId, onApply }: AiCityPageDrawerProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<Record<string, unknown> | null>(null);
    const [tokensUsed, setTokensUsed] = useState<number>(0);
    const [applied, setApplied] = useState<Record<string, boolean>>({});
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
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const generate = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        setApplied({});

        try {
            const { data } = await axios.post(services.cityPages.generateAi(cityPageId).url, {}, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });

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
        setApplied(Object.keys(result).reduce<Record<string, boolean>>((accumulator, key) => ({ ...accumulator, [key]: true }), {}));
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

    type FaqItem = { question: string; answer: string };

    return (
        <Drawer direction="right" open={open} onOpenChange={handleOpenChange}>
            <DrawerContent
                className="fixed right-0 bottom-0 mt-0 flex h-screen w-full flex-col rounded-none sm:max-w-md"
                onInteractOutside={(event) => loading && event.preventDefault()}
                onEscapeKeyDown={(event) => loading && event.preventDefault()}
            >
                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Header */}
                    <DrawerHeader>
                        <DrawerTitle>Generate AI</DrawerTitle>
                        <DrawerDescription>Konten + SEO halaman kota</DrawerDescription>
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
                                {tokensUsed > 0 && (
                                    <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                                        <span>Token digunakan</span>
                                        <span className="font-medium">{tokensUsed.toLocaleString('id-ID')}</span>
                                    </div>
                                )}

                                {/* Heading */}
                                <PreviewCard label="Nama Layanan" applied={!!applied['heading']} onApply={() => applyField('heading', result['heading'])}>
                                    <p>{result['heading'] as string}</p>
                                </PreviewCard>

                                {/* Introduction */}
                                <PreviewCard label="Pengantar" applied={!!applied['introduction']} onApply={() => applyField('introduction', result['introduction'])}>
                                    <p className="line-clamp-3">{stripHtml(result['introduction'] as string)}</p>
                                </PreviewCard>

                                {/* Content */}
                                <PreviewCard label="Konten Utama" applied={!!applied['content']} onApply={() => applyField('content', result['content'])}>
                                    <p className="line-clamp-3">{stripHtml(result['content'] as string)}</p>
                                </PreviewCard>

                                {/* FAQ */}
                                <div className={`rounded-lg p-4 transition-colors ${applied['faq'] ? 'bg-primary/30' : 'bg-primary/10 dark:bg-muted/40'}`}>
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-medium text-foreground">FAQ</span>

                                        {applied['faq'] ? (
                                            <Button type="button" size="sm" className="h-7 w-7">
                                                <CheckCheck className="size-3" />
                                            </Button>
                                        ) : (
                                            <Button type="button" size="sm" variant="secondary" className="h-7 w-7" onClick={() => applyField('faq', result['faq'])}>
                                                <Check className="size-3" />
                                            </Button>
                                        )}
                                    </div>
                                    <ul className="space-y-1">
                                        {(result['faq'] as FaqItem[]).slice(0, 3).map((faqItem, index) => (
                                            <li key={index} className="line-clamp-1 text-xs text-muted-foreground">
                                                {index + 1}. {faqItem.question}
                                            </li>
                                        ))}
                                        {(result['faq'] as FaqItem[]).length > 3 && (
                                            <li className="text-xs text-muted-foreground">+{(result['faq'] as FaqItem[]).length - 3} pertanyaan lainnya</li>
                                        )}
                                    </ul>
                                </div>

                                {/* SEO Fields */}
                                {(['meta_title', 'meta_description', 'focus_keyword'] as const).map((key) => (
                                    <PreviewCard
                                        key={key}
                                        label={key === 'meta_title' ? 'Meta Title' : key === 'meta_description' ? 'Meta Description' : 'Focus Keyword'}
                                        applied={!!applied[key]}
                                        onApply={() => applyField(key, result[key])}
                                    >
                                        <p className="line-clamp-2">{result[key] as string}</p>
                                    </PreviewCard>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="px-4 pb-4">
                        <div className="flex flex-col gap-2">
                            {result && !allApplied && (
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
