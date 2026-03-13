import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import siteSettings from '@/routes/site-settings';
import type { SiteSetting } from '@/types/site-setting';
import { SubmitButton } from '../../_components/shared';

export function StatsSection({ settings }: { settings: SiteSetting }) {
    const { data, setData, patch, processing, errors } = useForm({
        stat_total_clients: settings.stat_total_clients,
        stat_total_documents: settings.stat_total_documents,
        stat_rating: settings.stat_rating,
        stat_total_reviews: settings.stat_total_reviews,
        stat_years_experience: settings.stat_years_experience,
        stat_total_services: settings.stat_total_services,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Statistik sedang diperbarui.',
        });

        patch(siteSettings.update.stats().url, {
            preserveScroll: true,
            onSuccess: () =>
                toast.success('Berhasil', {
                    description: 'Statistik berhasil diperbarui.',
                }),
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui statistik, coba lagi.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => {
                toast.dismiss(id);
            },
        });
    };

    const statFields = [
        { key: 'stat_total_clients', label: 'Total Klien', placeholder: '780', type: 'number' },
        { key: 'stat_total_documents', label: 'Total Dokumen', placeholder: '3721', type: 'number' },
        { key: 'stat_total_reviews', label: 'Total Ulasan', placeholder: '232', type: 'number' },
        { key: 'stat_years_experience', label: 'Tahun Pengalaman', placeholder: '10', type: 'number' },
        { key: 'stat_total_services', label: 'Total Layanan', placeholder: '25', type: 'number' },
        { key: 'stat_rating', label: 'Rating (0–5)', placeholder: '4.5', type: 'number', step: '0.1', min: '0', max: '5' },
    ] as const;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {statFields.map(({ key, label, placeholder, ...rest }) => (
                    <Field key={key}>
                        <FieldLabel>{label}</FieldLabel>
                        <Input value={data[key]} onChange={(e) => setData(key, parseFloat(e.target.value) || 0)} placeholder={placeholder} {...rest} />
                        {errors[key] && <FieldError>{errors[key]}</FieldError>}
                    </Field>
                ))}
            </div>
            <SubmitButton processing={processing} />
        </form>
    );
}
