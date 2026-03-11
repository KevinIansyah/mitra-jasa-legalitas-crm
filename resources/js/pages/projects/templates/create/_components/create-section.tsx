import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { FileText, Plus, Target } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

import { deleteItemAndReindex, moveItemDown, moveItemUp } from '@/lib/service';
import templates from '@/routes/projects/templates';
import type { ProjectTemplateStatus, ProjectTemplateWithService } from '@/types/project-template';
import type { Service } from '@/types/service';

import type { LocalDocument } from '../../_components/document-card';
import { DocumentCard } from '../../_components/document-card';
import type { LocalMilestone } from '../../_components/milestone-card';
import { MilestoneCard } from '../../_components/milestone-card';

type FormData = {
    service_id: number | null;
    name: string;
    description: string;
    estimated_duration_days: number | null;
    milestones: LocalMilestone[];
    documents: LocalDocument[];
    notes: string;
    status: ProjectTemplateStatus;
};

type CreateSectionProps = {
    services: Service[];
};

type CreationMode = 'custom' | 'from_service';

export function CreateSection({ services }: CreateSectionProps) {
    const [mode, setMode] = useState<CreationMode>('custom');
    const [isLoadingService, setIsLoadingService] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        service_id: null,
        name: '',
        description: '',
        estimated_duration_days: null,
        milestones: [],
        documents: [],
        notes: '',
        status: 'active',
    });

    // ============================================================
    // SERVICE LOADING
    // ============================================================
    const loadServiceData = async (serviceId: number) => {
        setIsLoadingService(true);

        try {
            const { data: result } = await axios.get<ProjectTemplateWithService>(templates.fromService(serviceId).url);

            const service = services.find((s) => s.id === serviceId);

            setData({
                ...data,
                service_id: serviceId,
                name: `Template - ${service?.name || ''}`,
                description: service?.short_description || '',
                estimated_duration_days: result.estimated_duration_days,
                milestones: result.milestones!.map((m) => ({
                    ...m,
                    _key: Math.random().toString(36).slice(2, 9),
                })) as LocalMilestone[],
                documents: result.documents!.map((d) => ({
                    ...d,
                    _key: Math.random().toString(36).slice(2, 9),
                })) as LocalDocument[],
            });

            toast.success('Berhasil', {
                description: 'Data layanan berhasil dimuat',
            });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error('Gagal', {
                    description: error.response?.data?.message || error.message,
                });
            } else {
                toast.error('Gagal', {
                    description: 'Data layanan gagal dimuat',
                });
            }
        } finally {
            setIsLoadingService(false);
        }
    };

    // ============================================================
    // MILESTONE HANDLERS
    // ============================================================
    const createMoveHandlers = <T extends { sort_order: number }>(items: T[], setItems: (items: T[]) => void) => ({
        moveUp: (index: number) => setItems(moveItemUp(items, index)),
        moveDown: (index: number) => setItems(moveItemDown(items, index)),
    });

    const addMilestone = () => {
        let newDayOffset = 0;
        if (data.milestones.length > 0) {
            const lastMilestone = data.milestones[data.milestones.length - 1];
            newDayOffset = (lastMilestone.day_offset || 0) + (lastMilestone.estimated_duration_days || 0);
        }

        setData('milestones', [
            ...data.milestones,
            {
                _key: Math.random().toString(36).slice(2, 9),
                title: '',
                description: null,
                estimated_duration_days: 1,
                day_offset: newDayOffset,
                sort_order: data.milestones.length,
            },
        ]);
    };

    const updateMilestone = (_key: string, updated: LocalMilestone) =>
        setData(
            'milestones',
            data.milestones.map((m) => (m._key === _key ? updated : m)),
        );

    const deleteMilestone = (_key: string) => setData('milestones', deleteItemAndReindex(data.milestones, _key));

    const milestoneHandlers = createMoveHandlers(data.milestones, (milestones) => setData('milestones', milestones));

    // ============================================================
    // DOCUMENT HANDLERS
    // ============================================================
    const addDocument = () =>
        setData('documents', [
            ...data.documents,
            {
                _key: Math.random().toString(36).slice(2, 9),
                name: '',
                description: null,
                document_format: 'pdf',
                is_required: true,
                notes: null,
                sort_order: data.documents.length,
            },
        ]);

    const updateDocument = (_key: string, updated: LocalDocument) =>
        setData(
            'documents',
            data.documents.map((d) => (d._key === _key ? updated : d)),
        );

    const deleteDocument = (_key: string) => setData('documents', deleteItemAndReindex(data.documents, _key));

    const documentHandlers = createMoveHandlers(data.documents, (documents) => setData('documents', documents));

    // ============================================================
    // FORM SUBMISSION
    // ============================================================
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Template sedang ditambahkan.',
        });

        post(templates.store().url, {
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Template berhasil ditambahkan.',
                });
                reset();
            },
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat menambahkan template, coba lagi.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => {
                toast.dismiss(id);
            },
        });
    };

    const handleCancel = () => {
        reset();
        setMode('custom');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* MODE SELECTION */}
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold">Mode Pembuatan Template</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Pilih cara membuat template: dari layanan yang ada atau buat custom</p>
                    </div>

                    <RadioGroup value={mode} onValueChange={(val) => setMode(val as CreationMode)}>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="flex items-start gap-4 rounded-lg border border-primary bg-transparent p-4 dark:bg-input/30">
                                <RadioGroupItem value="custom" id="mode-custom" />
                                <div className="flex-1">
                                    <Label htmlFor="mode-custom" className="cursor-pointer font-medium">
                                        Custom Template
                                    </Label>
                                    <p className="text-sm text-muted-foreground">Buat template kosong dan isi manual</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 rounded-lg border border-primary bg-transparent p-4 dark:bg-input/30">
                                <RadioGroupItem value="from_service" id="mode-service" />
                                <div className="flex-1">
                                    <Label htmlFor="mode-service" className="cursor-pointer font-medium">
                                        Dari Layanan
                                    </Label>
                                    <p className="text-sm text-muted-foreground">Generate otomatis dari layanan yang ada</p>
                                </div>
                            </div>
                        </div>
                    </RadioGroup>

                    {mode === 'from_service' && (
                        <Field>
                            <FieldLabel>
                                Pilih Layanan <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Select value={data.service_id ? String(data.service_id) : ''} onValueChange={(val) => loadServiceData(Number(val))} disabled={isLoadingService}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih layanan..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Layanan</SelectLabel>
                                        {services.map((service) => (
                                            <SelectItem key={service.id} value={String(service.id)}>
                                                {service.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {isLoadingService && (
                                <p className="text-sm text-muted-foreground">
                                    <Spinner className="mr-2 inline" />
                                    Memuat data layanan...
                                </p>
                            )}
                            {errors.service_id && <FieldError>{errors.service_id}</FieldError>}
                        </Field>
                    )}
                </div>
            </div>

            {/* BASIC INFORMATION */}
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold">Informasi Dasar</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Kelola identitas dan deskripsi template</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="name">
                                Nama Template <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Input id="name" required placeholder="Masukkan nama template" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            {errors.name && <FieldError>{errors.name}</FieldError>}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="duration">Estimasi Durasi (hari)</FieldLabel>
                            <Input
                                id="duration"
                                type="number"
                                min={1}
                                placeholder="Contoh: 30"
                                value={data.estimated_duration_days || 0}
                                onChange={(e) => setData('estimated_duration_days', e.target.value ? Number(e.target.value) : null)}
                            />
                            {errors.estimated_duration_days && <FieldError>{errors.estimated_duration_days}</FieldError>}
                        </Field>
                    </div>

                    <Field>
                        <FieldLabel htmlFor="description">Deskripsi</FieldLabel>
                        <Textarea
                            id="description"
                            className="min-h-24"
                            placeholder="Tambahkan deskripsi template"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                        {errors.description && <FieldError>{errors.description}</FieldError>}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="notes">Catatan</FieldLabel>
                        <Textarea id="notes" className="min-h-24" placeholder="Catatan tambahan (opsional)" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                        {errors.notes && <FieldError>{errors.notes}</FieldError>}
                    </Field>
                </div>
            </div>

            {/* MILESTONES */}
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-6">
                    <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
                        <div>
                            <h2 className="text-xl font-semibold">Milestone</h2>
                            <p className="mt-0.5 text-sm text-muted-foreground">Kelola tahapan-tahapan dalam project template</p>
                        </div>
                        {data.milestones.length > 0 && (
                            <Button type="button" onClick={addMilestone} className="ml-auto w-[50%] md:ml-0 md:w-30">
                                <Plus className="size-4" />
                                Tambah
                            </Button>
                        )}
                    </div>

                    {data.milestones.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border py-16 text-muted-foreground">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                <Target className="size-5 text-primary" />
                            </div>
                            <p className="text-sm">Belum ada milestone</p>
                            <Button type="button" onClick={addMilestone}>
                                <Plus className="size-4" />
                                Tambah Milestone Pertama
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {data.milestones.map((milestone, i) => (
                                <MilestoneCard
                                    key={milestone._key}
                                    milestone={milestone}
                                    index={i}
                                    onChange={(updated) => updateMilestone(milestone._key, updated)}
                                    onDelete={() => deleteMilestone(milestone._key)}
                                    onMoveUp={() => milestoneHandlers.moveUp(i)}
                                    onMoveDown={() => milestoneHandlers.moveDown(i)}
                                    totalItems={data.milestones.length}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* DOCUMENTS */}
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-6">
                    <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
                        <div>
                            <h2 className="text-xl font-semibold">Dokumen</h2>
                            <p className="mt-0.5 text-sm text-muted-foreground">Kelola daftar dokumen yang diperlukan dalam project</p>
                        </div>
                        {data.documents.length > 0 && (
                            <Button type="button" onClick={addDocument} className="w-[50%] md:w-30">
                                <Plus className="size-4" />
                                Tambah
                            </Button>
                        )}
                    </div>

                    {data.documents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border py-16 text-muted-foreground">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                <FileText className="size-5 text-primary" />
                            </div>
                            <p className="text-sm">Belum ada dokumen</p>
                            <Button type="button" onClick={addDocument}>
                                <Plus className="size-4" />
                                Tambah Dokumen Pertama
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {data.documents.map((document, i) => (
                                <DocumentCard
                                    key={document._key}
                                    document={document}
                                    index={i}
                                    onChange={(updated) => updateDocument(document._key, updated)}
                                    onDelete={() => deleteDocument(document._key)}
                                    onMoveUp={() => documentHandlers.moveUp(i)}
                                    onMoveDown={() => documentHandlers.moveDown(i)}
                                    totalItems={data.documents.length}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-2">
                <Button type="submit" className="flex-1 md:w-45 md:flex-none" disabled={processing || isLoadingService}>
                    {processing ? (
                        <>
                            <Spinner className="mr-2" />
                            Menyimpan...
                        </>
                    ) : (
                        'Simpan'
                    )}
                </Button>
                <Button type="button" variant="secondary" className="flex-1 md:w-45 md:flex-none" onClick={handleCancel} disabled={processing || isLoadingService}>
                    Batal
                </Button>
            </div>
        </form>
    );
}
