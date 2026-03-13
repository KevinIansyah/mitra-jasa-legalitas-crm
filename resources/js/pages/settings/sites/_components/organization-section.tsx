import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import siteSettings from '@/routes/site-settings';
import { ORG_TYPES, type SiteSetting } from '@/types/site-setting';
import { SubmitButton } from '../../_components/shared';

export function OrganizationSection({ settings }: { settings: SiteSetting }) {
    const { data, setData, patch, processing, errors } = useForm({
        org_name: settings.org_name ?? '',
        org_type: settings.org_type ?? '',
        org_description: settings.org_description ?? '',
        org_url: settings.org_url ?? '',
        org_logo_url: settings.org_logo_url ?? '',
        org_founding_year: settings.org_founding_year ?? '',
        org_area_served: settings.org_area_served ?? '',
        org_service_types: settings.org_service_types?.join(', ') ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Konfigurasi Schema.org sedang diperbarui.',
        });

        patch(siteSettings.update.organization().url, {
            preserveScroll: true,
            onSuccess: () =>
                toast.success('Berhasil', {
                    description: 'Konfigurasi Schema.org berhasil diperbarui.',
                }),
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui konfigurasi Schema.org, coba lagi.';
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
                    <FieldLabel>Nama Organisasi</FieldLabel>
                    <Input value={data.org_name} onChange={(e) => setData('org_name', e.target.value)} placeholder="CV. Mitra Jasa Legalitas" />
                    {errors.org_name && <FieldError>{errors.org_name}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel>Tipe Organisasi</FieldLabel>
                    <Select value={data.org_type} onValueChange={(val) => setData('org_type', val)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe organisasi..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Tipe Organisasi</SelectLabel>
                                {ORG_TYPES.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                        <span className={`mr-2 inline-block h-2 w-2 rounded-full ${t.classes.replace('text-white', '')}`} />
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    {errors.org_type && <FieldError>{errors.org_type}</FieldError>}
                </Field>
            </div>

            <Field>
                <FieldLabel>Deskripsi Organisasi</FieldLabel>
                <Textarea
                    value={data.org_description}
                    onChange={(e) => setData('org_description', e.target.value)}
                    placeholder="Layanan konsultasi dan pengurusan legalitas usaha profesional"
                    className="min-h-20 resize-none"
                    rows={3}
                />
                {errors.org_description && <FieldError>{errors.org_description}</FieldError>}
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                    <FieldLabel>URL Website</FieldLabel>
                    <Input value={data.org_url} onChange={(e) => setData('org_url', e.target.value)} placeholder="https://mitrajasalegalitas.co.id" />
                    {errors.org_url && <FieldError>{errors.org_url}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel>URL Logo</FieldLabel>
                    <Input value={data.org_logo_url} onChange={(e) => setData('org_logo_url', e.target.value)} placeholder="https://example.com/logo.png" />
                    {errors.org_logo_url && <FieldError>{errors.org_logo_url}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel>Tahun Berdiri</FieldLabel>
                    <Input value={data.org_founding_year} onChange={(e) => setData('org_founding_year', e.target.value)} placeholder="2015" maxLength={4} />
                    {errors.org_founding_year && <FieldError>{errors.org_founding_year}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel>Area Layanan</FieldLabel>
                    <Input value={data.org_area_served} onChange={(e) => setData('org_area_served', e.target.value)} placeholder="Surabaya, Jawa Timur, Indonesia" />
                    {errors.org_area_served && <FieldError>{errors.org_area_served}</FieldError>}
                </Field>
            </div>

            <Field>
                <FieldLabel>Jenis Layanan</FieldLabel>
                <Input value={data.org_service_types} onChange={(e) => setData('org_service_types', e.target.value)} placeholder="Pendirian PT, Perizinan Usaha, SIUP" />
                <p className="text-xs text-muted-foreground">Pisahkan dengan koma</p>
                {errors.org_service_types && <FieldError>{errors.org_service_types}</FieldError>}
            </Field>

            <SubmitButton processing={processing} />
        </form>
    );
}
