import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import siteSettings from '@/routes/site-settings';
import type { SiteSetting } from '@/types/site-setting';
import { ImageUpload, SubmitButton } from '../../_components/shared';

export function SignerSection({ settings }: { settings: SiteSetting }) {
    const { data, setData, post, processing, errors } = useForm({
        signature_image: null as File | null,
        remove_signature_image: false,
        stamp_image: null as File | null,
        remove_stamp_image: false,
        signer_name: settings.signer_name ?? '',
        signer_position: settings.signer_position ?? '',
        signer_phone: settings.signer_phone ?? '',
        signer_email: settings.signer_email ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Tanda tangan & stempel sedang diperbarui.',
        });

        post(siteSettings.update.signer().url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () =>
                toast.success('Berhasil', {
                    description: 'Tanda tangan & stempel berhasil diperbarui.',
                }),
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui tanda tangan & stempel, coba lagi.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => {
                toast.dismiss(id);
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ImageUpload
                    label="Tanda Tangan Digital"
                    name="signature_image"
                    currentUrl={settings.signature_image}
                    hint="Format PNG dengan background transparan"
                    onChange={(file) => setData('signature_image', file)}
                    onRemove={() => setData('remove_signature_image', true)}
                    errorForm={errors.signature_image}
                />
                <ImageUpload
                    label="Stempel Perusahaan"
                    name="stamp_image"
                    currentUrl={settings.stamp_image}
                    hint="Format PNG dengan background transparan"
                    onChange={(file) => setData('stamp_image', file)}
                    onRemove={() => setData('remove_stamp_image', true)}
                    errorForm={errors.stamp_image}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                    <FieldLabel>Nama Penandatangan</FieldLabel>
                    <Input value={data.signer_name} onChange={(e) => setData('signer_name', e.target.value)} placeholder="Moch Zainul Arifin S.Sos" />
                    {errors.signer_name && <FieldError>{errors.signer_name}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel>Jabatan</FieldLabel>
                    <Input value={data.signer_position} onChange={(e) => setData('signer_position', e.target.value)} placeholder="Direktur" />
                    {errors.signer_position && <FieldError>{errors.signer_position}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel>Telepon Penandatangan</FieldLabel>
                    <Input value={data.signer_phone} onChange={(e) => setData('signer_phone', e.target.value)} placeholder="0821-4352-5559" />
                    {errors.signer_phone && <FieldError>{errors.signer_phone}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel>Email Penandatangan</FieldLabel>
                    <Input type="email" value={data.signer_email} onChange={(e) => setData('signer_email', e.target.value)} placeholder="direktur@example.com" />
                    {errors.signer_email && <FieldError>{errors.signer_email}</FieldError>}
                </Field>
            </div>

            <SubmitButton processing={processing} />
        </form>
    );
}
