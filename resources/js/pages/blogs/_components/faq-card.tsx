import { ArrowDown, ArrowUp, GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { ServiceStatus } from '@/types/service';

export type LocalFaq = {
    id?: number;
    _key: string;
    question: string;
    answer: string;
    sort_order: number;
    status: ServiceStatus;
};

type FaqCardProps = {
    faq: LocalFaq;
    index: number;
    totalItems: number;
    onChange: (updated: LocalFaq) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isEdit?: boolean | false;
    errors?: Record<string, string>;
};

export function FaqCard({ faq, index, totalItems, onChange, onDelete, onMoveUp, onMoveDown, isEdit, errors = {} }: FaqCardProps) {
    const update = (patch: Partial<LocalFaq>) => onChange({ ...faq, ...patch });

    return (
        <div className="space-y-4 rounded-xl border border-primary/30 bg-input/30 p-4 dark:border-none">
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

            {/* Status */}
            {isEdit && (
                <Field>
                    <FieldLabel>Status</FieldLabel>
                    <Select value={faq.status || 'active'} required onValueChange={(value) => update({ status: value as ServiceStatus })}>
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

            {/* Question */}
            <Field>
                <FieldLabel>
                    Pertanyaan <span className="text-destructive">*</span>
                </FieldLabel>
                <Input value={faq.question} required onChange={(e) => update({ question: e.target.value })} placeholder="Contoh: Berapa lama proses pengurusan?" />
                {errors[`faqs.${index}.question`] && <FieldError>{errors[`faqs.${index}.question`]}</FieldError>}
            </Field>

            {/* Answer */}
            <Field>
                <FieldLabel>
                    Jawaban <span className="text-destructive">*</span>
                </FieldLabel>
                <Textarea
                    value={faq.answer}
                    required
                    onChange={(e) => update({ answer: e.target.value })}
                    placeholder="Jelaskan jawaban secara detail"
                    className="min-h-32 resize-none"
                    rows={6}
                />
                {errors[`faqs.${index}.answer`] && <FieldError>{errors[`faqs.${index}.answer`]}</FieldError>}
            </Field>
        </div>
    );
}
