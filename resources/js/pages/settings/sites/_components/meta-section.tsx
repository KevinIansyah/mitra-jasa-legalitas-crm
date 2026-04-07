import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { SiteSetting } from '@/types/site-setting';
import { ImageUpload, SubmitButton } from '../../_components/shared';
import siteSettings from '@/routes/site-settings';

export function MetaSection({ settings }: { settings: SiteSetting }) {
    const { data, setData, post, processing, errors } = useForm({
        default_title_template: settings.default_title_template ?? '',
        default_meta_description: settings.default_meta_description ?? '',
        default_keywords: settings.default_keywords ?? '',
        default_og_image: null as File | null,
        remove_og_image: false,
    });

    const descLength = data.default_meta_description.length;
    const descColor = descLength > 160 ? 'text-destructive' : descLength >= 150 ? 'text-emerald-500' : 'text-muted-foreground';
    const descHint = descLength > 160 ? 'Terlalu panjang' : descLength >= 150 ? 'Ideal' : 'Terlalu pendek';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const id = toast.loading('Memproses...', {
            description: 'Default meta tags sedang diperbarui.',
        });

        post(siteSettings.update.meta().url, {
            forceFormData: true,
            preserveScroll: true,

            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Default meta tags berhasil diperbarui.',
                });
            },
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat menyimpan default meta tags, coba lagi.';
                toast.error('Gagal', {
                    description: String(msg),
                });
            },
            onFinish: () => {
                toast.dismiss(id);
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Field>
                <FieldLabel>Template Judul Halaman</FieldLabel>
                <Input
                    value={data.default_title_template}
                    onChange={(e) => setData('default_title_template', e.target.value)}
                    placeholder="{page_title} | CV. Mitra Jasa Legalitas"
                />
                <p className="text-xs text-muted-foreground">
                    Gunakan <code className="rounded bg-muted px-1 py-0.5">{'{page_title}'}</code> untuk judul dinamis per halaman
                </p>
                {errors.default_title_template && <FieldError>{errors.default_title_template}</FieldError>}
            </Field>

            <Field>
                <FieldLabel>Default Meta Description</FieldLabel>
                <Textarea
                    value={data.default_meta_description}
                    onChange={(e) => setData('default_meta_description', e.target.value)}
                    placeholder="Konsultan legalitas terpercaya di Surabaya..."
                    className="min-h-20 resize-none"
                    rows={3}
                    maxLength={170}
                />
                <p className={`text-xs ${descColor}`}>
                    {descLength}/160 karakter - {descHint}
                </p>
                {errors.default_meta_description && <FieldError>{errors.default_meta_description}</FieldError>}
            </Field>

            <Field>
                <FieldLabel>Default Keywords</FieldLabel>
                <Input
                    value={data.default_keywords}
                    onChange={(e) => setData('default_keywords', e.target.value)}
                    placeholder="legalitas usaha, perizinan, konsultan hukum, surabaya"
                />
                {errors.default_keywords && <FieldError>{errors.default_keywords}</FieldError>}
            </Field>

            <ImageUpload
                label="Default OG Image"
                name="default_og_image"
                currentUrl={settings.default_og_image}
                hint="Rekomendasi: 1200×630px - ditampilkan saat halaman dibagikan di media sosial"
                onChange={(file) => setData('default_og_image', file)}
                onRemove={() => setData('remove_og_image', true)}
            />

            <SubmitButton processing={processing} />
        </form>
    );
}
