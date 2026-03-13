import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { Select, SelectContent, SelectTrigger, SelectValue, SelectGroup, SelectItem, SelectLabel } from '@/components/ui/select';
import siteSettings from '@/routes/site-settings';
import { LEGAL_ENTITY_TYPES, type SiteSetting } from '@/types/site-setting';
import { SubmitButton } from '../../_components/shared';

export function LegalSection({ settings }: { settings: SiteSetting }) {
    const { data, setData, patch, processing, errors } = useForm({
        legal_entity_type: settings.legal_entity_type ?? '',
        legal_npwp: settings.legal_npwp ?? '',
        legal_registration_number: settings.legal_registration_number ?? '',
        legal_nib: settings.legal_nib ?? '',
        legal_siup: settings.legal_siup ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Informasi legal sedang diperbarui.',
        });

        patch(siteSettings.update.legal().url, {
            preserveScroll: true,
            onSuccess: () =>
                toast.success('Berhasil', {
                    description: 'Informasi legal berhasil diperbarui.',
                }),
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui informasi legal, coba lagi.';
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
                <FieldLabel>Bentuk Badan Hukum</FieldLabel>
                <Select value={data.legal_entity_type} onValueChange={(val) => setData('legal_entity_type', val)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih badan hukum..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Bentuk Badan Hukum</SelectLabel>
                            {LEGAL_ENTITY_TYPES.map((t) => (
                                <SelectItem key={t.value} value={t.value}>
                                    <span className={`mr-2 inline-block h-2 w-2 rounded-full ${t.classes.replace('text-white', '')}`} />
                                    {t.label}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                {errors.legal_entity_type && <FieldError>{errors.legal_entity_type}</FieldError>}
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                    <FieldLabel>NPWP</FieldLabel>
                    <Input value={data.legal_npwp} onChange={(e) => setData('legal_npwp', e.target.value)} placeholder="42.843.664.6-606.000" />
                    {errors.legal_npwp && <FieldError>{errors.legal_npwp}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel>Nomor Registrasi</FieldLabel>
                    <Input value={data.legal_registration_number} onChange={(e) => setData('legal_registration_number', e.target.value)} placeholder="1287000721661" />
                    {errors.legal_registration_number && <FieldError>{errors.legal_registration_number}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel>NIB (Nomor Induk Berusaha)</FieldLabel>
                    <Input value={data.legal_nib} onChange={(e) => setData('legal_nib', e.target.value)} placeholder="0000000000000" />
                    {errors.legal_nib && <FieldError>{errors.legal_nib}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel>SIUP</FieldLabel>
                    <Input value={data.legal_siup} onChange={(e) => setData('legal_siup', e.target.value)} placeholder="503/xxx/SIUP/2020" />
                    {errors.legal_siup && <FieldError>{errors.legal_siup}</FieldError>}
                </Field>
            </div>

            <SubmitButton processing={processing} />
        </form>
    );
}
