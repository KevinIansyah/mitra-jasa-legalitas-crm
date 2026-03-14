import axios from 'axios';
import { AlertCircle, Check, CheckCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Spinner } from '@/components/ui/spinner';
import { uid } from '@/lib/service';

export type AiDrawerType = 'content' | 'faq' | 'packages' | 'seo' | 'process-steps' | 'requirements' | 'legal-bases';

type AiGenerateDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: AiDrawerType;
    serviceId: number;
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

export function AiGenerateDrawer({ open, onOpenChange, type, serviceId, onApply }: AiGenerateDrawerProps) {
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
    }, [open]);

    const generate = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        setApplied({});

        try {
            const { data } = await axios.post(`/services/${serviceId}/ai/generate/${type}`, {}, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });

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
                                    Tahap {index + 1} — {step.title}
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
