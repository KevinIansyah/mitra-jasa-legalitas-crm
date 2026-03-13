import { DatePicker } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

import { TASK_PRIORITIES, TASK_STATUSES } from '@/types/project';

export type TaskFormData = {
    title: string;
    description: string;
    priority: string;
    status: string;
    due_date: string;
    assigned_to: string;
    project_milestone_id: string;
};

type MemberOption = { id: number; name: string };
type MilestoneOption = { id: number; title: string };

type TaskFormProps = {
    data: TaskFormData;
    processing: boolean;
    members: MemberOption[];
    milestones: MilestoneOption[];
    onChange: (val: Partial<TaskFormData>) => void;
    onSubmit: () => void;
    onCancel: () => void;
};

export function TaskForm({ data, processing, members, milestones, onChange, onSubmit, onCancel }: TaskFormProps) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Title */}
                <Field className="md:col-span-2">
                    <FieldLabel>
                        Judul <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input value={data.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="Contoh: Persiapan dokumen notaris" />
                </Field>

                {/* Priority */}
                <Field>
                    <FieldLabel>Prioritas</FieldLabel>
                    <Select value={data.priority} onValueChange={(v) => onChange({ priority: v })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih prioritas..." />
                        </SelectTrigger>
                        <SelectContent>
                            {TASK_PRIORITIES.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-block h-2 w-2 rounded-full ${p.classes.replace('text-white', '')}`} />
                                        {p.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>

                {/* Status */}
                <Field>
                    <FieldLabel>Status</FieldLabel>
                    <Select value={data.status} onValueChange={(v) => onChange({ status: v })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                            {TASK_STATUSES.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-block h-2 w-2 rounded-full ${s.classes.replace('text-white', '')}`} />
                                        {s.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>

                {/* Due date */}
                <Field>
                    <FieldLabel>Tenggat Waktu</FieldLabel>
                    <DatePicker value={data.due_date} onChange={(value) => onChange({ due_date: value })} fromYear={2020} toYear={2040} />
                </Field>

                {/* Assigned to */}
                <Field>
                    <FieldLabel>Ditugaskan ke</FieldLabel>
                    <Select value={data.assigned_to || '_none'} onValueChange={(v) => onChange({ assigned_to: v === '_none' ? '' : v })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih anggota tim" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="_none">Tidak ada</SelectItem>
                            {members.map((m) => (
                                <SelectItem key={m.id} value={String(m.id)}>
                                    {m.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>

                {/* Milestone */}
                {milestones.length > 0 && (
                    <Field className="md:col-span-2">
                        <FieldLabel>Milestone</FieldLabel>
                        <Select value={data.project_milestone_id || '_none'} onValueChange={(v) => onChange({ project_milestone_id: v === '_none' ? '' : v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih milestone (opsional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="_none">Tidak ada</SelectItem>
                                {milestones.map((m) => (
                                    <SelectItem key={m.id} value={String(m.id)}>
                                        {m.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                )}

                {/* Description */}
                <Field className="md:col-span-2">
                    <FieldLabel>Deskripsi</FieldLabel>
                    <Textarea
                        value={data.description}
                        onChange={(e) => onChange({ description: e.target.value })}
                        placeholder="Detail tugas ini..."
                        className="min-h-24 resize-none"
                        rows={2}
                    />
                </Field>
            </div>

            <div className="flex items-center gap-2">
                <Button type="button" disabled={processing || !data.title.trim()} onClick={onSubmit}>
                    {processing ? (
                        <>
                            <Spinner className="mr-2" />
                            Menyimpan...
                        </>
                    ) : (
                        'Simpan'
                    )}
                </Button>
                <Button type="button" variant="secondary" disabled={processing} onClick={onCancel}>
                    Batal
                </Button>
            </div>
        </div>
    );
}
