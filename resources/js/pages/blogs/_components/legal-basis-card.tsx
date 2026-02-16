import { ArrowDown, ArrowUp, Calendar, GripVertical, Link as LinkIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { ServiceStatus } from '@/types/service';

export type LocalLegalBasis = {
    id?: number;
    _key: string;
    document_type: string;
    document_number: string;
    title: string;
    issued_date: string | null;
    url: string | null;
    description: string | null;
    sort_order: number;
    status: ServiceStatus;
};

export const DOCUMENT_TYPES = [
    'Undang-Undang (UU)',
    'Peraturan Pemerintah (PP)',
    'Peraturan Presiden (Perpres)',
    'Peraturan Menteri (Permen)',
    'Keputusan Menteri (Kepmen)',
    'Peraturan Daerah (Perda)',
] as const;

type LegalBasisCardProps = {
    legalBasis: LocalLegalBasis;
    index: number;
    totalItems: number;
    onChange: (updated: LocalLegalBasis) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isEdit?: boolean | false;
    errors?: Record<string, string>;
};

export function LegalBasisCard({ legalBasis, index, totalItems, onChange, onDelete, onMoveUp, onMoveDown, isEdit, errors = {} }: LegalBasisCardProps) {
    const update = (patch: Partial<LocalLegalBasis>) => onChange({ ...legalBasis, ...patch });

    return (
        <div className="space-y-4 rounded-xl border border-primary/30 bg-input/30 p-4 dark:border-none">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="size-4 cursor-grab" />
                    <span className="text-sm font-semibold text-foreground">Dasar Hukum #{index + 1}</span>
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

            <div className={`grid grid-cols-1 gap-4 ${isEdit ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
                {/* Status */}
                {isEdit && (
                    <Field>
                        <FieldLabel>Status</FieldLabel>
                        <Select value={legalBasis.status} onValueChange={(value) => update({ status: value as ServiceStatus })}>
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

                {/* Document Type */}
                <Field>
                    <FieldLabel>
                        Jenis Dokumen <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select value={legalBasis.document_type || undefined} required onValueChange={(val) => update({ document_type: val })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis dokumen" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Jenis Dokumen</SelectLabel>
                                {DOCUMENT_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    {errors[`legal_bases.${index}.document_type`] && <FieldError>{errors[`legal_bases.${index}.document_type`]}</FieldError>}
                </Field>

                {/* Document Number */}
                <Field>
                    <FieldLabel>
                        Nomor Dokumen <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input value={legalBasis.document_number} required onChange={(e) => update({ document_number: e.target.value })} placeholder="Contoh: No. 40 Tahun 2007" />
                    {errors[`legal_bases.${index}.document_number`] && <FieldError>{errors[`legal_bases.${index}.document_number`]}</FieldError>}
                </Field>
            </div>

            {/* Title */}
            <Field>
                <FieldLabel>
                    Judul / Nama <span className="text-destructive">*</span>
                </FieldLabel>
                <Input value={legalBasis.title} required onChange={(e) => update({ title: e.target.value })} placeholder="Contoh: Undang-Undang tentang Perseroan Terbatas" />
                {errors[`legal_bases.${index}.title`] && <FieldError>{errors[`legal_bases.${index}.title`]}</FieldError>}
            </Field>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Issued Date */}
                <Field>
                    <FieldLabel>Tanggal Terbit</FieldLabel>
                    <div className="relative">
                        <Calendar className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="date" value={legalBasis.issued_date ?? ''} onChange={(e) => update({ issued_date: e.target.value })} className="pl-10" />
                    </div>
                </Field>

                {/* URL */}
                <Field>
                    <FieldLabel>Link Referensi</FieldLabel>
                    <div className="relative">
                        <LinkIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="url" value={legalBasis.url ?? ''} onChange={(e) => update({ url: e.target.value })} placeholder="https://..." className="pl-10" />
                    </div>
                </Field>
            </div>

            {/* Description */}
            <Field>
                <FieldLabel>Deskripsi</FieldLabel>
                <Textarea
                    value={legalBasis.description ?? ''}
                    onChange={(e) => update({ description: e.target.value })}
                    placeholder="Ringkasan atau penjelasan singkat"
                    className="min-h-24 resize-none"
                    rows={3}
                />
            </Field>
        </div>
    );
}
