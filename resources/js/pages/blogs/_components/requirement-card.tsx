import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { ServiceStatus } from '@/types/service';

export type LocalRequirementItem = {
    id?: number;
    _key: string;
    name: string;
    description: string | null;
    is_required: boolean;
    document_format: string | null;
    notes: string | null;
    sort_order: number;
};

export type LocalRequirementCategory = {
    id?: number;
    _key: string;
    name: string;
    description: string | null;
    sort_order: number;
    requirements: LocalRequirementItem[];
    status: ServiceStatus;
};

type RequirementCardProps = {
    category: LocalRequirementCategory;
    index: number;
    totalItems: number;
    onChange: (updated: LocalRequirementCategory) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isEdit?: boolean | false;
    errors?: Record<string, string>;
};

const uid = () => Math.random().toString(36).slice(2, 9);

export function RequirementCard({ category, index, totalItems, onChange, onDelete, onMoveUp, onMoveDown, isEdit, errors = {} }: RequirementCardProps) {
    const [requirementInput, setRequirementInput] = useState('');

    const update = (patch: Partial<LocalRequirementCategory>) => onChange({ ...category, ...patch });

    const addRequirement = () => {
        const trimmed = requirementInput.trim();
        if (!trimmed) return;
        update({
            requirements: [
                ...category.requirements,
                {
                    _key: uid(),
                    name: trimmed,
                    description: '',
                    is_required: true,
                    document_format: '',
                    notes: '',
                    sort_order: category.requirements.length,
                },
            ],
        });
        setRequirementInput('');
    };

    const updateRequirement = (_key: string, patch: Partial<LocalRequirementItem>) =>
        update({
            requirements: category.requirements.map((r) => (r._key === _key ? { ...r, ...patch } : r)),
        });

    const deleteRequirement = (_key: string) =>
        update({
            requirements: category.requirements.filter((r) => r._key !== _key),
        });

    return (
        <div className="space-y-4 rounded-xl border border-primary/30 bg-input/30 p-4 dark:border-none">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="size-4 cursor-grab" />
                    <span className="text-sm font-semibold text-foreground">Kategori #{index + 1}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button type="button" variant="outline" size="icon" onClick={onMoveUp} disabled={index === 0} className="h-8 w-8" title="Pindah ke atas">
                        <ArrowUp className="size-4" />
                    </Button>

                    <Button type="button" variant="outline" size="icon" onClick={onMoveDown} disabled={index === totalItems - 1} className="h-8 w-8" title="Pindah ke bawah">
                        <ArrowDown className="size-4" />
                    </Button>

                    <Button type="button" variant="destructive" size="icon" onClick={onDelete} className="h-8 w-8" title="Hapus FAQ">
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </div>

            {/* Status */}
            {isEdit && (
                <Field>
                    <FieldLabel>Status</FieldLabel>
                    <Select value={category.status} onValueChange={(value) => update({ status: value as ServiceStatus })}>
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
            )}

            {/* Name */}
            <Field>
                <FieldLabel>
                    Nama Kategori <span className="text-destructive">*</span>
                </FieldLabel>
                <Input value={category.name} required onChange={(e) => update({ name: e.target.value })} placeholder="Contoh: Dokumen Pribadi Pemohon" />
                {errors[`requirement_categories.${index}.name`] && <FieldError>{errors[`requirement_categories.${index}.name`]}</FieldError>}
            </Field>

            {/* Description */}
            <Field>
                <FieldLabel>Deskripsi Kategori</FieldLabel>
                <Textarea
                    value={category.description || ''}
                    onChange={(e) => update({ description: e.target.value })}
                    placeholder="Penjelasan singkat tentang kategori ini"
                    className="min-h-24 resize-none"
                    rows={2}
                />
            </Field>

            {/* Requirements List */}
            <Field>
                <FieldLabel>Daftar Persyaratan</FieldLabel>
                {category.requirements.length > 0 && (
                    <div className="mb-3 space-y-4">
                        {category.requirements.map((req) => (
                            <div key={req._key} className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
                                <div className="flex items-center gap-3">
                                    <Switch id={`req-${req._key}`} checked={req.is_required} onCheckedChange={(val) => updateRequirement(req._key, { is_required: val })} />
                                    <label
                                        htmlFor={`req-${req._key}`}
                                        className={`flex-1 cursor-pointer text-sm font-medium select-none ${req.is_required ? 'text-foreground' : 'text-muted-foreground'}`}
                                    >
                                        {req.name}
                                        {req.is_required && <span className="ml-1 text-destructive">*</span>}
                                    </label>
                                    <button type="button" onClick={() => deleteRequirement(req._key)} className="text-muted-foreground transition-colors hover:text-destructive">
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </div>
                                {/* Requirement Description */}
                                <Input
                                    value={req.description || ''}
                                    onChange={(e) => updateRequirement(req._key, { description: e.target.value })}
                                    placeholder="Deskripsi / keterangan"
                                    className="text-xs"
                                />
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {/* Requirement Document Format */}
                                    <Input
                                        value={req.document_format || ''}
                                        onChange={(e) => updateRequirement(req._key, { document_format: e.target.value })}
                                        placeholder="Format (PDF, JPG, dll)"
                                        className="text-xs"
                                    />
                                    {/* Requirement Notes */}
                                    <Input
                                        value={req.notes || ''}
                                        onChange={(e) => updateRequirement(req._key, { notes: e.target.value })}
                                        placeholder="Catatan tambahan"
                                        className="text-xs"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex gap-2">
                    {/* Requirement Name */}
                    <Input
                        value={requirementInput}
                        onChange={(e) => setRequirementInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                        placeholder="Contoh: KTP Pemohon"
                        className="flex-1"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={addRequirement}>
                        <Plus className="size-4" />
                    </Button>
                </div>
            </Field>
        </div>
    );
}
