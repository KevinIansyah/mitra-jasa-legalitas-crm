import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import type { ProjectDocumentFormData } from '@/types/project';
import { DOCUMENT_FORMAT_OPTIONS } from '@/types/service';

type DocumentFormProps = {
    initial: ProjectDocumentFormData;
    submitUrl: string;
    method: 'post' | 'put';
    onSuccess: () => void;
    onCancel: () => void;
};

export function DocumentForm({ initial, submitUrl, method, onSuccess, onCancel }: DocumentFormProps) {
    const { data, setData, post, put, processing } = useForm<ProjectDocumentFormData>(initial);
    const set = (val: Partial<ProjectDocumentFormData>) => setData((prev) => ({ ...prev, ...val }));

    function handleSubmit() {
        const toastId = toast.loading('Memproses...', {
            description: method === 'put' ? 'Dokumen sedang diperbarui.' : 'Dokumen sedang ditambahkan.',
        });

        if (method === 'put') {
            put(submitUrl, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Dokumen berhasil diperbarui.' });
                    onSuccess();
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] || 'Terjadi kesalahan saat memperbarui dokumen, coba lagi.';
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
                    toast.success('Berhasil', { description: 'Dokumen berhasil ditambahkan.' });
                    onSuccess();
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] || 'Terjadi kesalahan saat menambahkan dokumen, coba lagi.';
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
            {/* Required Switch */}
            <div className="flex items-start gap-4 rounded-lg border border-primary bg-transparent p-3 dark:bg-input/30">
                <Switch id="is_required" checked={data.is_required} onCheckedChange={(val) => set({ is_required: val })} />
                <div className="flex-1">
                    <Label htmlFor="is_required" className={`cursor-pointer text-sm font-medium ${data.is_required ? 'text-foreground' : 'text-muted-foreground'}`}>
                        Dokumen Wajib
                        {data.is_required && <span className="ml-1 text-destructive">*</span>}
                    </Label>
                    <p className="text-sm text-muted-foreground">{data.is_required ? 'Dokumen ini wajib dilengkapi' : 'Dokumen ini opsional'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Name */}
                <Field className="md:col-span-1">
                    <FieldLabel>
                        Nama Dokumen <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input value={data.name} onChange={(e) => set({ name: e.target.value })} placeholder="Contoh: KTP Direktur" />
                </Field>

                {/* Document Format */}
                <Field className="col-span-1">
                    <FieldLabel>
                        Format Dokumen <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select value={data.document_format ?? 'pdf'} onValueChange={(value) => set({ document_format: value })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih format" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Format Dokumen</SelectLabel>
                                {DOCUMENT_FORMAT_OPTIONS.map((format) => (
                                    <SelectItem key={format.value} value={format.value}>
                                        {format.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>

                {/* Description */}
                <Field className="md:col-span-2">
                    <FieldLabel>Deskripsi</FieldLabel>
                    <Textarea
                        value={data.description ?? ''}
                        onChange={(e) => set({ description: e.target.value })}
                        placeholder="Penjelasan tentang dokumen ini"
                        className="min-h-24 resize-none"
                        rows={2}
                    />
                </Field>

                {/* Notes */}
                <Field className="md:col-span-2">
                    <FieldLabel>Catatan</FieldLabel>
                    <Textarea
                        value={data.notes ?? ''}
                        onChange={(e) => set({ notes: e.target.value })}
                        placeholder="Catatan tambahan (opsional)"
                        className="min-h-24 resize-none"
                        rows={2}
                    />
                </Field>
            </div>

            <div className="flex items-center gap-2">
                <Button type="button" disabled={processing || !data.name || !data.document_format} onClick={handleSubmit}>
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
