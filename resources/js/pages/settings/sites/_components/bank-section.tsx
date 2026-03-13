import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import siteSettings from '@/routes/site-settings';
import type { SiteSetting } from '@/types/site-setting';
import { SubmitButton } from '../../_components/shared';

export function BankSection({ settings }: { settings: SiteSetting }) {
    const { data, setData, patch, processing, errors } = useForm({
        bank_name: settings.bank_name ?? '',
        bank_branch: settings.bank_branch ?? '',
        bank_account_number: settings.bank_account_number ?? '',
        bank_account_holder: settings.bank_account_holder ?? '',
        bank_name_alt: settings.bank_name_alt ?? '',
        bank_branch_alt: settings.bank_branch_alt ?? '',
        bank_account_number_alt: settings.bank_account_number_alt ?? '',
        bank_account_holder_alt: settings.bank_account_holder_alt ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Informasi bank sedang diperbarui.',
        });

        patch(siteSettings.update.bank().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Informasi bank berhasil diperbarui.',
                });
            },
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui informasi bank, coba lagi.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => {
                toast.dismiss(id);
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Rekening Utama</p>
                    <Field>
                        <FieldLabel>Nama Bank</FieldLabel>
                        <Input value={data.bank_name} onChange={(e) => setData('bank_name', e.target.value)} placeholder="Bank Mandiri" />
                        {errors.bank_name && <FieldError>{errors.bank_name}</FieldError>}
                    </Field>
                    <Field>
                        <FieldLabel>Cabang</FieldLabel>
                        <Input value={data.bank_branch} onChange={(e) => setData('bank_branch', e.target.value)} placeholder="Surabaya Gubeng" />
                        {errors.bank_branch && <FieldError>{errors.bank_branch}</FieldError>}
                    </Field>
                    <Field>
                        <FieldLabel>Nomor Rekening</FieldLabel>
                        <Input value={data.bank_account_number} onChange={(e) => setData('bank_account_number', e.target.value)} placeholder="14200-1816-8848" />
                        {errors.bank_account_number && <FieldError>{errors.bank_account_number}</FieldError>}
                    </Field>
                    <Field>
                        <FieldLabel>Atas Nama</FieldLabel>
                        <Input value={data.bank_account_holder} onChange={(e) => setData('bank_account_holder', e.target.value)} placeholder="Moch Zainul Arifin" />
                        {errors.bank_account_holder && <FieldError>{errors.bank_account_holder}</FieldError>}
                    </Field>
                </div>

                <div className="space-y-3">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Rekening Alternatif</p>
                    <Field>
                        <FieldLabel>Nama Bank</FieldLabel>
                        <Input value={data.bank_name_alt} onChange={(e) => setData('bank_name_alt', e.target.value)} placeholder="BCA" />
                        {errors.bank_name_alt && <FieldError>{errors.bank_name_alt}</FieldError>}
                    </Field>
                    <Field>
                        <FieldLabel>Cabang</FieldLabel>
                        <Input value={data.bank_branch_alt} onChange={(e) => setData('bank_branch_alt', e.target.value)} placeholder="Surabaya Pusat" />
                        {errors.bank_branch_alt && <FieldError>{errors.bank_branch_alt}</FieldError>}
                    </Field>
                    <Field>
                        <FieldLabel>Nomor Rekening</FieldLabel>
                        <Input value={data.bank_account_number_alt} onChange={(e) => setData('bank_account_number_alt', e.target.value)} placeholder="1234567890" />
                        {errors.bank_account_number_alt && <FieldError>{errors.bank_account_number_alt}</FieldError>}
                    </Field>
                    <Field>
                        <FieldLabel>Atas Nama</FieldLabel>
                        <Input value={data.bank_account_holder_alt} onChange={(e) => setData('bank_account_holder_alt', e.target.value)} placeholder="Moch Zainul Arifin" />
                        {errors.bank_account_holder_alt && <FieldError>{errors.bank_account_holder_alt}</FieldError>}
                    </Field>
                </div>
            </div>

            <SubmitButton processing={processing} />
        </form>
    );
}
