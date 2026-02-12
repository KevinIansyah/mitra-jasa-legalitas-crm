import { ArrowDown, ArrowUp, GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export type LocalFaq = {
    id?: number;
    _key: string;
    question: string;
    answer: string;
    sort_order: number;
};

type FaqCardProps = {
    faq: LocalFaq;
    index: number;
    totalItems: number;
    onChange: (updated: LocalFaq) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
};

export function FaqCard({ faq, index, totalItems, onChange, onDelete, onMoveUp, onMoveDown }: FaqCardProps) {
    const update = (patch: Partial<LocalFaq>) => onChange({ ...faq, ...patch });

    return (
        <div className="space-y-4 rounded-xl border border-primary/60 bg-input/30 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="size-4 cursor-grab" />
                    <span className="text-sm font-semibold text-foreground">FAQ #{index + 1}</span>
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

            {/* FAQ Question */}
            <Field>
                <FieldLabel>
                    Pertanyaan <span className="text-destructive">*</span>
                </FieldLabel>
                <Input value={faq.question} onChange={(e) => update({ question: e.target.value })} placeholder="Contoh: Berapa lama proses pengurusan?" />
            </Field>

            {/* FAQ Answer */}
            <Field>
                <FieldLabel>
                    Jawaban <span className="text-destructive">*</span>
                </FieldLabel>
                <Textarea
                    value={faq.answer}
                    onChange={(e) => update({ answer: e.target.value })}
                    placeholder="Jelaskan jawaban secara detail"
                    className="min-h-32 resize-none"
                    rows={6}
                />
            </Field>
        </div>
    );
}
