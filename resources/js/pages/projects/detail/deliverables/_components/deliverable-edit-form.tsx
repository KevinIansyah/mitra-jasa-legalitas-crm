import { Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export type DeliverableEditData = {
    name: string;
    description: string;
    version: string;
    notes: string;
    is_final: boolean;
};

type DeliverableEditFormProps = {
    id: number | string;
    data: DeliverableEditData;
    loading: boolean;
    onChange: (val: Partial<DeliverableEditData>) => void;
    onSubmit: () => void;
    onCancel: () => void;
};

export function DeliverableEditForm({ id, data, loading, onChange, onSubmit, onCancel }: DeliverableEditFormProps) {
    return (
        <div className="space-y-4">
            <Alert className="border-primary bg-primary/20">
                <Info />
                <AlertTitle>Informasi</AlertTitle>
                <AlertDescription>Perbarui informasi hasil akhir. File tidak dapat diubah, hanya bisa dihapus dan diunggah ulang.</AlertDescription>
            </Alert>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <Switch id={`is_final_${id}`} checked={data.is_final} onCheckedChange={(v) => onChange({ is_final: v })} />
                <div>
                    <Label htmlFor={`is_final_${id}`} className={`cursor-pointer text-sm font-medium ${data.is_final ? 'text-foreground' : 'text-muted-foreground'}`}>
                        Versi Final
                    </Label>
                    <p className="text-sm text-muted-foreground">{data.is_final ? 'Ini adalah versi final' : 'Ini masih draft / revisi'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field className="md:col-span-2">
                    <FieldLabel>
                        Nama <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input value={data.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="Contoh: Akta Pendirian CV" />
                </Field>

                <Field>
                    <FieldLabel>Versi</FieldLabel>
                    <Input value={data.version} onChange={(e) => onChange({ version: e.target.value })} placeholder="Contoh: v1.0" />
                </Field>

                <Field className="md:col-span-3">
                    <FieldLabel>Deskripsi</FieldLabel>
                    <Textarea
                        value={data.description}
                        onChange={(e) => onChange({ description: e.target.value })}
                        placeholder="Jelaskan detail hasil akhir ini"
                        className="min-h-16 resize-none"
                        rows={2}
                    />
                </Field>

                <Field className="md:col-span-3">
                    <FieldLabel>Catatan</FieldLabel>
                    <Textarea
                        value={data.notes}
                        onChange={(e) => onChange({ notes: e.target.value })}
                        placeholder="Catatan tambahan (opsional)"
                        className="min-h-16 resize-none"
                        rows={2}
                    />
                </Field>
            </div>

            <div className="flex items-center gap-2">
                <Button type="button" disabled={loading || !data.name.trim()} onClick={onSubmit}>
                    {loading ? (
                        <>
                            <Spinner className="mr-2" />
                            Menyimpan...
                        </>
                    ) : (
                        'Simpan'
                    )}
                </Button>
                <Button type="button" variant="secondary" disabled={loading} onClick={onCancel}>
                    Batal
                </Button>
            </div>
        </div>
    );
}
