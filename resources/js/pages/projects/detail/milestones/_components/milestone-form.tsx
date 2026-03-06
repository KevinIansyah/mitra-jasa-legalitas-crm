import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import { DatePicker } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import type { ProjectMilestoneFormData } from '@/types/project';

type MilestoneFormProps = {
    initial: ProjectMilestoneFormData;
    submitUrl: string;
    method: 'post' | 'put';
    onSuccess: () => void;
    onCancel: () => void;
};

export function MilestoneForm({ initial, submitUrl, method, onSuccess, onCancel }: MilestoneFormProps) {
    const { data, setData, post, put, processing } = useForm<ProjectMilestoneFormData>(initial);
    const set = (val: Partial<ProjectMilestoneFormData>) => setData((prev) => ({ ...prev, ...val }));

    function handleSubmit() {
        const toastId = toast.loading('Memproses...', { description: method === 'put' ? 'Milestone sedang diperbarui.' : 'Milestone sedang ditambahkan.' });

        if (method === 'put') {
            put(submitUrl, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Milestone berhasil diperbarui.' });
                    onSuccess();
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] || 'Terjadi kesalahan saat memperbarui milestone, coba lagi.';
                    toast.error('Gagal', { description: String(msg) });
                },
                onFinish: () => {
                    toast.dismiss(toastId);
                },
            });
        } else {
            post(submitUrl, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Milestone berhasil ditambahkan.' });
                    onSuccess();
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] || 'Terjadi kesalahan saat menambahkan milestone, coba lagi.';
                    toast.error('Gagal', { description: String(msg) });
                },
                onFinish: () => {
                    toast.dismiss(toastId);
                },
            });
        }
    }

    return (
        <div className="space-y-4 rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field className="md:col-span-3">
                    <FieldLabel>
                        Judul Milestone <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input value={data.title} onChange={(e) => set({ title: e.target.value })} placeholder="Contoh: Persiapan Dokumen" />
                </Field>

                <Field className="md:col-span-3">
                    <FieldLabel>Deskripsi</FieldLabel>
                    <Textarea
                        value={data.description ?? ''}
                        onChange={(e) => set({ description: e.target.value })}
                        placeholder="Jelaskan detail milestone ini"
                        className="min-h-24 resize-none"
                        rows={3}
                    />
                </Field>

                <Field>
                    <FieldLabel>
                        Tanggal Mulai <span className="text-destructive">*</span>
                    </FieldLabel>
                    <DatePicker value={data.start_date} onChange={(val) => setData('start_date', val)} fromYear={2020} toYear={2040} />
                </Field>

                <Field>
                    <FieldLabel>
                        Rencana Selesai <span className="text-destructive">*</span>
                    </FieldLabel>
                    <DatePicker value={data.planned_end_date} onChange={(val) => setData('planned_end_date', val)} fromYear={2020} toYear={2040} />
                </Field>

                <Field>
                    <FieldLabel>
                        Estimasi Durasi (hari) <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input type="number" min={1} value={data.estimated_duration_days} onChange={(e) => set({ estimated_duration_days: Number(e.target.value) || 1 })} />
                </Field>
            </div>

            <div className="flex items-center gap-2">
                <Button type="button" disabled={processing || !data.title || !data.start_date || !data.planned_end_date} onClick={handleSubmit}>
                    {processing ? (
                        <>
                            <Spinner className="mr-2" />
                            Menyimpan...
                        </>
                    ) : (
                        'Simpan'
                    )}
                </Button>
                <Button type="button" variant="secondary" onClick={onCancel} disabled={processing}>
                    Batal
                </Button>
            </div>
        </div>
    );
}
