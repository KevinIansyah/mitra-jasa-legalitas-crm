import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import siteSettings from '@/routes/site-settings';
import { type SiteSetting } from '@/types/site-setting';
import { SubmitButton } from '../../_components/shared';

export function SocialSection({ settings }: { settings: SiteSetting }) {
    const { data, setData, patch, processing, errors } = useForm({
        social_facebook: settings.social_facebook ?? '',
        social_instagram: settings.social_instagram ?? '',
        social_whatsapp: settings.social_whatsapp ?? '',
        social_linkedin: settings.social_linkedin ?? '',
        social_tiktok: settings.social_tiktok ?? '',
        social_youtube: settings.social_youtube ?? '',
        social_twitter: settings.social_twitter ?? '',
        social_threads: settings.social_threads ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Social media sedang diperbarui.',
        });

        patch(siteSettings.update.social().url, {
            preserveScroll: true,
            onSuccess: () =>
                toast.success('Berhasil', {
                    description: 'Social media berhasil diperbarui.',
                }),
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui social media, coba lagi.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => {
                toast.dismiss(id);
            },
        });
    };

    const socialFields = [
        { key: 'social_facebook', label: 'Facebook', placeholder: 'https://facebook.com/mitrajasalegalitas' },
        { key: 'social_instagram', label: 'Instagram', placeholder: 'https://instagram.com/mitrajasalegalitas' },
        { key: 'social_whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/6282143525559' },
        { key: 'social_linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/...' },
        { key: 'social_tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@...' },
        { key: 'social_youtube', label: 'YouTube', placeholder: 'https://youtube.com/@...' },
        { key: 'social_twitter', label: 'Twitter / X', placeholder: 'https://x.com/...' },
        { key: 'social_threads', label: 'Threads', placeholder: 'https://threads.net/@...' },
    ] as const;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {socialFields.map(({ key, label, placeholder }) => (
                    <Field key={key}>
                        <FieldLabel>{label}</FieldLabel>
                        <Input value={data[key]} onChange={(e) => setData(key, e.target.value)} placeholder={placeholder} />
                        {errors[key] && <FieldError>{errors[key]}</FieldError>}
                    </Field>
                ))}
            </div>
            <SubmitButton processing={processing} />
        </form>
    );
}
