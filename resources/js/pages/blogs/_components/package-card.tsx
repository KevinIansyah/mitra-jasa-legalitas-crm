import { ArrowLeft, ArrowRight, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { formatRupiah, uid } from '@/lib/service';
import type { ServiceStatus } from '@/types/service';

export type LocalFeature = {
    _key: string;
    feature_name: string;
    description: string | null;
    is_included: boolean;
    sort_order: number;
};

export type LocalPackage = {
    _key: string;
    name: string;
    price: number;
    original_price: number | null;
    duration: string;
    duration_days: number | null;
    short_description: string | null;
    is_highlighted: boolean;
    badge: string | null;
    sort_order: number;
    status?: string;
    features: LocalFeature[];
};

type PackageCardProps = {
    pkg: LocalPackage;
    index: number;
    totalItems: number;
    onChange: (updated: LocalPackage) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isEdit?: boolean | false;
    errors?: Record<string, string>;
};

export function PackageCard({ pkg, index, totalItems, onChange, onDelete, onMoveUp, onMoveDown, isEdit, errors = {} }: PackageCardProps) {
    const [featureInput, setFeatureInput] = useState('');

    const update = (patch: Partial<LocalPackage>) => onChange({ ...pkg, ...patch });

    const addFeature = () => {
        const trimmed = featureInput.trim();
        if (!trimmed) return;
        update({
            features: [
                ...pkg.features,
                {
                    _key: uid(),
                    feature_name: trimmed,
                    description: null,
                    is_included: true,
                    sort_order: pkg.features.length,
                },
            ],
        });
        setFeatureInput('');
    };

    const updateFeature = (_key: string, patch: Partial<LocalFeature>) =>
        update({
            features: pkg.features.map((f) => (f._key === _key ? { ...f, ...patch } : f)),
        });

    const deleteFeature = (_key: string) =>
        update({
            features: pkg.features.filter((f) => f._key !== _key),
        });

    return (
        <div className="space-y-4 rounded-xl border border-primary/30 bg-input/30 p-4 dark:border-none">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="size-4 cursor-grab" />
                    <span className="text-sm font-semibold text-foreground">Paket #{index + 1}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button type="button" variant="outline" size="icon" onClick={onMoveUp} disabled={index === 0} className="h-8 w-8" title="Pindah ke atas">
                        <ArrowLeft className="size-4" />
                    </Button>

                    <Button type="button" variant="outline" size="icon" onClick={onMoveDown} disabled={index === totalItems - 1} className="h-8 w-8" title="Pindah ke bawah">
                        <ArrowRight className="size-4" />
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
                    <Select value={pkg.status} onValueChange={(value) => update({ status: value as ServiceStatus })}>
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
                    Nama Paket <span className="text-destructive">*</span>
                </FieldLabel>
                <Input value={pkg.name} required onChange={(e) => update({ name: e.target.value })} placeholder="Contoh: Paket Basic" />
                {errors[`packages.${index}.name`] && <FieldError>{errors[`packages.${index}.name`]}</FieldError>}
            </Field>

            {/* Price */}
            <Field>
                <FieldLabel>
                    Harga (Rp) <span className="text-destructive">*</span>
                </FieldLabel>
                <Input type="number" min={0} value={pkg.price} required onChange={(e) => update({ price: Number(e.target.value) })} placeholder="0" />
                <p className="text-xs text-muted-foreground">{formatRupiah(pkg.price)}</p>
                {errors[`packages.${index}.price`] && <FieldError>{errors[`packages.${index}.price`]}</FieldError>}
            </Field>

            {/* Original Price */}
            {/* <Field>
                <FieldLabel>Harga Asli / Coret (opsional)</FieldLabel>
                <Input
                    type="number"
                    min={0}
                    value={pkg.original_price ?? ''}
                    onChange={(e) =>
                        update({
                            original_price: e.target.value ? Number(e.target.value) : null,
                        })
                    }
                    placeholder="Kosongkan jika tidak ada diskon"
                />
                {pkg.original_price ? <p className="text-xs text-muted-foreground">{formatRupiah(pkg.original_price)}</p> : null}
            </Field> */}

            {/* Duration */}
            <Field>
                <FieldLabel>
                    Durasi/Waktu <span className="text-destructive">*</span>
                </FieldLabel>
                <Input value={pkg.duration} required onChange={(e) => update({ duration: e.target.value })} placeholder="Contoh: 7-14 hari" />
                {errors[`packages.${index}.duration`] && <FieldError>{errors[`packages.${index}.duration`]}</FieldError>}
            </Field>

            {/* Short Description */}
            <Field>
                <FieldLabel>Deskripsi Singkat</FieldLabel>
                <Textarea
                    value={pkg.short_description ?? ''}
                    onChange={(e) => update({ short_description: e.target.value || null })}
                    placeholder="Penjelasan singkat tentang paket ini"
                    className="min-h-24 resize-none"
                />
            </Field>

            {/* Features */}
            <Field>
                <FieldLabel>Dokumen/Fitur yang Didapat</FieldLabel>
                {pkg.features.length > 0 && (
                    <div className="mb-3 space-y-2">
                        {pkg.features.map((feature) => (
                            <div key={feature._key} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
                                <Switch id={`feat-${feature._key}`} checked={feature.is_included} onCheckedChange={(val) => updateFeature(feature._key, { is_included: val })} />
                                <label
                                    htmlFor={`feat-${feature._key}`}
                                    className={`flex-1 cursor-pointer text-sm select-none ${feature.is_included ? 'text-foreground' : 'text-muted-foreground line-through'}`}
                                >
                                    {feature.feature_name}
                                </label>
                                <button type="button" onClick={() => deleteFeature(feature._key)} className="text-muted-foreground transition-colors hover:text-destructive">
                                    <Trash2 className="size-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex gap-2">
                    <Input
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                        placeholder="Contoh: Akta Pendirian PT"
                        className="flex-1"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={addFeature}>
                        <Plus className="size-4" />
                    </Button>
                </div>
            </Field>

            {/* Highlights */}
            <div className="space-y-3 border-t border-border pt-3">
                <div className="flex items-center justify-between">
                    <Label htmlFor={`highlight-${pkg._key}`} className="cursor-pointer text-sm">
                        Highlight Paket
                    </Label>
                    <Switch id={`highlight-${pkg._key}`} checked={pkg.is_highlighted} onCheckedChange={(val) => update({ is_highlighted: val })} />
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor={`badge-${pkg._key}`} className="cursor-pointer text-sm">
                        Badge Populer
                    </Label>
                    <Switch id={`badge-${pkg._key}`} checked={pkg.badge === 'Populer'} onCheckedChange={(val) => update({ badge: val ? 'Populer' : null })} />
                </div>
            </div>
        </div>
    );
}
