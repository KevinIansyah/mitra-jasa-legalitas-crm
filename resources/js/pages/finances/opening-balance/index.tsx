import { useForm } from '@inertiajs/react';
import { Head, usePage } from '@inertiajs/react';
import { CircleCheck, Info, Landmark, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { DatePicker } from '@/components/date-picker';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import AppLayout from '@/layouts/app-layout';
import { formatRupiah } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import finances from '@/routes/finances';
import type { BreadcrumbItem } from '@/types';
import { ACCOUNT_TYPES_MAP, type Account } from '@/types/account';
import type { ExistingOpeningBalance, OpeningBalanceFormData, OpeningBalanceFormErrors, OpeningBalanceItemFormData } from '@/types/journal-entries';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Keuangan', href: '#' },
    { title: 'Saldo Awal', href: '#' },
];

export default function Page() {
    const [draftAccountId, setDraftAccountId] = useState<number | ''>('');
    const [draftBalance, setDraftBalance] = useState<number | ''>('');

    const { accounts, existing, isSet } = usePage<{
        accounts: Account[];
        existing: ExistingOpeningBalance | null;
        isSet: boolean;
    }>().props;

    const [isEditing, setIsEditing] = useState(!isSet);

    const { data, setData, post, put, processing, errors } = useForm<OpeningBalanceFormData>({
        date: existing?.date ?? '',
        balances:
            existing?.balances.map((b) => ({
                account_id: b.account_id,
                balance: b.balance,
            })) ?? [],
    });

    const fieldErrors = errors as OpeningBalanceFormErrors;

    const addBalance = () => {
        if (!draftAccountId) return;
        const newItem: OpeningBalanceItemFormData = {
            account_id: draftAccountId,
            balance: Number(draftBalance) || 0,
        };
        setData('balances', [...data.balances, newItem]);
        setDraftAccountId('');
        setDraftBalance('');
    };

    const removeBalance = (i: number) =>
        setData(
            'balances',
            data.balances.filter((_, idx) => idx !== i),
        );

    const totalBalance = data.balances.reduce((sum, l) => sum + (Number(l.balance) || 0), 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isSet) {
            const toastId = toast.loading('Memproses...', { description: 'Saldo awal sedang diperbarui.' });

            put(finances.openingBalance.update().url, {
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Saldo awal berhasil diperbarui.' });
                    setIsEditing(false);
                },
                onError: () => {
                    const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui saldo awal, coba lagi.';
                    toast.error('Gagal', { description: String(msg) });
                },
                onFinish: () => {
                    toast.dismiss(toastId);
                },
            });
        } else {
            const toastId = toast.loading('Memproses...', { description: 'Saldo awal sedang ditambahkan.' });

            post(finances.openingBalance.store().url, {
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Saldo awal berhasil ditambahkan.' });
                    setIsEditing(false);
                },
                onError: () => {
                    const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat menambahkan saldo awal, coba lagi.';
                    toast.error('Gagal', { description: String(msg) });
                },
                onFinish: () => {
                    toast.dismiss(toastId);
                },
            });
        }
    };

    const usedAccountIds = data.balances.map((b) => b.account_id);
    const availableAccounts = accounts.filter((a) => !usedAccountIds.includes(a.id));
    const getAccount = (id: number | '') => accounts.find((a) => a.id === id);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Saldo Awal" />
            <div className="p-4 md:p-6">
                <Heading title="Saldo Awal" description="Input saldo awal akun sebelum pencatatan transaksi dimulai" />

                {/* ───────────────── Opening Balance Alert Section ───────────────── */}
                {isSet ? (
                    <Alert className="mb-4 border-emerald-500 bg-emerald-500/10">
                        <CircleCheck className="size-4 text-emerald-600" />
                        <AlertTitle>Saldo awal sudah diisi</AlertTitle>
                        <AlertDescription className="flex items-center gap-2">
                            Saldo awal telah dicatat pada {existing?.date && formatDate(existing.date)}. Untuk koreksi, tambahkan jurnal manual.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Alert className="mb-4 border-primary bg-primary/20">
                        <Info className="size-4" />
                        <AlertTitle>Informasi</AlertTitle>
                        <AlertDescription>
                            Saldo awal hanya perlu diisi sekali. Setelah ada transaksi yang tercatat, saldo awal tidak dapat diubah lagi.
                            {isSet && ' Untuk koreksi, tambahkan jurnal manual.'}
                        </AlertDescription>
                    </Alert>
                )}

                {/* ───────────────── Opening Balance Summary Section ───────────────── */}
                {isSet && !isEditing && (
                    <div className="mb-6 space-y-4">
                        <div className="rounded-xl border-none bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-semibold">Ringkasan Saldo Awal</h2>
                                    <p className="mt-0.5 text-sm text-muted-foreground">Daftar saldo awal akun yang digunakan dalam sistem</p>
                                </div>
                                <div className="space-y-1 border-y">
                                    <div>
                                        {existing?.balances.map((item) => {
                                            const typeMeta = ACCOUNT_TYPES_MAP[item.account_type as keyof typeof ACCOUNT_TYPES_MAP];
                                            return (
                                                <div key={item.account_id} className="flex items-center justify-between border-b p-3 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-16 text-muted-foreground">{item.account_code}</span>
                                                        <span>{item.account_name}</span>
                                                        {typeMeta && <Badge className={`${typeMeta.classes}`}>{typeMeta.label}</Badge>}
                                                    </div>
                                                    <span className="tabular-nums">{formatRupiah(item.balance)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="flex items-center justify-between border-t p-3 text-sm font-medium">
                                        <span>Total</span>
                                        <span className="tabular-nums">{formatRupiah(existing?.balances.reduce((s, b) => s + b.balance, 0) ?? 0)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ───────────────── Opening Balance Form Section ───────────────── */}
                {isEditing && (
                    <form onSubmit={handleSubmit}>
                        <div className="rounded-xl border-none bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-semibold">{isSet ? 'Ubah Saldo Awal' : 'Input Saldo Awal'}</h2>
                                    <p className="mt-0.5 text-sm text-muted-foreground">Masukkan saldo per akun pada tanggal awal pembukuan</p>
                                </div>

                                <div className="space-y-4">
                                    {/* Date */}
                                    <Field>
                                        <FieldLabel>Tanggal Saldo Awal</FieldLabel>
                                        <DatePicker value={data.date} onChange={(val) => setData('date', val)} fromYear={2020} toYear={2040} />
                                        {errors.date && <FieldError>{errors.date}</FieldError>}
                                    </Field>

                                    {/* Accounts & Balances */}
                                    <Field>
                                        <FieldLabel>Akun & Saldo</FieldLabel>

                                        {/* List accounts that have been added */}
                                        {data.balances.length > 0 && (
                                            <div className="mb-2 space-y-2">
                                                {data.balances.map((line, i) => {
                                                    const acc = getAccount(line.account_id);
                                                    return (
                                                        <div key={i} className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 dark:bg-muted/40">
                                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                                                <Landmark className="size-4 text-primary" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-medium">{acc?.name ?? `Akun #${line.account_id}`}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    <span>{acc?.code}</span>
                                                                    {' · '}
                                                                    {formatRupiah(line.balance)}
                                                                </p>
                                                            </div>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button type="button" variant="destructive" size="sm" className="h-8 w-8" onClick={() => removeBalance(i)}>
                                                                        <Trash2 className="size-3.5" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Hapus Akun</TooltipContent>
                                                            </Tooltip>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        <InputError message={fieldErrors.balances} />

                                        
                                        <div className="flex flex-col gap-2 md:flex-row">
                                            {/* Account Select */}
                                            <Select value={draftAccountId ? String(draftAccountId) : ''} onValueChange={(v) => setDraftAccountId(Number(v))}>
                                                <SelectTrigger className="flex-1">
                                                    <SelectValue placeholder="Pilih akun..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableAccounts.map((item) => (
                                                        <SelectItem key={item.id} value={String(item.id)}>
                                                            <span className="mr-2">{item.code}</span>
                                                            <span className="mr-2">-</span>
                                                            {item.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            {/* Balance Input */}
                                            <div className="flex gap-2">
                                                <div className="flex w-full flex-col gap-3 md:w-40">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        placeholder="Saldo awal"
                                                        className="w-full"
                                                        value={draftBalance}
                                                        onChange={(e) => setDraftBalance(parseFloat(e.target.value) || '')}
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBalance())}
                                                    />
                                                    {draftBalance !== '' && Number(draftBalance) > 0 && (
                                                        <p className="text-xs text-muted-foreground">{formatRupiah(Number(draftBalance))}</p>
                                                    )}
                                                </div>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button type="button" size="icon" onClick={addBalance} disabled={!draftAccountId}>
                                                            <Plus className="size-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Tambah Akun</TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </Field>

                                    {/* Total Balance */}
                                    <div className="flex items-center justify-between rounded-lg bg-primary/10 px-4 py-3 dark:bg-muted/40">
                                        <span className="text-sm font-medium">Total Saldo</span>
                                        <span className="text-sm font-semibold tabular-nums">{formatRupiah(totalBalance)}</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button type="submit" className="flex-1 md:w-45 md:flex-none" disabled={processing}>
                                            {processing ? (
                                                <>
                                                    <Spinner className="mr-2" />
                                                    Menyimpan...
                                                </>
                                            ) : (
                                                'Simpan'
                                            )}
                                        </Button>
                                        {isSet && (
                                            <Button type="button" className="flex-1 md:w-45 md:flex-none" variant="secondary" onClick={() => setIsEditing(false)}>
                                                Batal
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </AppLayout>
    );
}
