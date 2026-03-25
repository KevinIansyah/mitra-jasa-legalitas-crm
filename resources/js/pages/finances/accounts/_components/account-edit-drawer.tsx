import { useForm } from '@inertiajs/react';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';

import accountsRoutes from '@/routes/finances/accounts';
import type { AccountCategory, AccountNormalBalance, AccountStatus, AccountType } from '@/types/accounts';
import { ACCOUNT_CATEGORIES, ACCOUNT_TYPES, type Account, type AccountFormData } from '@/types/accounts';

type AccountEditDrawerProps = {
    account: Account;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function AccountEditDrawer({ account, open, onOpenChange }: AccountEditDrawerProps) {
    const loadingFocusRef = React.useRef<HTMLButtonElement>(null);
    const isSystem = account.is_system;

    const { data, setData, put, processing, errors } = useForm<AccountFormData>({
        code: account.code,
        name: account.name,
        type: account.type,
        category: account.category,
        status: account.status,
        normal_balance: account.normal_balance,
    });

    const filteredCategories = data.type !== '' ? ACCOUNT_CATEGORIES.filter((c) => c.forTypes.includes(data.type)) : ACCOUNT_CATEGORIES;

    const handleTypeChange = (val: AccountType) => {
        setData({
            ...data,
            type: val,
            category: '',
            status: 'active',
            normal_balance: val === 'asset' ? 'debit' : 'credit',
        });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Akun sedang diperbarui.',
        });

        put(accountsRoutes.update(account.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', { description: 'Akun berhasil diperbarui.' });
                onOpenChange(false);
            },
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui akun, coba lagi.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => toast.dismiss(id),
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
                <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 overflow-y-auto">
                    <DrawerHeader className="px-4">
                        <DrawerTitle>Edit Akun</DrawerTitle>
                        <DrawerDescription>{isSystem ? 'Akun sistem — hanya nama yang dapat diubah.' : 'Perbarui data akun yang sudah ada.'}</DrawerDescription>
                    </DrawerHeader>

                    <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-4">
                        <div className="grid gap-4">
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                {/* Status */}
                                <Field className="col-span-2">
                                    <FieldLabel htmlFor="status">Status {isSystem && <span className="ml-2 text-xs text-muted-foreground">(tidak dapat diubah)</span>}</FieldLabel>
                                    <Select value={data.status} onValueChange={(val) => setData('status', val as AccountStatus)} disabled={isSystem}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih status..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Status</SelectLabel>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <FieldError>{errors.status}</FieldError>}
                                </Field>

                                {/* Name */}
                                <Field>
                                    <FieldLabel htmlFor="name">
                                        Nama Akun <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input id="name" placeholder="contoh: Kas Kecil" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                    {errors.name && <FieldError>{errors.name}</FieldError>}
                                </Field>

                                {/* Code */}
                                <Field>
                                    <FieldLabel htmlFor="code">
                                        Kode Akun
                                        {isSystem && <span className="ml-2 text-xs text-muted-foreground">(tidak dapat diubah)</span>}
                                    </FieldLabel>
                                    <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} disabled={isSystem} />
                                    {errors.code && <FieldError>{errors.code}</FieldError>}
                                </Field>
                            </div>

                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                {/* Type */}
                                <Field>
                                    <FieldLabel>
                                        Tipe Akun
                                        {isSystem && <span className="ml-2 text-xs text-muted-foreground">(tidak dapat diubah)</span>}
                                    </FieldLabel>
                                    <Select value={data.type} onValueChange={(val) => handleTypeChange(val as AccountType)} disabled={isSystem}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih tipe akun..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Tipe</SelectLabel>
                                                {ACCOUNT_TYPES.map((item) => (
                                                    <SelectItem key={item.value} value={item.value}>
                                                        <span className={`mr-2 inline-block h-2 w-2 rounded-full ${item.classes.replace('text-white', '')}`} />
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {errors.type && <FieldError>{errors.type}</FieldError>}
                                </Field>

                                {/* Category */}
                                <Field>
                                    <FieldLabel>
                                        Kategori
                                        {isSystem && <span className="ml-2 text-xs text-muted-foreground">(tidak dapat diubah)</span>}
                                    </FieldLabel>
                                    <Select value={data.category} onValueChange={(val) => setData('category', val as AccountCategory)} disabled={isSystem || data.type === ''}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih kategori..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Kategori</SelectLabel>
                                                {filteredCategories.map((item) => (
                                                    <SelectItem key={item.value} value={item.value}>
                                                        <span className={`mr-2 inline-block h-2 w-2 rounded-full ${item.classes.replace('text-white', '')}`} />
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {errors.category && <FieldError>{errors.category}</FieldError>}
                                </Field>
                            </div>

                            {/* Normal Balance */}
                            <Field>
                                <FieldLabel>
                                    Normal Balance
                                    {isSystem && <span className="ml-2 text-xs text-muted-foreground">(tidak dapat diubah)</span>}
                                </FieldLabel>
                                <Select value={data.normal_balance} onValueChange={(val) => setData('normal_balance', val as AccountNormalBalance)} disabled={isSystem}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih normal balance..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="debit">Debit</SelectItem>
                                        <SelectItem value="credit">Credit</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.normal_balance && <FieldError>{errors.normal_balance}</FieldError>}
                            </Field>
                        </div>

                        <DrawerFooter className="mt-auto px-0">
                            <Button ref={loadingFocusRef} type="submit" disabled={processing}>
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
                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
