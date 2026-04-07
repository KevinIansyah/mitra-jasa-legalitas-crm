import { router, useForm } from '@inertiajs/react';
import { ClipboardList, HelpCircle, ImagePlus, Package, Pencil, Plus, Scale, Sparkles, Trash } from 'lucide-react';
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

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
    deleteItemAndReindex,
    formatSize,
    makeFaq,
    makeLegalBasis,
    makePackage,
    makeProcessStep,
    makeRequirementCategory,
    moveItemDown,
    moveItemUp,
    readImageAsDataURL,
    validateImageFile,
} from '@/lib/service';
import services from '@/routes/services';
import type { Service, ServiceCategory } from '@/types/services';
import { FaqCard, type LocalFaq } from '../../_components/faq-card';
import { LegalBasisCard, type LocalLegalBasis } from '../../_components/legal-basis-card';
import { PackageCard, type LocalPackage } from '../../_components/package-card';
import { ProcessStepCard, type LocalProcessStep } from '../../_components/process-step-card';
import { RequirementCard, type LocalRequirementCategory } from '../../_components/requirement-card';
import { SeoCard } from '../../_components/seo-card';
import type { AiDrawerType } from './ai-generate-drawer';
import { AiGenerateDrawer } from './ai-generate-drawer';

type BasicInfoFormData = {
    service_category_id: number;
    name: string;
    short_description: string;
    icon: string;
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

type FaqFormData = {
    faqs: LocalFaq[];
};

type LegalBasisFormData = {
    legal_bases: LocalLegalBasis[];
};

type RequirementCategoryFormData = {
    requirement_categories: LocalRequirementCategory[];
};

type ProcessStepFormData = {
    process_steps: LocalProcessStep[];
};

type TabId = 'basic-information' | 'content' | 'package' | 'faq' | 'legal-basis' | 'requirement' | 'timeline' | 'seo';

type EditSectionProps = {
    service: Service;
    categories: ServiceCategory[];
};

const R2_PUBLIC_URL = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL;

export function EditSection({ service, categories }: EditSectionProps) {
    const [activeTab, setActiveTab] = useState<TabId>('basic-information');
    const [imagePreview, setImagePreview] = useState<{ src: string; name: string; size: number } | null>(
        service.featured_image
            ? {
                  src: `${R2_PUBLIC_URL}/${service.featured_image}`,
                  name: service.featured_image.split('/').pop() || 'image',
                  size: 0,
              }
            : null,
    );

    const [imageError, setImageError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [aiDrawer, setAiDrawer] = useState<{ open: boolean; type: AiDrawerType }>({
        open: false,
        type: 'content',
    });
    const openAiDrawer = (type: AiDrawerType) => setAiDrawer({ open: true, type });

    // ============================================================
    // FORMS
    // ============================================================
    const basicInfoForm = useForm<BasicInfoFormData>({
        service_category_id: service.service_category_id,
        name: service.name,
        short_description: service.short_description || '',
        icon: service.icon || '',
        featured_image: null,
        remove_image: false,
        is_published: service.is_published,
        is_featured: service.is_featured,
        is_popular: service.is_popular,
    });

    const contentForm = useForm<ContentFormData>({
        introduction: service.introduction || '',
        content: service.content || '',
    });

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

    const faqForm = useForm<FaqFormData>({
        faqs: (service.faqs ?? []).map((faq) => ({
            id: faq.id,
            _key: `faq-${faq.id}`,
            question: faq.question,
            answer: faq.answer,
            sort_order: faq.sort_order,
            status: faq.status,
        })),
    });

    const legalBasisForm = useForm<LegalBasisFormData>({
        legal_bases: (service.legal_bases ?? []).map((basis) => ({
            id: basis.id,
            _key: `basis-${basis.id}`,
            document_type: basis.document_type,
            document_number: basis.document_number,
            title: basis.title,
            issued_date: basis.issued_date ? basis.issued_date : null,
            url: basis.url ? basis.url : null,
            description: basis.description ? basis.description : null,
            sort_order: basis.sort_order,
            status: basis.status,
        })),
    });

    const requirementCategoriesForm = useForm<RequirementCategoryFormData>({
        requirement_categories: (service.requirement_categories ?? []).map((category) => ({
            id: category.id,
            _key: `category-${category.id}`,
            name: category.name,
            description: category.description ?? '',
            sort_order: category.sort_order,
            status: category.status,
            requirements: (category.requirements ?? []).map((req) => ({
                id: req.id,
                _key: `requirement-${req.id}`,
                service_requirement_category_id: req.service_requirement_category_id,
                name: req.name,
                description: req.description ?? '',
                is_required: req.is_required,
                document_format: req.document_format ?? '',
                notes: req.notes ?? '',
                sort_order: req.sort_order,
                status: req.status,
            })),
        })),
    });

    const processStepsForm = useForm<ProcessStepFormData>({
        process_steps: (service.process_steps ?? []).map((step) => ({
            id: step.id,
            _key: `step-${step.id}`,
            title: step.title,
            description: step.description ?? null,
            duration: step.duration ?? null,
            duration_days: step.duration_days ?? null,
            required_documents: step.required_documents ?? null,
            notes: step.notes ?? null,
            icon: step.icon ?? null,
            sort_order: step.sort_order,
            status: step.status,
        })),
    });

    const seoForm = useForm({
        meta_title: service.seo?.meta_title ?? '',
        meta_description: service.seo?.meta_description ?? '',
        canonical_url: service.seo?.canonical_url ?? '',
        focus_keyword: service.seo?.focus_keyword ?? '',
        secondary_keywords: service.seo?.secondary_keywords ?? [],
        og_title: service.seo?.og_title ?? '',
        og_description: service.seo?.og_description ?? '',
        og_image: null as File | null,
        og_image_url: service.seo?.og_image ?? null,
        remove_og_image: false,
        twitter_card: service.seo?.twitter_card ?? 'summary_large_image',
        twitter_title: service.seo?.twitter_title ?? '',
        twitter_description: service.seo?.twitter_description ?? '',
        twitter_image: null as File | null,
        twitter_image_url: service.seo?.twitter_image ?? null,
        remove_twitter_image: false,
        robots: service.seo?.robots ?? 'index,follow',
        in_sitemap: service.seo?.in_sitemap ?? true,
        sitemap_priority: service.seo?.sitemap_priority ?? '0.7',
        sitemap_changefreq: service.seo?.sitemap_changefreq ?? 'monthly',
    });

    // ============================================================
    // TAB HANDLERS / TRACK UNSAVED CHANGES
    // ============================================================
    const hasUnsavedChanges = {
        'basic-information': basicInfoForm.isDirty,
        content: contentForm.isDirty,
        package: packageForm.isDirty,
        faq: faqForm.isDirty,
        'legal-basis': legalBasisForm.isDirty,
        requirement: requirementCategoriesForm.isDirty,
        timeline: processStepsForm.isDirty,
        seo: seoForm.isDirty,
    } satisfies Record<TabId, boolean>;

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
        basicInfoForm.setData('featured_image', file!);

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
        basicInfoForm.setData('featured_image', null);
        basicInfoForm.setData('remove_image', true);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ============================================================
    // GENERIC MOVE HANDLERS
    // ============================================================

    const createMoveHandlers = <T extends { sort_order: number }>(items: T[], setItems: (items: T[]) => void) => ({
        moveUp: (index: number) => setItems(moveItemUp(items, index)),
        moveDown: (index: number) => setItems(moveItemDown(items, index)),
    });

    // ============================================================
    // PACKAGE HANDLERS
    // ============================================================

    const addPackage = () => packageForm.setData('packages', [...packageForm.data.packages, makePackage(packageForm.data.packages.length)]);

    const updatePackage = (_key: string, updated: LocalPackage) =>
        packageForm.setData(
            'packages',
            packageForm.data.packages.map((p) => (p._key === _key ? updated : p)),
        );

    const deletePackage = (_key: string) => packageForm.setData('packages', deleteItemAndReindex(packageForm.data.packages, _key));

    const packageHandlers = createMoveHandlers(packageForm.data.packages, (packages) => packageForm.setData('packages', packages));

    // ============================================================
    // FAQ HANDLERS
    // ============================================================
    const addFaq = () => faqForm.setData('faqs', [...faqForm.data.faqs, makeFaq(faqForm.data.faqs.length)]);

    const updateFaq = (_key: string, updated: LocalFaq) =>
        faqForm.setData(
            'faqs',
            faqForm.data.faqs.map((f) => (f._key === _key ? updated : f)),
        );

    const deleteFaq = (_key: string) => faqForm.setData('faqs', deleteItemAndReindex(faqForm.data.faqs, _key));

    const faqHandlers = createMoveHandlers(faqForm.data.faqs, (faqs) => faqForm.setData('faqs', faqs));

    // ============================================================
    // LEGAL BASIS HANDLERS
    // ============================================================
    const addLegalBasis = () => legalBasisForm.setData('legal_bases', [...legalBasisForm.data.legal_bases, makeLegalBasis(legalBasisForm.data.legal_bases.length)]);

    const updateLegalBasis = (_key: string, updated: LocalLegalBasis) =>
        legalBasisForm.setData(
            'legal_bases',
            legalBasisForm.data.legal_bases.map((l) => (l._key === _key ? updated : l)),
        );

    const deleteLegalBasis = (_key: string) => legalBasisForm.setData('legal_bases', deleteItemAndReindex(legalBasisForm.data.legal_bases, _key));

    const legalBasisHandlers = createMoveHandlers(legalBasisForm.data.legal_bases, (legal_bases) => legalBasisForm.setData('legal_bases', legal_bases));

    // ============================================================
    // REQUIREMENT CATEGORY HANDLERS
    // ============================================================
    const addRequirementCategory = () =>
        requirementCategoriesForm.setData('requirement_categories', [
            ...requirementCategoriesForm.data.requirement_categories,
            makeRequirementCategory(requirementCategoriesForm.data.requirement_categories.length),
        ]);

    const updateRequirementCategory = (_key: string, updated: LocalRequirementCategory) =>
        requirementCategoriesForm.setData(
            'requirement_categories',
            requirementCategoriesForm.data.requirement_categories.map((r) => (r._key === _key ? updated : r)),
        );

    const deleteRequirementCategory = (_key: string) =>
        requirementCategoriesForm.setData('requirement_categories', deleteItemAndReindex(requirementCategoriesForm.data.requirement_categories, _key));

    const requirementCategoryHandlers = createMoveHandlers(requirementCategoriesForm.data.requirement_categories, (requirement_categories) =>
        requirementCategoriesForm.setData('requirement_categories', requirement_categories),
    );

    // ============================================================
    // PROCESS STEP HANDLERS
    // ============================================================
    const addProcessStep = () => processStepsForm.setData('process_steps', [...processStepsForm.data.process_steps, makeProcessStep(processStepsForm.data.process_steps.length)]);

    const updateProcessStep = (_key: string, updated: LocalProcessStep) =>
        processStepsForm.setData(
            'process_steps',
            processStepsForm.data.process_steps.map((p) => (p._key === _key ? updated : p)),
        );

    const deleteProcessStep = (_key: string) => processStepsForm.setData('process_steps', deleteItemAndReindex(processStepsForm.data.process_steps, _key));

    const processStepHandlers = createMoveHandlers(processStepsForm.data.process_steps, (process_steps) => processStepsForm.setData('process_steps', process_steps));

    // ============================================================
    // FORM SUBMISSION HANDLERS
    // ============================================================
    const handleSubmitBasicInfo = (e: React.FormEvent) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Informasi dasar sedang diperbarui.',
        });

        basicInfoForm.post(services.update.basicInformation(service.id).url, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                toast.success('Behasil', {
                    description: 'Informasi dasar berhasil diperbarui.',
                });

                basicInfoForm.clearErrors();
            },
            onError: () => {
                toast.error('Gagal', {
                    description: 'Informasi dasar gagal diperbarui. Silakan periksa kembali data informasi dasar yang diisi.',
                });
            },
            onFinish: () => {
                toast.dismiss(id);
            },
        });
    };

    const handleSubmitContent = (e: React.FormEvent) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Konten sedang diperbarui.',
        });

        contentForm.patch(services.update.content(service.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Behasil', {
                    description: 'Konten berhasil diperbarui.',
                });

                contentForm.clearErrors();
            },
            onError: () => {
                toast.error('Gagal', {
                    description: 'Konten gagal diperbarui. Silakan periksa kembali data konten yang diisi.',
                });
            },
            onFinish: () => {
                toast.dismiss(id);
            },
        });
    };

    const handleSubmitPackages = (e: React.FormEvent) => {
        e.preventDefault();

        if (packageForm.data.packages.length === 0) {
            toast.error('Gagal', {
                description: 'Minimal harus ada 1 paket harga',
            });
            return;
        }

        const id = toast.loading('Memproses...', {
            description: 'Paket harga sedang diperbarui.',
        });

        packageForm.patch(services.update.packages(service.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Behasil', {
                    description: 'Paket harga berhasil diperbarui.',
                });

                packageForm.clearErrors();
            },
            onError: () => {
                toast.error('Gagal', {
                    description: 'Paket harga gagal diperbarui. Silakan periksa kembali data paket yang diisi.',
                });
            },
            onFinish: () => {
                toast.dismiss(id);
            },
        });
    };

    const handleSubmitFaq = (e: React.FormEvent) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'FAQ sedang diperbarui.',
        });

        faqForm.patch(services.update.faqs(service.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Behasil', {
                    description: 'FAQ berhasil diperbarui.',
                });

                faqForm.clearErrors();
            },
            onError: () => {
                toast.error('Gagal', {
                    description: 'FAQ gagal diperbarui. Silakan periksa kembali data FAQ yang diisi.',
                });
            },
            onFinish: () => {
                toast.dismiss(id);
            },
        });
    };

    const handleSubmitLegalBasis = (e: React.FormEvent) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Dasar hukum sedang diperbarui.',
        });

        legalBasisForm.patch(services.update.legalBases(service.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Behasil', {
                    description: 'Dasar hukum berhasil diperbarui.',
                });

                legalBasisForm.clearErrors();
            },
            onError: () => {
                toast.error('Gagal', {
                    description: 'Dasar hukum gagal diperbarui. Silakan periksa kembali data dasar hukum yang diisi.',
                });
            },
            onFinish: () => {
                toast.dismiss(id);
            },
        });
    };

    const handleSubmitRequirement = (e: React.FormEvent) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Persyaratan sedang diperbarui.',
        });

        requirementCategoriesForm.patch(services.update.requirements(service.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Behasil', {
                    description: 'Persyaratan berhasil diperbarui.',
                });

                requirementCategoriesForm.clearErrors();
            },
            onError: () => {
                toast.error('Gagal', {
                    description: 'Persyaratan gagal diperbarui. Silakan periksa kembali data persyaratan yang diisi.',
                });
            },
            onFinish: () => {
                toast.dismiss(id);
            },
        });
    };

    const handleSubmitProcessStep = (e: React.FormEvent) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Tahapan sedang diperbarui.',
        });

        processStepsForm.patch(services.update.processSteps(service.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Behasil', {
                    description: 'Tahapan berhasil diperbarui.',
                });

                processStepsForm.clearErrors();
            },
            onError: () => {
                toast.error('Gagal', {
                    description: 'Tahapan gagal diperbarui. Silakan periksa kembali data tahapan yang diisi.',
                });
            },
            onFinish: () => {
                toast.dismiss(id);
            },
        });
    };

    const handleSubmitSeo = (e: React.FormEvent) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'SEO sedang diperbarui.',
        });

        seoForm.post(services.update.seo(service.id).url, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'SEO berhasil diperbarui.',
                });
                seoForm.clearErrors();
            },
            onError: (errors) => {
                console.log(errors);
                toast.error('Gagal', {
                    description: 'SEO gagal diperbarui. Silakan periksa kembali data SEO yang diisi.',
                });
            },
            onFinish: () => toast.dismiss(id),
        });
    };

    // ============================================================
    // AI APPLY HANDLER
    // ============================================================
    const handleAiApply = async (data: Record<string, unknown>) => {
        if (data.introduction !== undefined) contentForm.setData('introduction', data.introduction as string);
        if (data.content !== undefined) contentForm.setData('content', data.content as string);
        if (data.meta_title !== undefined) seoForm.setData('meta_title', data.meta_title as string);
        if (data.meta_description !== undefined) seoForm.setData('meta_description', data.meta_description as string);
        if (data.focus_keyword !== undefined) seoForm.setData('focus_keyword', data.focus_keyword as string);
        if (data.faqs !== undefined) faqForm.setData('faqs', data.faqs as LocalFaq[]);
        if (data.packages !== undefined) packageForm.setData('packages', data.packages as LocalPackage[]);
        if (data.process_steps !== undefined) processStepsForm.setData('process_steps', data.process_steps as LocalProcessStep[]);
        if (data.requirement_categories !== undefined) requirementCategoriesForm.setData('requirement_categories', data.requirement_categories as LocalRequirementCategory[]);
        if (data.legal_bases !== undefined) legalBasisForm.setData('legal_bases', data.legal_bases as LocalLegalBasis[]);

        const imageKey = Object.keys(data).find((k) => k.startsWith('image_'));
        if (imageKey && data[imageKey] instanceof File) {
            const file = data[imageKey] as File;
            try {
                basicInfoForm.setData('featured_image', file);
                basicInfoForm.setData('remove_image', false);
                const preview = await readImageAsDataURL(file);
                setImagePreview({ src: preview, name: file.name, size: file.size });
                setActiveTab('basic-information');
                toast.success('Gambar diterapkan', { description: 'Jangan lupa simpan perubahan.' });
            } catch {
                toast.error('Gagal menerapkan gambar');
            }
        }

        const ogKey = Object.keys(data).find((k) => k.startsWith('og_image_'));
        if (ogKey && data[ogKey] instanceof File) {
            seoForm.setData('og_image', data[ogKey] as File);
            setActiveTab('seo');
            toast.success('OG Image diterapkan', { description: 'Jangan lupa simpan SEO.' });
        }

        const twitterKey = Object.keys(data).find((k) => k.startsWith('twitter_image_'));
        if (twitterKey && data[twitterKey] instanceof File) {
            seoForm.setData('twitter_image', data[twitterKey] as File);
            setActiveTab('seo');
            toast.success('Twitter Image diterapkan', { description: 'Jangan lupa simpan SEO.' });
        }
    };

    return (
        <>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList>
                    <TabsTrigger value="basic-information">
                        Informasi Dasar
                        {hasUnsavedChanges['basic-information'] && <div className="ml-1 h-2 w-2 rounded-full border border-destructive bg-destructive"></div>}
                    </TabsTrigger>
                    <TabsTrigger value="content">
                        Konten
                        {hasUnsavedChanges['content'] && <div className="ml-1 h-2 w-2 rounded-full border border-destructive bg-destructive"></div>}
                    </TabsTrigger>
                    <TabsTrigger value="package">
                        Paket Harga
                        {hasUnsavedChanges['package'] && <div className="ml-1 h-2 w-2 rounded-full border border-destructive bg-destructive"></div>}
                    </TabsTrigger>
                    <TabsTrigger value="faq">FAQ</TabsTrigger>
                    <TabsTrigger value="legal-basis">
                        Dasar Hukum
                        {hasUnsavedChanges['legal-basis'] && <div className="ml-1 h-2 w-2 rounded-full border border-destructive bg-destructive"></div>}
                    </TabsTrigger>
                    <TabsTrigger value="requirement">
                        Persyaratan
                        {hasUnsavedChanges['requirement'] && <div className="ml-1 h-2 w-2 rounded-full border border-destructive bg-destructive"></div>}
                    </TabsTrigger>
                    <TabsTrigger value="timeline">
                        Tahapan
                        {hasUnsavedChanges['timeline'] && <div className="ml-1 h-2 w-2 rounded-full border border-destructive bg-destructive"></div>}
                    </TabsTrigger>
                    <TabsTrigger value="seo">
                        SEO
                        {hasUnsavedChanges.seo && <div className="ml-1 h-2 w-2 rounded-full border border-destructive bg-destructive" />}
                    </TabsTrigger>
                </TabsList>

                {/* ───────────────── Basic Information Section ───────────────── */}
                <TabsContent value="basic-information">
                    <form onSubmit={handleSubmitBasicInfo}>
                        <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-xl font-semibold">Informasi Dasar Layanan</h2>
                                    <p className="mt-0.5 text-sm text-muted-foreground">Kelola identitas, kategori, deskripsi singkat, dan pengaturan publikasi layanan.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {/* Name */}
                                    <Field className="md:col-span-2 lg:col-span-1">
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

                                    {/* Category */}
                                    <Field className="md:col-span-2 lg:col-span-1">
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

                                {/* Short Description */}
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

                                {/* Featured Image */}
                                <Field>
                                    <div className="flex items-center justify-between">
                                        <FieldLabel htmlFor="featured_image">Gambar Utama</FieldLabel>
                                        <Button type="button" variant="secondary" size="sm" onClick={() => openAiDrawer('image')}>
                                            <Sparkles className="size-3.5" />
                                            Generate AI
                                        </Button>
                                    </div>

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
                                                          ? 'border-border bg-muted/40'
                                                          : 'border-border hover:border-border hover:bg-muted/40',
                                                ].join(' ')}
                                            >
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                                    <ImagePlus className="size-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">
                                                        {isDragging ? 'Lepaskan untuk mengunggah!' : 'Seret & lepas gambar di sini'}
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        atau <span className="text-primary underline underline-offset-2">klik untuk memilih</span> dari perangkat Anda
                                                    </p>
                                                </div>
                                                <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                                    JPG · PNG · WEBP · GIF · SVG · Maks. 5 MB
                                                </span>
                                            </div>
                                            {imageError && <FieldError>{imageError}</FieldError>}
                                            {basicInfoForm.errors.featured_image && <FieldError>{basicInfoForm.errors.featured_image}</FieldError>}
                                        </>
                                    ) : (
                                        <div className="relative overflow-visible">
                                            <img src={imagePreview.src} alt={imagePreview.name} className="aspect-video w-full rounded-lg border border-border object-cover" />
                                            <div className="mt-2 flex items-center gap-3 rounded-lg border border-primary bg-input/30 px-3 py-2">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                                    <ImagePlus className="size-4 text-primary" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-foreground">{imagePreview.name}</p>
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
                                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                                        <div className="flex items-start gap-4 rounded-lg border border-primary bg-transparent p-4 dark:bg-input/30">
                                            <Switch
                                                id="is_published"
                                                checked={basicInfoForm.data.is_published}
                                                onCheckedChange={(val) => basicInfoForm.setData('is_published', val)}
                                            />
                                            <div className="flex-1">
                                                <Label htmlFor="is_published" className="cursor-pointer text-sm font-medium">
                                                    Publikasikan Layanan
                                                </Label>
                                                <p className="text-sm text-muted-foreground">Jika aktif, layanan akan tampil dan dapat diakses oleh pengunjung website.</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 rounded-lg border border-primary bg-transparent p-4 dark:bg-input/30">
                                            <Switch
                                                id="is_featured"
                                                checked={basicInfoForm.data.is_featured}
                                                onCheckedChange={(val) => basicInfoForm.setData('is_featured', val)}
                                            />
                                            <div className="flex-1">
                                                <Label htmlFor="is_featured" className="cursor-pointer text-sm font-medium">
                                                    Jadikan Layanan Unggulan
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Layanan akan ditampilkan di bagian khusus "Layanan Unggulan" dan diprioritaskan di halaman utama.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 rounded-lg border border-primary bg-transparent p-4 dark:bg-input/30">
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

                        <div className="mt-4 flex items-center gap-2">
                            <Button type="submit" disabled={basicInfoForm.processing || !hasUnsavedChanges['basic-information']} className="flex-1 md:w-45 md:flex-none">
                                {basicInfoForm.processing ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan'
                                )}
                            </Button>
                            <Button type="button" variant="secondary" className="flex-1 md:w-45 md:flex-none" onClick={() => router.visit(services.index().url)}>
                                Kembali
                            </Button>
                        </div>
                    </form>
                </TabsContent>

                {/* ───────────────── Content Section ───────────────── */}
                <TabsContent value="content">
                    <form onSubmit={handleSubmitContent}>
                        <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                            <div className="space-y-4">
                                <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
                                    <div>
                                        <h2 className="text-xl font-semibold">Konten Layanan</h2>
                                        <p className="mt-0.5 text-sm text-muted-foreground">
                                            Kelola pengantar dan konten utama layanan untuk kebutuhan informasi dan optimasi SEO.
                                        </p>
                                    </div>
                                    <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                                        <Button type="button" variant="secondary" className="w-full md:w-30" onClick={() => openAiDrawer('content')}>
                                            <Sparkles className="size-4" />
                                            Generate AI
                                        </Button>
                                    </div>
                                </div>

                                {/* Introduction */}
                                <Field>
                                    <FieldLabel>Pengantar Layanan</FieldLabel>
                                    <Tiptap content={contentForm.data.introduction} onChange={(html) => contentForm.setData('introduction', html)} />
                                    {contentForm.errors.introduction && <FieldError>{contentForm.errors.introduction}</FieldError>}
                                </Field>

                                {/* Content */}
                                <Field>
                                    <FieldLabel>Konten Utama</FieldLabel>
                                    <Tiptap content={contentForm.data.content} onChange={(html) => contentForm.setData('content', html)} />
                                    {contentForm.errors.content && <FieldError>{contentForm.errors.content}</FieldError>}
                                </Field>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                            <Button type="submit" disabled={contentForm.processing || !hasUnsavedChanges.content} className="flex-1 md:w-45 md:flex-none">
                                {contentForm.processing ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan'
                                )}
                            </Button>
                            <Button type="button" variant="secondary" className="flex-1 md:w-45 md:flex-none" onClick={() => router.visit(services.index().url)}>
                                Kembali
                            </Button>
                        </div>
                    </form>
                </TabsContent>

                {/* ───────────────── Package Section ───────────────── */}
                <TabsContent value="package" className="space-y-4">
                    <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
                            <div>
                                <h2 className="text-xl font-semibold">Paket Harga</h2>
                                <p className="mt-0.5 text-sm text-muted-foreground">Buat paket harga dengan dokumen/fitur yang berbeda untuk setiap paket</p>
                            </div>
                            <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                                <Button type="button" variant="secondary" className="w-full md:w-30" onClick={() => openAiDrawer('packages')}>
                                    <Sparkles className="size-4" />
                                    Generate AI
                                </Button>
                                {packageForm.data.packages.length > 0 && (
                                    <Button type="button" onClick={addPackage} className="w-full md:w-30">
                                        <Plus className="size-4" />
                                        Tambah
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmitPackages}>
                        {packageForm.data.packages.length === 0 ? (
                            <div className="rounded-xl bg-sidebar p-6 shadow md:p-6 dark:shadow-none">
                                <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border py-16 text-muted-foreground">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                        <Package className="size-5 text-primary" />
                                    </div>
                                    <p className="text-sm">Belum ada paket harga</p>
                                    <Button type="button" onClick={addPackage} className="gap-2">
                                        <Plus className="size-4" />
                                        Tambah Paket Pertama
                                    </Button>
                                </div>
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
                                        onMoveUp={() => packageHandlers.moveUp(i)}
                                        onMoveDown={() => packageHandlers.moveDown(i)}
                                        totalItems={packageForm.data.packages.length}
                                        isEdit={true}
                                        errors={packageForm.errors}
                                    />
                                ))}
                            </div>
                        )}

                        {/* {packageForm.data.packages.length > 0 && (
                        <div className="flex w-full justify-end">
                            <Button type="button" onClick={addPackage} className="w-full gap-2 md:w-1/2 lg:w-30">
                                <Plus className="size-4" />
                                Tambah
                            </Button>
                        </div>
                    )} */}

                        <div className="mt-4 flex items-center gap-2">
                            <Button type="submit" disabled={packageForm.processing || !hasUnsavedChanges.package} className="flex-1 md:w-45 md:flex-none">
                                {packageForm.processing ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan'
                                )}
                            </Button>
                            <Button type="button" variant="secondary" className="flex-1 md:w-45 md:flex-none" onClick={() => router.visit(services.index().url)}>
                                Kembali
                            </Button>
                        </div>
                    </form>
                </TabsContent>

                {/* ───────────────── FAQ Section ───────────────── */}
                <TabsContent value="faq" className="space-y-4">
                    <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
                            <div>
                                <h2 className="text-xl font-semibold">FAQ (Frequently Asked Questions)</h2>
                                <p className="mt-0.5 text-sm text-muted-foreground">Kelola pertanyaan yang sering diajukan terkait layanan ini.</p>
                            </div>
                            <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                                <Button type="button" variant="secondary" className="w-full md:w-30" onClick={() => openAiDrawer('faq')}>
                                    <Sparkles className="size-4" />
                                    Generate AI
                                </Button>
                                {faqForm.data.faqs.length > 0 && (
                                    <Button type="button" onClick={addFaq} className="w-full md:w-30">
                                        <Plus className="size-4" />
                                        Tambah
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmitFaq}>
                        {faqForm.data.faqs.length === 0 ? (
                            <div className="rounded-xl bg-sidebar p-6 shadow md:p-6 dark:shadow-none">
                                <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border py-16 text-muted-foreground">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                        <HelpCircle className="size-5 text-primary" />
                                    </div>
                                    <p className="text-sm">Belum ada FAQ</p>
                                    <Button type="button" onClick={addFaq} className="gap-2">
                                        <Plus className="size-4" />
                                        Tambah FAQ Pertama
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {faqForm.data.faqs.map((faq, i) => (
                                    <FaqCard
                                        key={faq._key}
                                        faq={faq}
                                        index={i}
                                        onChange={(updated) => updateFaq(faq._key, updated)}
                                        onDelete={() => deleteFaq(faq._key)}
                                        onMoveUp={() => faqHandlers.moveUp(i)}
                                        onMoveDown={() => faqHandlers.moveDown(i)}
                                        totalItems={faqForm.data.faqs.length}
                                        isEdit={true}
                                        errors={faqForm.errors}
                                    />
                                ))}
                            </div>
                        )}

                        {/* {faqForm.data.faqs.length > 0 && (
                        <div className="flex w-full justify-end">
                            <Button type="button" onClick={addFaq} className="w-full gap-2 md:w-1/2 lg:w-30">
                                <Plus className="size-4" />
                                Tambah
                            </Button>
                        </div>
                    )} */}

                        <div className="mt-4 flex items-center gap-2">
                            <Button type="submit" disabled={faqForm.processing || !hasUnsavedChanges.faq} className="flex-1 md:w-45 md:flex-none">
                                {faqForm.processing ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan'
                                )}
                            </Button>
                            <Button type="button" variant="secondary" className="flex-1 md:w-45 md:flex-none" onClick={() => router.visit(services.index().url)}>
                                Kembali
                            </Button>
                        </div>
                    </form>
                </TabsContent>

                {/* ───────────────── Legal Basis Section ───────────────── */}
                <TabsContent value="legal-basis" className="space-y-4">
                    <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
                            <div>
                                <h2 className="text-xl font-semibold">Dasar Hukum</h2>
                                <p className="mt-0.5 text-sm text-muted-foreground">Kelola referensi peraturan dan undang-undang yang menjadi dasar layanan.</p>
                            </div>
                            <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                                <Button type="button" variant="secondary" className="w-full md:w-30" onClick={() => openAiDrawer('legal-bases')}>
                                    <Sparkles className="size-4" />
                                    Generate AI
                                </Button>
                                {legalBasisForm.data.legal_bases.length > 0 && (
                                    <Button type="button" onClick={addLegalBasis} className="w-full md:w-30">
                                        <Plus className="size-4" />
                                        Tambah
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmitLegalBasis}>
                        {legalBasisForm.data.legal_bases.length === 0 ? (
                            <div className="rounded-xl bg-sidebar p-6 shadow md:p-6 dark:shadow-none">
                                <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border py-16 text-muted-foreground">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                        <Scale className="size-5 text-primary" />
                                    </div>
                                    <p className="text-sm">Belum ada dasar hukum</p>
                                    <Button type="button" onClick={addLegalBasis} className="gap-2">
                                        <Plus className="size-4" />
                                        Tambah Dasar Hukum Pertama
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {legalBasisForm.data.legal_bases.map((legal, i) => (
                                    <LegalBasisCard
                                        key={legal._key}
                                        legalBasis={legal}
                                        index={i}
                                        onChange={(updated) => updateLegalBasis(legal._key, updated)}
                                        onDelete={() => deleteLegalBasis(legal._key)}
                                        onMoveUp={() => legalBasisHandlers.moveUp(i)}
                                        onMoveDown={() => legalBasisHandlers.moveDown(i)}
                                        totalItems={legalBasisForm.data.legal_bases.length}
                                        isEdit={true}
                                        errors={legalBasisForm.errors}
                                    />
                                ))}
                            </div>
                        )}

                        {/* {legalBasisForm.data.legal_bases.length > 0 && (
                        <div className="flex w-full justify-end">
                            <Button type="button" onClick={addLegalBasis} className="w-full gap-2 md:w-1/2 lg:w-30">
                                <Plus className="size-4" />
                                Tambah
                            </Button>
                        </div>
                    )} */}

                        <div className="mt-4 flex items-center gap-2">
                            <Button type="submit" disabled={legalBasisForm.processing || !hasUnsavedChanges['legal-basis']} className="flex-1 md:w-45 md:flex-none">
                                {legalBasisForm.processing ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan'
                                )}
                            </Button>
                            <Button type="button" variant="secondary" className="flex-1 md:w-45 md:flex-none" onClick={() => router.visit(services.index().url)}>
                                Kembali
                            </Button>
                        </div>
                    </form>
                </TabsContent>

                {/* ───────────────── Requirement Section ───────────────── */}
                <TabsContent value="requirement" className="space-y-4">
                    <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
                            <div>
                                <h2 className="text-xl font-semibold">Persyaratan</h2>
                                <p className="mt-0.5 text-sm text-muted-foreground">Kelola kategori dan daftar persyaratan dokumen yang dibutuhkan.</p>
                            </div>
                            <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                                <Button type="button" variant="secondary" className="w-full md:w-30" onClick={() => openAiDrawer('requirements')}>
                                    <Sparkles className="size-4" />
                                    Generate AI
                                </Button>
                                {requirementCategoriesForm.data.requirement_categories.length > 0 && (
                                    <Button type="button" onClick={addRequirementCategory} className="w-full md:w-30">
                                        <Plus className="size-4" />
                                        Tambah
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmitRequirement}>
                        {requirementCategoriesForm.data.requirement_categories.length === 0 ? (
                            <div className="rounded-xl bg-sidebar p-6 shadow md:p-6 dark:shadow-none">
                                <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border py-16 text-muted-foreground">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                        <ClipboardList className="size-5 text-primary" />
                                    </div>
                                    <p className="text-sm">Belum ada kategori persyaratan</p>
                                    <Button type="button" onClick={addRequirementCategory} className="gap-2">
                                        <Plus className="size-4" />
                                        Tambah Kategori Pertama
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {requirementCategoriesForm.data.requirement_categories.map((cat, i) => (
                                    <RequirementCard
                                        key={cat._key}
                                        category={cat}
                                        index={i}
                                        onChange={(updated) => updateRequirementCategory(cat._key, updated)}
                                        onDelete={() => deleteRequirementCategory(cat._key)}
                                        onMoveUp={() => requirementCategoryHandlers.moveUp(i)}
                                        onMoveDown={() => requirementCategoryHandlers.moveDown(i)}
                                        totalItems={requirementCategoriesForm.data.requirement_categories.length}
                                        isEdit={true}
                                        errors={requirementCategoriesForm.errors}
                                    />
                                ))}
                            </div>
                        )}

                        {/* {requirementCategoriesForm.data.requirement_categories.length > 0 && (
                        <div className="flex w-full justify-end">
                            <Button type="button" onClick={addRequirementCategory} className="w-full gap-2 md:w-1/2 lg:w-30">
                                <Plus className="size-4" />
                                Tambah
                            </Button>
                        </div>
                    )} */}

                        <div className="mt-4 flex items-center gap-2">
                            <Button type="submit" disabled={requirementCategoriesForm.processing || !hasUnsavedChanges.requirement} className="flex-1 md:w-45 md:flex-none">
                                {requirementCategoriesForm.processing ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan'
                                )}
                            </Button>
                            <Button type="button" variant="secondary" className="flex-1 md:w-45 md:flex-none" onClick={() => router.visit(services.index().url)}>
                                Kembali
                            </Button>
                        </div>
                    </form>
                </TabsContent>

                {/* ───────────────── Timeline Section ───────────────── */}
                <TabsContent value="timeline" className="space-y-4">
                    <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
                            <div>
                                <h2 className="text-xl font-semibold">Tahapan Proses</h2>
                                <p className="mt-0.5 text-sm text-muted-foreground">Kelola langkah-langkah proses pengerjaan layanan secara berurutan.</p>
                            </div>
                            <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                                <Button type="button" variant="secondary" className="w-full md:w-30" onClick={() => openAiDrawer('process-steps')}>
                                    <Sparkles className="size-4" />
                                    Generate AI
                                </Button>
                                {processStepsForm.data.process_steps.length > 0 && (
                                    <Button type="button" onClick={addProcessStep} className="w-full md:w-30">
                                        <Plus className="size-4" />
                                        Tambah
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmitProcessStep}>
                        {processStepsForm.data.process_steps.length === 0 ? (
                            <div className="rounded-xl bg-sidebar p-6 shadow md:p-6 dark:shadow-none">
                                <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border py-16 text-muted-foreground">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                        <ClipboardList className="size-5 text-primary" />
                                    </div>
                                    <p className="text-sm">Belum ada tahapan proses</p>
                                    <Button type="button" onClick={addProcessStep} className="gap-2">
                                        <Plus className="size-4" />
                                        Tambah Tahap Pertama
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {processStepsForm.data.process_steps.map((step, i) => (
                                    <ProcessStepCard
                                        key={step._key}
                                        step={step}
                                        index={i}
                                        onChange={(updated) => updateProcessStep(step._key, updated)}
                                        onDelete={() => deleteProcessStep(step._key)}
                                        onMoveUp={() => processStepHandlers.moveUp(i)}
                                        onMoveDown={() => processStepHandlers.moveDown(i)}
                                        totalItems={processStepsForm.data.process_steps.length}
                                        isEdit={true}
                                        errors={processStepsForm.errors}
                                    />
                                ))}
                            </div>
                        )}

                        {/* {processStepsForm.data.process_steps.length > 0 && (
                        <div className="flex w-full justify-end">
                            <Button type="button" onClick={addProcessStep} className="w-full gap-2 md:w-1/2 lg:w-30">
                                <Plus className="size-4" />
                                Tambah
                            </Button>
                        </div>
                    )} */}

                        <div className="mt-4 flex items-center gap-2">
                            <Button type="submit" disabled={processStepsForm.processing || !hasUnsavedChanges.timeline} className="flex-1 md:w-45 md:flex-none">
                                {processStepsForm.processing ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan'
                                )}
                            </Button>
                            <Button type="button" variant="secondary" className="flex-1 md:w-45 md:flex-none" onClick={() => router.visit(services.index().url)}>
                                Kembali
                            </Button>
                        </div>
                    </form>
                </TabsContent>

                {/* ───────────────── SEO Section ───────────────── */}
                <TabsContent value="seo">
                    <form onSubmit={handleSubmitSeo}>
                        <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                            <div className="space-y-4">
                                <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
                                    <div>
                                        <h2 className="text-xl font-semibold">Pengaturan SEO</h2>
                                        <p className="mt-0.5 text-sm text-muted-foreground">Kelola meta tags, open graph, dan sitemap untuk halaman layanan ini.</p>
                                    </div>

                                    <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                                        <Button type="button" variant="secondary" className="w-full md:w-30" onClick={() => openAiDrawer('seo')}>
                                            <Sparkles className="size-4" />
                                            Generate AI
                                        </Button>
                                    </div>
                                </div>

                                <SeoCard
                                    seo={seoForm.data}
                                    onChange={(updated) => seoForm.setData(updated)}
                                    errors={seoForm.errors}
                                    schemaMarkup={service.seo?.schema_markup ?? null}
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                            <Button type="submit" disabled={seoForm.processing || !hasUnsavedChanges.seo} className="flex-1 md:w-45 md:flex-none">
                                {seoForm.processing ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan'
                                )}
                            </Button>
                            <Button type="button" variant="secondary" className="flex-1 md:w-45 md:flex-none" onClick={() => router.visit(services.index().url)}>
                                Kembali
                            </Button>
                        </div>
                    </form>
                </TabsContent>
            </Tabs>

            <AiGenerateDrawer
                open={aiDrawer.open}
                onOpenChange={(open) => setAiDrawer((prev) => ({ ...prev, open }))}
                type={aiDrawer.type}
                service={service}
                onApply={handleAiApply}
            />
        </>
    );
}
