/* eslint-disable react-hooks/purity */
import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import { deleteItemAndReindex, moveItemDown, moveItemUp } from '@/lib/service';
import templates from '@/routes/projects/templates';
import type { Service, ServiceStatus } from '@/types/service';

import type { LocalDocument } from '../../_components/document-card';
import { DocumentCard } from '../../_components/document-card';
import type { LocalMilestone } from '../../_components/milestone-card';
import { MilestoneCard } from '../../_components/milestone-card';

type FormData = {
    service_id: number | null;
    name: string;
    description: string;
    estimated_duration_days: number | null;
    status: ServiceStatus;
    milestones: LocalMilestone[];
    documents: LocalDocument[];
    notes: string;
    is_active: boolean;
};

type EditSectionProps = {
    services: Service[];
    template: {
        id: number;
        service_id: number | null;
        name: string;
        description: string | null;
        estimated_duration_days: number | null;
        status: ServiceStatus;
        milestones: Array<{
            title: string;
            description: string | null;
            estimated_duration_days: number;
            day_offset: number;
            sort_order: number;
        }> | null;
        documents: Array<{
            name: string;
            description: string | null;
            document_format: string | null;
            is_required: boolean;
            notes: string | null;
            sort_order: number;
        }> | null;
        notes: string | null;
        is_active: boolean;
    };
};

export function EditSection({ services, template }: EditSectionProps) {
    const { data, setData, put, processing, errors, reset } = useForm<FormData>({
        service_id: template.service_id,
        name: template.name,
        description: template.description || '',
        estimated_duration_days: template.estimated_duration_days,
        status: template.status,
        milestones: (template.milestones ?? []).map((m) => ({
            ...m,
            _key: Math.random().toString(36).slice(2, 9),
        })) as LocalMilestone[],
        documents: (template.documents ?? []).map((d) => ({
            ...d,
            _key: Math.random().toString(36).slice(2, 9),
        })) as LocalDocument[],
        notes: template.notes || '',
        is_active: template.is_active,
    });

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
                _key: `milestone-new-${Date.now()}`,
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
                _key: `doc-new-${Date.now()}`,
                name: '',
                description: null,
                document_format: 'PDF',
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
            description: 'Template project sedang diperbarui.',
        });

        put(templates.update(template.id).url, {
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Template project berhasil diperbarui',
                });
            },
            onError: () => {
                toast.error('Gagal', {
                    description: 'Template project gagal diperbarui. Silakan periksa kembali data yang diisi.',
                });
            },
            onFinish: () => {
                toast.dismiss(id);
            },
        });
    };

    const handleCancel = () => {
        reset();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* BASIC INFORMATION */}
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold">Informasi Dasar</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Kelola identitas dan deskripsi template</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {/* Status */}

                        <Field>
                            <FieldLabel>Status</FieldLabel>
                            <Select value={data.status} onValueChange={(value) => setData('status', value as ServiceStatus)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="name">
                                Nama Template <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Input id="name" required placeholder="Masukkan nama template" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            {errors.name && <FieldError>{errors.name}</FieldError>}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="service">Jenis Layanan</FieldLabel>
                            <Select value={data.service_id ? String(data.service_id) : 'null'} onValueChange={(val) => setData('service_id', val === 'null' ? null : Number(val))}>
                                <SelectTrigger id="service">
                                    <SelectValue placeholder="Pilih jenis layanan..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Layanan</SelectLabel>
                                        <SelectItem value="null">Tidak ada layanan</SelectItem>
                                        {services.map((service) => (
                                            <SelectItem key={service.id} value={String(service.id)}>
                                                {service.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {errors.service_id && <FieldError>{errors.service_id}</FieldError>}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="duration">Estimasi Durasi (hari)</FieldLabel>
                            <Input
                                id="duration"
                                type="number"
                                min={1}
                                placeholder="Contoh: 30"
                                value={data.estimated_duration_days || ''}
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

                    <div className="flex items-start gap-4 rounded-lg border border-primary bg-transparent p-4 dark:bg-input/30">
                        <Switch id="is_active" checked={data.is_active} onCheckedChange={(val) => setData('is_active', val)} />
                        <div className="flex-1">
                            <Label htmlFor="is_active" className="cursor-pointer text-sm font-medium">
                                Status Aktif
                            </Label>
                            <p className="text-sm text-muted-foreground">Template aktif dapat digunakan untuk membuat project baru</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* MILESTONES */}
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-6">
                    <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
                        <div>
                            <h2 className="text-xl font-bold">Milestone</h2>
                            <p className="mt-0.5 text-sm text-muted-foreground">Kelola tahapan-tahapan dalam project template</p>
                        </div>

                        {data.milestones.length > 0 && (
                            <Button type="button" onClick={addMilestone} size="sm" className="w-full gap-1.5 md:w-auto">
                                <Plus className="size-4" />
                                Tambah Milestone
                            </Button>
                        )}
                    </div>

                    {data.milestones.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border py-16 text-muted-foreground">
                            <p className="text-sm">Belum ada milestone</p>
                            <Button type="button" size="sm" onClick={addMilestone} className="gap-1.5">
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

                    {data.milestones.length > 0 && (
                        <div className="flex w-full justify-end">
                            <Button type="button" onClick={addMilestone} size="sm" className="w-full gap-1.5 md:w-auto">
                                <Plus className="size-4" />
                                Tambah Milestone
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* DOCUMENTS */}
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-6">
                    <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
                        <div>
                            <h2 className="text-xl font-bold">Dokumen</h2>
                            <p className="mt-0.5 text-sm text-muted-foreground">Kelola daftar dokumen yang diperlukan dalam project</p>
                        </div>
                        {data.documents.length > 0 && (
                            <Button type="button" onClick={addDocument} size="sm" className="w-full gap-1.5 md:w-auto">
                                <Plus className="size-4" />
                                Tambah Dokumen
                            </Button>
                        )}
                    </div>

                    {data.documents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border py-16 text-muted-foreground">
                            <p className="text-sm">Belum ada dokumen</p>
                            <Button type="button" size="sm" onClick={addDocument} className="gap-1.5">
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

                    {data.documents.length > 0 && (
                        <div className="flex w-full justify-end">
                            <Button type="button" onClick={addDocument} size="sm" className="w-full gap-1.5 md:w-auto">
                                <Plus className="size-4" />
                                Tambah Dokumen
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-3">
                <Button type="submit" disabled={processing}>
                    {processing ? (
                        <>
                            <Spinner className="mr-2" />
                            Menyimpan...
                        </>
                    ) : (
                        'Simpan Perubahan'
                    )}
                </Button>
                <Button type="button" variant="secondary" onClick={handleCancel} disabled={processing}>
                    Batal
                </Button>
            </div>
        </form>
    );
}
