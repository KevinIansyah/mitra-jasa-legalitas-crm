import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import siteSettings from '@/routes/site-settings';
import { TOKEN_LIMIT_OPTIONS, type SiteSetting } from '@/types/site-setting';
import { SubmitButton } from '../../_components/shared';

export function ChatbotSection({ settings }: { settings: SiteSetting }) {
    const { data, setData, patch, processing, errors } = useForm({
        ai_chatbot_enabled: settings.ai_chatbot_enabled ?? true,
        ai_chatbot_monthly_limit: settings.ai_chatbot_monthly_limit ?? 10000000,
        ai_chatbot_whatsapp_number: settings.ai_chatbot_whatsapp_number ?? '',
        ai_chatbot_offline_message: settings.ai_chatbot_offline_message ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Pengaturan chatbot sedang diperbarui.',
        });

        patch(siteSettings.update.chatbot().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', { description: 'Pengaturan chatbot berhasil diperbarui.' });
            },
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan, coba lagi.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => {
                toast.dismiss(id);
            },
        });
    };

    const usedTokens = settings.ai_chatbot_used_tokens ?? 0;
    const monthlyLimit = settings.ai_chatbot_monthly_limit ?? 10000000;
    const usedPercentage = Math.min(Math.round((usedTokens / monthlyLimit) * 100), 100);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Toggle Chatbot */}
            <div className="flex items-start gap-4 rounded-lg border border-primary bg-transparent p-4 dark:bg-input/30">
                <Switch id="ai_chatbot_enabled" checked={data.ai_chatbot_enabled} onCheckedChange={(val) => setData('ai_chatbot_enabled', val)} />
                <div className="flex-1">
                    <Label htmlFor="ai_chatbot_enabled" className="cursor-pointer text-sm font-medium">
                        Aktifkan Chatbot AI
                    </Label>
                    <p className="text-sm text-muted-foreground">Jika aktif, widget chatbot akan muncul di website publik.</p>
                </div>
            </div>

            {/* Token Usage */}
            <div className="space-y-2 rounded-lg border border-border p-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Penggunaan Token Bulan Ini</span>
                    <span className="text-muted-foreground">
                        {usedTokens.toLocaleString('id-ID')} / {monthlyLimit.toLocaleString('id-ID')}
                    </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                        className={`h-full rounded-full transition-all ${usedPercentage >= 90 ? 'bg-destructive' : usedPercentage >= 70 ? 'bg-amber-500' : 'bg-primary'}`}
                        style={{ width: `${usedPercentage}%` }}
                    />
                </div>
                <p className="text-xs text-muted-foreground">{usedPercentage}% terpakai — Reset otomatis setiap awal bulan</p>
            </div>

            {/* Monthly Limit */}
            <Field>
                <FieldLabel>Batas Token per Bulan</FieldLabel>
                <Select value={String(data.ai_chatbot_monthly_limit)} onValueChange={(val) => setData('ai_chatbot_monthly_limit', Number(val))}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Batas Token</SelectLabel>
                            {TOKEN_LIMIT_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={String(option.value)}>
                                    {option.label} - {option.estimated}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                {errors.ai_chatbot_monthly_limit && <FieldError>{errors.ai_chatbot_monthly_limit}</FieldError>}
            </Field>

            {/* WhatsApp Fallback */}
            <Field>
                <FieldLabel>Nomor WhatsApp Fallback</FieldLabel>
                <Input value={data.ai_chatbot_whatsapp_number} onChange={(e) => setData('ai_chatbot_whatsapp_number', e.target.value)} placeholder="6282143525559" />
                <p className="text-xs text-muted-foreground">Ditampilkan saat chatbot disabled atau token habis</p>
                {errors.ai_chatbot_whatsapp_number && <FieldError>{errors.ai_chatbot_whatsapp_number}</FieldError>}
            </Field>

            {/* Offline Message */}
            <Field>
                <FieldLabel>Pesan saat Chatbot Offline</FieldLabel>
                <Textarea
                    value={data.ai_chatbot_offline_message}
                    onChange={(e) => setData('ai_chatbot_offline_message', e.target.value)}
                    placeholder="Asisten AI sedang tidak tersedia. Hubungi kami langsung via WhatsApp."
                    className="min-h-20 resize-none"
                    rows={3}
                    maxLength={500}
                />
                {errors.ai_chatbot_offline_message && <FieldError>{errors.ai_chatbot_offline_message}</FieldError>}
            </Field>

            <SubmitButton processing={processing} />
        </form>
    );
}
