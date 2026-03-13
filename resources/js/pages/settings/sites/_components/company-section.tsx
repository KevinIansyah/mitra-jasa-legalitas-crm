import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import siteSettings from '@/routes/site-settings';
import type { SiteSetting } from '@/types/site-setting';
import { ImageUpload, SubmitButton } from '../../_components/shared';

export function CompanySection({ settings }: { settings: SiteSetting }) {
    const { data, setData, post, processing, errors } = useForm({
        company_name: settings.company_name ?? '',
        company_tagline: settings.company_tagline ?? '',
        company_logo: null as File | null,
        remove_logo: false,
        company_favicon: null as File | null,
        remove_favicon: false,
        company_address: settings.company_address ?? '',
        company_city: settings.company_city ?? '',
        company_province: settings.company_province ?? '',
        company_postal_code: settings.company_postal_code ?? '',
        company_country: settings.company_country ?? 'ID',
        company_phone: settings.company_phone ?? '',
        company_phone_alt: settings.company_phone_alt ?? '',
        company_whatsapp: settings.company_whatsapp ?? '',
        company_email: settings.company_email ?? '',
        company_email_support: settings.company_email_support ?? '',
        company_website: settings.company_website ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Identitas perusahaan sedang diperbarui.',
        });

        post(siteSettings.update.company().url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Identitas perusahaan berhasil diperbarui.',
                });
            },
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui identitas perusahaan, coba lagi.';
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
                    label="Logo Perusahaan"
                    name="company_logo"
                    currentUrl={settings.company_logo}
                    hint="Rekomendasi: SVG atau PNG transparan"
                    onChange={(file) => setData('company_logo', file)}
                    onRemove={() => setData('remove_logo', true)}
                    errorForm={errors.company_logo}
                />
                <ImageUpload
                    label="Favicon"
                    name="company_favicon"
                    currentUrl={settings.company_favicon}
                    hint="Rekomendasi: 32×32px PNG atau ICO"
                    onChange={(file) => setData('company_favicon', file)}
                    onRemove={() => setData('remove_favicon', true)}
                    errorForm={errors.company_favicon}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                    <FieldLabel>Nama Perusahaan</FieldLabel>
                    <Input value={data.company_name} onChange={(e) => setData('company_name', e.target.value)} placeholder="CV. Mitra Jasa Legalitas" />
                    {errors.company_name && <FieldError>{errors.company_name}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel>Tagline</FieldLabel>
                    <Input value={data.company_tagline} onChange={(e) => setData('company_tagline', e.target.value)} placeholder="Layanan Legalitas Usaha Anda" />
                    {errors.company_tagline && <FieldError>{errors.company_tagline}</FieldError>}
                </Field>
            </div>

            <Field>
                <FieldLabel>Alamat Lengkap</FieldLabel>
                <Textarea
                    value={data.company_address}
                    onChange={(e) => setData('company_address', e.target.value)}
                    placeholder="Jl. Contoh No. 1, Kel. Contoh"
                    className="min-h-20 resize-none"
                    rows={2}
                />
                {errors.company_address && <FieldError>{errors.company_address}</FieldError>}
            </Field>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Field className="col-span-2">
                    <FieldLabel>Kota</FieldLabel>
                    <Input value={data.company_city} onChange={(e) => setData('company_city', e.target.value)} placeholder="Surabaya" />
                    {errors.company_city && <FieldError>{errors.company_city}</FieldError>}
                </Field>
                <Field className="col-span-2">
                    <FieldLabel>Provinsi</FieldLabel>
                    <Input value={data.company_province} onChange={(e) => setData('company_province', e.target.value)} placeholder="Jawa Timur" />
                    {errors.company_province && <FieldError>{errors.company_province}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel>Kode Pos</FieldLabel>
                    <Input value={data.company_postal_code} onChange={(e) => setData('company_postal_code', e.target.value)} placeholder="60111" />
                    {errors.company_postal_code && <FieldError>{errors.company_postal_code}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel>Negara</FieldLabel>
                    <Input value={data.company_country} onChange={(e) => setData('company_country', e.target.value)} placeholder="ID" maxLength={5} />
                    {errors.company_country && <FieldError>{errors.company_country}</FieldError>}
                </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                    <FieldLabel>Telepon Utama</FieldLabel>
                    <Input value={data.company_phone} onChange={(e) => setData('company_phone', e.target.value)} placeholder="031-12345678" />
                    {errors.company_phone && <FieldError>{errors.company_phone}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel>Telepon Alternatif</FieldLabel>
                    <Input value={data.company_phone_alt} onChange={(e) => setData('company_phone_alt', e.target.value)} placeholder="031-87654321" />
                    {errors.company_phone_alt && <FieldError>{errors.company_phone_alt}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel>Nomor WhatsApp</FieldLabel>
                    <Input value={data.company_whatsapp} onChange={(e) => setData('company_whatsapp', e.target.value)} placeholder="6282143525559" />
                    {errors.company_whatsapp && <FieldError>{errors.company_whatsapp}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel>Website</FieldLabel>
                    <Input value={data.company_website} onChange={(e) => setData('company_website', e.target.value)} placeholder="https://example.com" />
                    {errors.company_website && <FieldError>{errors.company_website}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel>Email Utama</FieldLabel>
                    <Input type="email" value={data.company_email} onChange={(e) => setData('company_email', e.target.value)} placeholder="info@example.com" />
                    {errors.company_email && <FieldError>{errors.company_email}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel>Email Support</FieldLabel>
                    <Input type="email" value={data.company_email_support} onChange={(e) => setData('company_email_support', e.target.value)} placeholder="support@example.com" />
                    {errors.company_email_support && <FieldError>{errors.company_email_support}</FieldError>}
                </Field>
            </div>

            <SubmitButton processing={processing} />
        </form>
    );
}
