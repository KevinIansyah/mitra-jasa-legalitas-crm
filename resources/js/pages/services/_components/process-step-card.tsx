import { Clock, FileText, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ServiceCardAction } from '@/components/service-card-action';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { ServiceStatus } from '@/types/service';

export type LocalProcessStep = {
    id?: number;
    _key: string;
    title: string;
    description: string | null;
    duration: string | null;
    duration_days: number | null;
    required_documents: string[] | null;
    notes: string | null;
    icon: string | null;
    sort_order: number;
    status: ServiceStatus;
};

type ProcessStepCardProps = {
    step: LocalProcessStep;
    index: number;
    totalItems: number;
    onChange: (updated: LocalProcessStep) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isEdit?: boolean | false;
    errors?: Record<string, string>;
};

export function ProcessStepCard({ step, index, totalItems, onChange, onDelete, onMoveUp, onMoveDown, isEdit, errors = {} }: ProcessStepCardProps) {
    const [documentInput, setDocumentInput] = useState('');

    const update = (patch: Partial<LocalProcessStep>) => onChange({ ...step, ...patch });

    const addDocument = () => {
        const trimmed = documentInput.trim();
        if (!trimmed) return;
        update({
            required_documents: [...(step.required_documents ?? []), trimmed],
        });
        setDocumentInput('');
    };

    const deleteDocument = (docIndex: number) =>
        update({
            required_documents: (step.required_documents ?? []).filter((_, i) => i !== docIndex),
        });

    return (
        <div className="space-y-4 rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="size-4 cursor-grab" />
                    <span className="text-sm font-semibold text-foreground">Tahap #{index + 1}</span>
                </div>
                <div className="flex items-center gap-1">
                    <ServiceCardAction index={index} totalItems={totalItems} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDelete={onDelete} direction="vertical" />
                </div>
            </div>

            <div className={`grid gap-4 ${isEdit ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
                {/* Status */}
                {isEdit && (
                    <Field className="col-span-1">
                        <FieldLabel>Status</FieldLabel>
                        <Select value={step.status} onValueChange={(value) => update({ status: value as ServiceStatus })}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Status</SelectLabel>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>
                )}

                {/* Title */}
                <Field className="col-span-2">
                    <FieldLabel>
                        Judul Tahap <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input value={step.title} required onChange={(e) => update({ title: e.target.value })} placeholder="Contoh: Konsultasi Awal & Analisis Kebutuhan" />
                    {errors[`process_steps.${index}.title`] && <FieldError>{errors[`process_steps.${index}.title`]}</FieldError>}
                </Field>
            </div>

            {/* Description */}
            <Field>
                <FieldLabel>Deskripsi</FieldLabel>
                <Textarea
                    value={step.description ?? ''}
                    onChange={(e) => update({ description: e.target.value })}
                    placeholder="Jelaskan detail tahapan ini"
                    className="min-h-24 resize-none"
                    rows={4}
                />
                {errors[`process_steps.${index}.description`] && <FieldError>{errors[`process_steps.${index}.description`]}</FieldError>}
            </Field>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Duration */}
                <Field>
                    <FieldLabel>Durasi/Waktu</FieldLabel>
                    <div className="relative">
                        <Clock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input value={step.duration ?? ''} onChange={(e) => update({ duration: e.target.value })} placeholder="Contoh: 1-2 hari kerja" className="pl-10" />
                    </div>
                    {errors[`process_steps.${index}.duration`] && <FieldError>{errors[`process_steps.${index}.duration`]}</FieldError>}
                </Field>

                {/* Duration Days */}
                <Field>
                    <FieldLabel>Durasi (dalam hari)</FieldLabel>
                    <Input
                        type="number"
                        min={0}
                        value={step.duration_days ?? ''}
                        onChange={(e) => update({ duration_days: e.target.value ? Number(e.target.value) : null })}
                        placeholder="Opsional"
                    />
                    {errors[`process_steps.${index}.duration_days`] && <FieldError>{errors[`process_steps.${index}.duration_days`]}</FieldError>}
                </Field>
            </div>

            {/* Required Documents */}
            <Field>
                <FieldLabel>Dokumen yang Diperlukan</FieldLabel>
                {step.required_documents && step.required_documents.length > 0 && (
                    <div className="mb-2 space-y-2">
                        {step.required_documents.map((doc, docIndex) => (
                            <div key={docIndex} className="flex items-center justify-between gap-4 rounded-lg bg-primary/10 p-3 dark:bg-muted/40">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                                        <FileText className="size-4 text-primary" />
                                    </div>
                                    <div>
                                        <span className="flex-1 text-sm">{doc}</span>
                                    </div>
                                </div>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="destructive" className="h-8 w-8" onClick={() => deleteDocument(docIndex)}>
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p>Hapus Dokumen</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex gap-2">
                    <Input
                        value={documentInput}
                        onChange={(e) => setDocumentInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDocument())}
                        placeholder="Contoh: Fotokopi KTP"
                        className="flex-1"
                    />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button type="button" size="icon" onClick={addDocument}>
                                <Plus className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>Tambah Dokumen</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </Field>

            {/* Notes */}
            <Field>
                <FieldLabel>Catatan</FieldLabel>
                <Textarea
                    value={step.notes ?? ''}
                    onChange={(e) => update({ notes: e.target.value })}
                    placeholder="Catatan atau informasi tambahan"
                    className="min-h-24 resize-none"
                    rows={2}
                />
                {errors[`process_steps.${index}.notes`] && <FieldError>{errors[`process_steps.${index}.notes`]}</FieldError>}
            </Field>
        </div>
    );
}
