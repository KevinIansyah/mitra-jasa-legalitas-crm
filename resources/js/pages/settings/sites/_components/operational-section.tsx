import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import siteSettings from '@/routes/site-settings';
import { BUSINESS_HOUR_DAYS, type SiteSetting } from '@/types/site-setting';
import { SubmitButton } from '../../_components/shared';

export function OperationalSection({ settings }: { settings: SiteSetting }) {
    const { data, setData, patch, processing, errors } = useForm({
        business_hours: settings.business_hours ?? {},
        maps_embed_url: settings.maps_embed_url ?? '',
        maps_coordinates: settings.maps_coordinates ?? '',
        maps_place_id: settings.maps_place_id ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Informasi operasional sedang diperbarui.',
        });

        patch(siteSettings.update.operational().url, {
            preserveScroll: true,
            onSuccess: () =>
                toast.success('Berhasil', {
                    description: 'Informasi operasional berhasil diperbarui.',
                }),
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui informasi operasional, coba lagi.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => {
                toast.dismiss(id);
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label className="mb-3 block text-sm font-medium">Jam Operasional</Label>
                <div className="space-y-2">
                    {BUSINESS_HOUR_DAYS.map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-3">
                            <span className="w-20 shrink-0 text-sm text-muted-foreground">{label}</span>
                            <Input
                                value={(data.business_hours as Record<string, string>)[key] ?? ''}
                                onChange={(e) => setData('business_hours', { ...data.business_hours, [key]: e.target.value })}
                                placeholder="08:00-17:00"
                                className="max-w-[160px] text-sm"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <Field>
                <FieldLabel>Google Maps Embed URL</FieldLabel>
                <Textarea
                    value={data.maps_embed_url}
                    onChange={(e) => setData('maps_embed_url', e.target.value)}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    className="min-h-20 resize-none"
                    rows={3}
                />
                {errors.maps_embed_url && <FieldError>{errors.maps_embed_url}</FieldError>}
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                    <FieldLabel>Koordinat GPS</FieldLabel>
                    <Input value={data.maps_coordinates} onChange={(e) => setData('maps_coordinates', e.target.value)} placeholder="-7.123456,112.654321" />
                    {errors.maps_coordinates && <FieldError>{errors.maps_coordinates}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel>Google Maps Place ID</FieldLabel>
                    <Input value={data.maps_place_id} onChange={(e) => setData('maps_place_id', e.target.value)} placeholder="ChIJ..." />
                    {errors.maps_place_id && <FieldError>{errors.maps_place_id}</FieldError>}
                </Field>
            </div>

            <SubmitButton processing={processing} />
        </form>
    );
}
