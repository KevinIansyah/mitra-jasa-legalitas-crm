import { ArrowDown, ArrowUp, Clock, FileText, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export type LocalProcessStep = {
    id?: number;
    _key: string;
    title: string;
    description: string;
    duration: string;
    duration_days: number | null;
    required_documents: string[];
    notes: string;
    icon: string;
    sort_order: number;
};

type ProcessStepCardProps = {
    step: LocalProcessStep;
    index: number;
    totalItems: number;
    onChange: (updated: LocalProcessStep) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
};

export function ProcessStepCard({ step, index, totalItems, onChange, onDelete, onMoveUp, onMoveDown }: ProcessStepCardProps) {
    const [documentInput, setDocumentInput] = useState('');

    const update = (patch: Partial<LocalProcessStep>) => onChange({ ...step, ...patch });

    const addDocument = () => {
        const trimmed = documentInput.trim();
        if (!trimmed) return;
        update({
            required_documents: [...step.required_documents, trimmed],
        });
        setDocumentInput('');
    };

    const deleteDocument = (docIndex: number) =>
        update({
            required_documents: step.required_documents.filter((_, i) => i !== docIndex),
        });

    return (
        <div className="space-y-4 rounded-xl border border-primary/60 bg-input/30 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="size-4 cursor-grab" />
                    <span className="text-sm font-semibold text-foreground">Tahap #{index + 1}</span>
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

            {/* Title */}
            <Field>
                <FieldLabel>
                    Judul Tahap <span className="text-destructive">*</span>
                </FieldLabel>
                <Input value={step.title} onChange={(e) => update({ title: e.target.value })} placeholder="Contoh: Konsultasi Awal & Analisis Kebutuhan" />
            </Field>

            {/* Description */}
            <Field>
                <FieldLabel>Deskripsi</FieldLabel>
                <Textarea
                    value={step.description}
                    onChange={(e) => update({ description: e.target.value })}
                    placeholder="Jelaskan detail tahapan ini"
                    className="min-h-24 resize-none"
                    rows={4}
                />
            </Field>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Duration */}
                <Field>
                    <FieldLabel>Durasi/Waktu</FieldLabel>
                    <div className="relative">
                        <Clock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input value={step.duration} onChange={(e) => update({ duration: e.target.value })} placeholder="Contoh: 1-2 hari kerja" className="pl-10" />
                    </div>
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
                </Field>
            </div>

            {/* Required Documents */}
            <Field>
                <FieldLabel>Dokumen yang Diperlukan</FieldLabel>
                {step.required_documents.length > 0 && (
                    <div className="mb-3 space-y-2">
                        {step.required_documents.map((doc, docIndex) => (
                            <div key={docIndex} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
                                <FileText className="size-4 shrink-0 text-muted-foreground" />
                                <span className="flex-1 text-sm">{doc}</span>
                                <button type="button" onClick={() => deleteDocument(docIndex)} className="text-muted-foreground transition-colors hover:text-destructive">
                                    <Trash2 className="size-3.5" />
                                </button>
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
                    <Button type="button" variant="outline" size="icon" onClick={addDocument}>
                        <Plus className="size-4" />
                    </Button>
                </div>
            </Field>

            {/* Notes */}
            <Field>
                <FieldLabel>Catatan</FieldLabel>
                <Textarea
                    value={step.notes}
                    onChange={(e) => update({ notes: e.target.value })}
                    placeholder="Catatan atau informasi tambahan"
                    className="min-h-16 resize-none"
                    rows={2}
                />
            </Field>

            {/* Icon (optional field for future icon picker) */}
            <Field>
                <FieldLabel>Icon</FieldLabel>
                <Input value={step.icon} onChange={(e) => update({ icon: e.target.value })} placeholder="Nama icon atau kelas CSS" />
            </Field>
        </div>
    );
}
