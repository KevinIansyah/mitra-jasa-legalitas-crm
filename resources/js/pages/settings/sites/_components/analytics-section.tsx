import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import siteSettings from '@/routes/site-settings';
import type { SiteSetting } from '@/types/site-setting';
import { SubmitButton } from '../../_components/shared';

export function AnalyticsSection({ settings }: { settings: SiteSetting }) {
    const { data, setData, patch, processing, errors } = useForm({
        google_analytics_id: settings.google_analytics_id ?? '',
        google_tag_manager_id: settings.google_tag_manager_id ?? '',
        google_site_verification: settings.google_site_verification ?? '',
        meta_pixel_id: settings.meta_pixel_id ?? '',
        tiktok_pixel_id: settings.tiktok_pixel_id ?? '',
        custom_head_scripts: settings.custom_head_scripts ?? '',
        custom_body_scripts: settings.custom_body_scripts ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Analytics & tracking sedang diperbarui.',
        });

        patch(siteSettings.update.analytics().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Analytics & tracking berhasil diperbarui.',
                });
            },
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui analytics & tracking, coba lagi.';
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
                <Field>
                    <FieldLabel>Google Analytics ID</FieldLabel>
                    <Input value={data.google_analytics_id} onChange={(e) => setData('google_analytics_id', e.target.value)} placeholder="G-XXXXXXXXXX" />
                    {errors.google_analytics_id && <FieldError>{errors.google_analytics_id}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel>Google Tag Manager ID</FieldLabel>
                    <Input value={data.google_tag_manager_id} onChange={(e) => setData('google_tag_manager_id', e.target.value)} placeholder="GTM-XXXXXXX" />
                    {errors.google_tag_manager_id && <FieldError>{errors.google_tag_manager_id}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel>Google Search Console</FieldLabel>
                    <Input
                        value={data.google_site_verification}
                        onChange={(e) => setData('google_site_verification', e.target.value)}
                        placeholder="Kode verifikasi Search Console"
                    />
                    {errors.google_site_verification && <FieldError>{errors.google_site_verification}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel>Meta Pixel ID</FieldLabel>
                    <Input value={data.meta_pixel_id} onChange={(e) => setData('meta_pixel_id', e.target.value)} placeholder="XXXXXXXXXXXXXXXX" />
                    {errors.meta_pixel_id && <FieldError>{errors.meta_pixel_id}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel>TikTok Pixel ID</FieldLabel>
                    <Input value={data.tiktok_pixel_id} onChange={(e) => setData('tiktok_pixel_id', e.target.value)} placeholder="XXXXXXXXXXXXXXXX" />
                    {errors.tiktok_pixel_id && <FieldError>{errors.tiktok_pixel_id}</FieldError>}
                </Field>
            </div>
            <Field>
                <FieldLabel>Script Tambahan di &lt;head&gt;</FieldLabel>
                <Textarea
                    value={data.custom_head_scripts}
                    onChange={(e) => setData('custom_head_scripts', e.target.value)}
                    placeholder="<script>...</script>"
                    className="min-h-20 resize-none"
                    rows={4}
                />
                {errors.custom_head_scripts && <FieldError>{errors.custom_head_scripts}</FieldError>}
            </Field>
            <Field>
                <FieldLabel>Script Tambahan di &lt;body&gt;</FieldLabel>
                <Textarea
                    value={data.custom_body_scripts}
                    onChange={(e) => setData('custom_body_scripts', e.target.value)}
                    placeholder="<script>...</script>"
                    className="min-h-20 resize-none"
                    rows={4}
                />
                {errors.custom_body_scripts && <FieldError>{errors.custom_body_scripts}</FieldError>}
            </Field>
            <SubmitButton processing={processing} />
        </form>
    );
}
