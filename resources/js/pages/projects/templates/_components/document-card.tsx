import { FileText, GripVertical } from 'lucide-react';
import { useEffect } from 'react';

import { ServiceCardAction } from '@/components/service-card-action';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export type LocalDocument = {
    _key: string;
    name: string;
    description: string | null;
    document_format: string | null;
    is_required: boolean;
    notes: string | null;
    sort_order: number;
};

type DocumentCardProps = {
    document: LocalDocument;
    index: number;
    totalItems: number;
    onChange: (updated: LocalDocument) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
};

export function DocumentCard({ document, index, totalItems, onChange, onDelete, onMoveUp, onMoveDown }: DocumentCardProps) {
    const update = (patch: Partial<LocalDocument>) => onChange({ ...document, ...patch });

    useEffect(() => {
        if (document.sort_order !== index + 1) {
            onChange({ ...document, sort_order: index + 1 });
        }
    }, [document, index, onChange]);

    return (
        <div className="space-y-4 rounded-xl border border-primary/30 bg-input/30 p-4 dark:border-none">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="size-4 cursor-grab" />
                    <FileText className="size-4" />
                    <span className="text-sm font-semibold text-foreground">Dokumen #{index + 1}</span>
                </div>
                <div className="flex items-center gap-1">
                    <ServiceCardAction index={index} totalItems={totalItems} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDelete={onDelete} direction="horizontal" />
                </div>
            </div>

            {/* Required Switch */}
            <div className="flex items-start gap-4 rounded-lg border border-border bg-muted/30 p-3">
                <Switch id={`required-${document._key}`} checked={document.is_required} onCheckedChange={(val) => update({ is_required: val })} />
                <div className="flex-1">
                    <Label
                        htmlFor={`required-${document._key}`}
                        className={`cursor-pointer text-sm font-medium ${document.is_required ? 'text-foreground' : 'text-muted-foreground'}`}
                    >
                        Dokumen Wajib
                        {document.is_required && <span className="ml-1 text-destructive">*</span>}
                    </Label>
                    <p className="text-xs text-muted-foreground">{document.is_required ? 'Dokumen ini wajib dilengkapi' : 'Dokumen ini opsional'}</p>
                </div>
            </div>

            {/* Name */}
            <Field>
                <FieldLabel>
                    Nama Dokumen <span className="text-destructive">*</span>
                </FieldLabel>
                <Input value={document.name} required onChange={(e) => update({ name: e.target.value })} placeholder="Contoh: KTP Direktur" />
            </Field>

            {/* Description */}
            <Field>
                <FieldLabel>Deskripsi</FieldLabel>
                <Textarea
                    value={document.description ?? ''}
                    onChange={(e) => update({ description: e.target.value })}
                    placeholder="Penjelasan tentang dokumen ini"
                    className="min-h-16 resize-none"
                    rows={2}
                />
            </Field>

            {/* Document Format */}
            <Field>
                <FieldLabel>Format Dokumen</FieldLabel>
                <Input value={document.document_format ?? ''} onChange={(e) => update({ document_format: e.target.value })} placeholder="Contoh: PDF, JPEG, PNG" />
                <p className="mt-1 text-xs text-muted-foreground">Format file yang diterima (opsional)</p>
            </Field>

            {/* Notes */}
            <Field>
                <FieldLabel>Catatan</FieldLabel>
                <Textarea
                    value={document.notes ?? ''}
                    onChange={(e) => update({ notes: e.target.value })}
                    placeholder="Catatan tambahan (opsional)"
                    className="min-h-16 resize-none"
                    rows={2}
                />
            </Field>
        </div>
    );
}
