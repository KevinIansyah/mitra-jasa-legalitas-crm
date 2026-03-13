import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import siteSettings from '@/routes/site-settings';
import type { SiteSetting } from '@/types/site-setting';
import { SubmitButton } from '../../_components/shared';

export function MaintenanceSection({ settings }: { settings: SiteSetting }) {
    const { data, setData, patch, processing, errors } = useForm({
        maintenance_mode: settings.maintenance_mode,
        maintenance_message: settings.maintenance_message ?? '',
        maintenance_allowed_ips: settings.maintenance_allowed_ips ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Mode maintenance sedang diperbarui.',
        });

        patch(siteSettings.update.maintenance().url, {
            preserveScroll: true,
            onSuccess: () =>
                toast.success('Berhasil', {
                    description: 'Mode maintenance berhasil diperbarui.',
                }),
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui mode maintenance, coba lagi.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => {
                toast.dismiss(id);
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-primary bg-input/30 p-4">
                <div>
                    <p className="text-sm font-medium">Aktifkan Mode Maintenance</p>
                    <p className="text-sm text-muted-foreground">Website tidak dapat diakses oleh publik</p>
                </div>
                <Switch checked={data.maintenance_mode} onCheckedChange={(v) => setData('maintenance_mode', v)} />
            </div>

            {data.maintenance_mode && (
                <>
                    <Field>
                        <FieldLabel>Pesan Maintenance</FieldLabel>
                        <Textarea
                            value={data.maintenance_message}
                            onChange={(e) => setData('maintenance_message', e.target.value)}
                            placeholder="Website sedang dalam pemeliharaan. Silakan kembali beberapa saat lagi."
                            className="min-h-20 resize-none"
                            rows={3}
                        />
                        {errors.maintenance_message && <FieldError>{errors.maintenance_message}</FieldError>}
                    </Field>
                    <Field>
                        <FieldLabel>IP yang Diizinkan</FieldLabel>
                        <Input value={data.maintenance_allowed_ips} onChange={(e) => setData('maintenance_allowed_ips', e.target.value)} placeholder="192.168.1.1, 103.10.20.30" />
                        <p className="text-xs text-muted-foreground">IP ini masih bisa mengakses website saat maintenance. Pisahkan dengan koma.</p>
                        {errors.maintenance_allowed_ips && <FieldError>{errors.maintenance_allowed_ips}</FieldError>}
                    </Field>
                </>
            )}

            <SubmitButton processing={processing} />
        </form>
    );
}
