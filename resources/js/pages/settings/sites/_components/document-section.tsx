import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import siteSettings from '@/routes/site-settings';
import type { SiteSetting } from '@/types/site-setting';
import { SubmitButton } from '../../_components/shared';

export function DocumentSection({ settings }: { settings: SiteSetting }) {
    const { data, setData, patch, processing, errors } = useForm({
        document_footer_text: settings.document_footer_text ?? '',
        document_terms_and_conditions: settings.document_terms_and_conditions ?? '',
        document_privacy_policy_url: settings.document_privacy_policy_url ?? '',
        document_letterhead: settings.document_letterhead ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Kustomisasi dokumen sedang diperbarui.',
        });

        patch(siteSettings.update.document().url, {
            preserveScroll: true,
            onSuccess: () =>
                toast.success('Berhasil', {
                    description: 'Kustomisasi dokumen berhasil diperbarui.',
                }),
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui kustomisasi dokumen, coba lagi.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => {
                toast.dismiss(id);
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Field>
                <FieldLabel>Footer Dokumen</FieldLabel>
                <Textarea
                    value={data.document_footer_text}
                    onChange={(e) => setData('document_footer_text', e.target.value)}
                    placeholder="Terima kasih atas kepercayaan Anda..."
                    className="min-h-20 resize-none"
                    rows={3}
                />
                <p className="text-xs text-muted-foreground">Teks ini akan muncul di bagian footer semua dokumen</p>
                {errors.document_footer_text && <FieldError>{errors.document_footer_text}</FieldError>}
            </Field>
            <Field>
                <FieldLabel>Syarat & Ketentuan</FieldLabel>
                <Textarea
                    value={data.document_terms_and_conditions}
                    onChange={(e) => setData('document_terms_and_conditions', e.target.value)}
                    placeholder="1. ..."
                    className="min-h-20 resize-none"
                    rows={5}
                />
                {errors.document_terms_and_conditions && <FieldError>{errors.document_terms_and_conditions}</FieldError>}
            </Field>
            <Field>
                <FieldLabel>URL Kebijakan Privasi</FieldLabel>
                <Input
                    value={data.document_privacy_policy_url}
                    onChange={(e) => setData('document_privacy_policy_url', e.target.value)}
                    placeholder="https://example.com/privacy-policy"
                />
                {errors.document_privacy_policy_url && <FieldError>{errors.document_privacy_policy_url}</FieldError>}
            </Field>
            <Field>
                <FieldLabel>Template Kop Surat</FieldLabel>
                <Input value={data.document_letterhead} onChange={(e) => setData('document_letterhead', e.target.value)} placeholder="letterhead-default" />
                {errors.document_letterhead && <FieldError>{errors.document_letterhead}</FieldError>}
            </Field>
            <SubmitButton processing={processing} />
        </form>
    );
}
