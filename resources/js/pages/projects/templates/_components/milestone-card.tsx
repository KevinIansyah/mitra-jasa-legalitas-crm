import { Clock, GripVertical } from 'lucide-react';
import { useEffect } from 'react';

import { ServiceCardAction } from '@/components/service-card-action';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export type LocalMilestone = {
    _key: string;
    title: string;
    description: string | null;
    estimated_duration_days: number;
    day_offset: number;
    sort_order: number;
};

type MilestoneCardProps = {
    milestone: LocalMilestone;
    index: number;
    totalItems: number;
    onChange: (updated: LocalMilestone) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
};

export function MilestoneCard({ milestone, index, totalItems, onChange, onDelete, onMoveUp, onMoveDown }: MilestoneCardProps) {
    const update = (patch: Partial<LocalMilestone>) => onChange({ ...milestone, ...patch });

    useEffect(() => {
        if (milestone.sort_order !== index + 1) {
            onChange({ ...milestone, sort_order: index + 1 });
        }
    }, [milestone, index, onChange]);

    return (
        <div className="space-y-4 rounded-xl border border-primary/30 bg-input/30 p-4 dark:border-none">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="size-4 cursor-grab" />
                    <span className="text-sm font-semibold text-foreground">Milestone #{index + 1}</span>
                </div>
                <div className="flex items-center gap-1">
                    <ServiceCardAction index={index} totalItems={totalItems} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDelete={onDelete} direction="vertical" />
                </div>
            </div>

            {/* Title */}
            <Field>
                <FieldLabel>
                    Judul Milestone <span className="text-destructive">*</span>
                </FieldLabel>
                <Input value={milestone.title} required onChange={(e) => update({ title: e.target.value })} placeholder="Contoh: Persiapan Dokumen & Konsultasi Awal" />
            </Field>

            {/* Description */}
            <Field>
                <FieldLabel>Deskripsi</FieldLabel>
                <Textarea
                    value={milestone.description ?? ''}
                    onChange={(e) => update({ description: e.target.value })}
                    placeholder="Jelaskan detail milestone ini"
                    className="min-h-20 resize-none"
                    rows={3}
                />
            </Field>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Estimated Duration */}
                <Field>
                    <FieldLabel>
                        Durasi (hari) <span className="text-destructive">*</span>
                    </FieldLabel>
                    <div className="relative">
                        <Clock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="number"
                            min={1}
                            value={milestone.estimated_duration_days}
                            required
                            onChange={(e) => update({ estimated_duration_days: Number(e.target.value) || 1 })}
                            placeholder="Contoh: 5"
                            className="pl-10"
                        />
                    </div>
                </Field>

                {/* Day Offset */}
                <Field>
                    <FieldLabel>
                        Mulai Hari Ke- <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                        type="number"
                        min={0}
                        value={milestone.day_offset}
                        required
                        onChange={(e) => update({ day_offset: Number(e.target.value) || 0 })}
                        placeholder="Contoh: 0"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">Hari ke berapa milestone ini dimulai sejak project start</p>
                </Field>
            </div>
        </div>
    );
}
