import { useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { DatePicker } from '@/components/date-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

import { formatRupiah } from '@/lib/service';
import finances from '@/routes/finances';
import type { Account } from '@/types/account';
import type { JournalEntry, JournalLineFormData, ManualJournalFormData, ManualJournalFormErrors } from '@/types/journal-entries';

const EMPTY_LINE: JournalLineFormData = { account_id: '', debit: 0, credit: 0, notes: '' };

interface Props {
    entry: JournalEntry;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accounts: Account[];
}

export function JournalEditDrawer({ entry, open, onOpenChange, accounts }: Props) {
    const loadingFocusRef = React.useRef<HTMLButtonElement>(null);

    const { data, setData, put, processing, errors } = useForm<ManualJournalFormData>({
        date: entry.date,
        description: entry.description,
        lines: (entry.lines ?? []).map((l) => ({
            account_id: l.account_id,
            debit: Number(l.debit),
            credit: Number(l.credit),
            notes: l.notes ?? '',
        })),
    });

    const fieldErrors = errors as ManualJournalFormErrors;

    const addLine = () => setData('lines', [...data.lines, { ...EMPTY_LINE }]);

    const removeLine = (i: number) =>
        setData(
            'lines',
            data.lines.filter((_, idx) => idx !== i),
        );

    const updateLine = <K extends keyof JournalLineFormData>(i: number, field: K, value: JournalLineFormData[K]) => {
        const updated = [...data.lines];
        updated[i] = { ...updated[i], [field]: value };
        setData('lines', updated);
    };

    const totalDebit = data.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
    const totalCredit = data.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    const handleSubmit = () => {
        const toastId = toast.loading('Memproses...', { description: 'Jurnal sedang diperbarui.' });

        put(finances.journalEntries.update(entry.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', { description: 'Jurnal berhasil diperbarui.' });
                onOpenChange(false);
            },
            onError: (errs) => {
                const msg = Object.values(errs)[0] ?? 'Terjadi kesalahan.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => toast.dismiss(toastId),
        });
    };

    return (
        <Drawer direction="bottom" open={open} onOpenChange={onOpenChange}>
            <DrawerContent
                className="flex h-screen flex-col"
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                    loadingFocusRef.current?.focus();
                }}
            >
                <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-y-auto">
                    <DrawerHeader className="px-4">
                        <DrawerTitle>Edit Jurnal Manual</DrawerTitle>
                        <DrawerDescription>Perbarui data jurnal. Total debit harus sama dengan total kredit.</DrawerDescription>
                    </DrawerHeader>

                    <div className="flex-1 space-y-6 px-4 pb-4">
                        {/* Tanggal & Deskripsi */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Field>
                                <FieldLabel>
                                    Tanggal <span className="text-destructive">*</span>
                                </FieldLabel>
                                <DatePicker value={data.date} onChange={(v) => setData('date', v)} fromYear={2020} toYear={2040} />
                                {errors.date && <FieldError>{errors.date}</FieldError>}
                            </Field>

                            <Field>
                                <FieldLabel>
                                    Keterangan <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Textarea
                                    className="min-h-20 resize-none"
                                    placeholder="contoh: Penyetoran modal awal..."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                {errors.description && <FieldError>{errors.description}</FieldError>}
                            </Field>
                        </div>

                        <Separator />

                        {/* Baris jurnal */}
                        <div className="space-y-3">
                            <Field>
                                <FieldLabel>Baris Jurnal</FieldLabel>
                            </Field>

                            <div className="hidden grid-cols-[1fr_150px_150px_150px_32px] gap-2 px-1 text-xs font-medium text-muted-foreground md:grid">
                                <span>Akun</span>
                                <span>Debit (Rp)</span>
                                <span>Kredit (Rp)</span>
                                <span>Keterangan</span>
                                <span />
                            </div>

                            {data.lines.map((line, i) => (
                                <div key={i} className="grid grid-cols-[1fr_150px_150px_150px_32px] items-start gap-2">
                                    <div>
                                        <Select value={line.account_id ? String(line.account_id) : ''} onValueChange={(v) => updateLine(i, 'account_id', Number(v))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih akun..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {accounts.map((item) => (
                                                    <SelectItem key={item.id} value={String(item.id)}>
                                                        <span className="mr-2">{item.code}</span>
                                                        <span className="mr-2">-</span>
                                                        {item.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldErrors[`lines.${i}.account_id`] && <FieldError>{fieldErrors[`lines.${i}.account_id`]}</FieldError>}
                                    </div>

                                    <div>
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="0"
                                            value={line.debit || ''}
                                            onChange={(e) => {
                                                const v = parseFloat(e.target.value) || 0;
                                                const updated = [...data.lines];
                                                updated[i] = { ...updated[i], debit: v, credit: v > 0 ? 0 : updated[i].credit };
                                                setData('lines', updated);
                                            }}
                                        />
                                        {line.debit > 0 && <p className="mt-0.5 text-xs text-muted-foreground">{formatRupiah(line.debit)}</p>}
                                    </div>

                                    <div>
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="0"
                                            value={line.credit || ''}
                                            onChange={(e) => {
                                                const v = parseFloat(e.target.value) || 0;
                                                const updated = [...data.lines];
                                                updated[i] = { ...updated[i], credit: v, debit: v > 0 ? 0 : updated[i].debit };
                                                setData('lines', updated);
                                            }}
                                        />
                                        {line.credit > 0 && <p className="mt-0.5 text-xs text-muted-foreground">{formatRupiah(line.credit)}</p>}
                                    </div>

                                    <div>
                                        <Input placeholder="Opsional..." value={line.notes} onChange={(e) => updateLine(i, 'notes', e.target.value)} />
                                    </div>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-muted-foreground hover:text-destructive"
                                        onClick={() => removeLine(i)}
                                        disabled={data.lines.length <= 2}
                                    >
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                </div>
                            ))}

                            {fieldErrors.lines && <FieldError>{fieldErrors.lines}</FieldError>}

                            <Button type="button" variant="outline" size="sm" onClick={addLine} className="gap-1.5">
                                <Plus className="size-3.5" />
                                Tambah Baris
                            </Button>
                        </div>

                        <Separator />

                        {/* Total */}
                        <div className="flex items-center justify-end gap-6 rounded-lg bg-muted/40 px-4 py-3">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Total Debit</span>
                                <span className="font-semibold text-blue-500 tabular-nums">{formatRupiah(totalDebit)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Total Kredit</span>
                                <span className="font-semibold text-emerald-500 tabular-nums">{formatRupiah(totalCredit)}</span>
                            </div>
                            <Badge variant={isBalanced ? 'default' : 'destructive'} className={isBalanced ? 'bg-emerald-500 text-white' : ''}>
                                {isBalanced ? 'Balance ✓' : 'Tidak Balance'}
                            </Badge>
                        </div>
                    </div>

                    <DrawerFooter className="px-4">
                        <Button ref={loadingFocusRef} onClick={handleSubmit} disabled={processing || !isBalanced || !data.date || !data.description.trim()}>
                            {processing ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan'
                            )}
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="secondary" type="button">
                                Batal
                            </Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
