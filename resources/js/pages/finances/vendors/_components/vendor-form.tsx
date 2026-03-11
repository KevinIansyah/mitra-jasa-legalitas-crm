import { CircleCheck, Landmark, Plus, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import type { VendorBankAccount, VendorFormData, VendorStatus } from '@/types/vendors';
import { VENDOR_CATEGORIES } from '@/types/vendors';

type VendorFormErrors = Partial<Record<string, string>>;

type VendorFormProps = {
    data: VendorFormData;
    errors: VendorFormErrors;
    onChange: (val: Partial<VendorFormData>) => void;
    isEdit?: boolean;
};

const EMPTY_BANK: VendorBankAccount = {
    bank_name: '',
    account_number: '',
    account_holder: '',
    is_primary: false,
};

export function VendorForm({ data, errors, onChange, isEdit }: VendorFormProps) {
    function addBankAccount() {
        const accounts = [...data.bank_accounts, { ...EMPTY_BANK, is_primary: data.bank_accounts.length === 0 }];
        onChange({ bank_accounts: accounts });
    }

    function removeBankAccount(index: number) {
        const accounts = data.bank_accounts.filter((_, i) => i !== index);
        if (data.bank_accounts[index].is_primary && accounts.length > 0) {
            accounts[0].is_primary = true;
        }
        onChange({ bank_accounts: accounts });
    }

    function updateBankAccount(index: number, field: keyof VendorBankAccount, value: string | boolean) {
        const accounts = data.bank_accounts.map((acc, i) => {
            if (i !== index) return field === 'is_primary' && value ? { ...acc, is_primary: false } : acc;
            return { ...acc, [field]: value };
        });
        onChange({ bank_accounts: accounts });
    }

    function setPrimary(index: number) {
        const accounts = data.bank_accounts.map((acc, i) => ({ ...acc, is_primary: i === index }));
        onChange({ bank_accounts: accounts });
    }

    return (
        <div className="space-y-4">
            {/* Info Dasar */}
            <div className="rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold">Informasi Vendor</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Data utama vendor atau supplier</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {isEdit && (
                            <Field>
                                <FieldLabel>Status</FieldLabel>
                                <Select value={data.status} onValueChange={(v) => onChange({ status: v as VendorStatus })}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Status</SelectLabel>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>
                        )}

                        <Field className={`${isEdit ? 'col-span-1' : 'col-span-2'}`}>
                            <FieldLabel>
                                Nama Vendor <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Input
                                value={data.name}
                                onChange={(e) => onChange({ name: e.target.value })}
                                placeholder="Contoh: PT Mitra Solusi"
                                className={errors.name ? 'border-destructive' : ''}
                            />
                            {errors.name && <FieldError>{errors.name}</FieldError>}
                        </Field>

                        <Field>
                            <FieldLabel>Kategori</FieldLabel>
                            <Select value={data.category} onValueChange={(v) => onChange({ category: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kategori..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {VENDOR_CATEGORIES.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>
                                            <span className={`mr-2 inline-block h-2 w-2 rounded-full ${c.classes.replace('text-white', '')}`} />
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <FieldLabel>NPWP</FieldLabel>
                            <Input value={data.npwp} onChange={(e) => onChange({ npwp: e.target.value })} placeholder="00.000.000.0-000.000" />
                        </Field>

                        <Field>
                            <FieldLabel>Telepon</FieldLabel>
                            <Input value={data.phone} onChange={(e) => onChange({ phone: e.target.value })} placeholder="628xxxxxxxxxx" />
                        </Field>

                        <Field>
                            <FieldLabel>Email</FieldLabel>
                            <Input
                                type="email"
                                value={data.email}
                                onChange={(e) => onChange({ email: e.target.value })}
                                placeholder="vendor@email.com"
                                className={errors.email ? 'border-destructive' : ''}
                            />
                            {errors.email && <FieldError>{errors.email}</FieldError>}
                        </Field>

                        <Field className="col-span-2">
                            <FieldLabel>Alamat</FieldLabel>
                            <Textarea
                                value={data.address}
                                onChange={(e) => onChange({ address: e.target.value })}
                                placeholder="Alamat lengkap vendor..."
                                className="min-h-24 resize-none"
                                rows={3}
                            />
                        </Field>

                        <Field className="col-span-2">
                            <FieldLabel>Catatan</FieldLabel>
                            <Textarea
                                value={data.notes}
                                onChange={(e) => onChange({ notes: e.target.value })}
                                placeholder="Catatan tambahan tentang vendor ini..."
                                className="min-h-24 resize-none"
                                rows={3}
                            />
                        </Field>
                    </div>
                </div>
            </div>

            {/* Rekening Bank */}
            <div className="rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-semibold">Rekening Bank</h2>
                            <p className="mt-0.5 text-sm text-muted-foreground">Tambahkan rekening bank vendor</p>
                        </div>

                        {data.bank_accounts.length > 0 && (
                            <Button type="button" onClick={addBankAccount} className="min-w-30">
                                <Plus className="size-4" />
                                Tambah
                            </Button>
                        )}
                    </div>

                    {data.bank_accounts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border py-16 text-muted-foreground">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                <Landmark className="size-5 text-primary" />
                            </div>
                            <p className="text-sm">Belum ada rekening bank</p>
                            <Button type="button" onClick={addBankAccount} className="gap-1.5">
                                <Plus className="size-4" />
                                Tambah Rekening Bank Pertama
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data.bank_accounts.map((acc, index) => (
                                <div key={index} className="space-y-4 rounded-lg bg-primary/10 p-4 md:p-6 dark:bg-muted/40">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold">Rekening #{index + 1}</span>
                                            {acc.is_primary && <Badge className="bg-emerald-500 text-white">Utama</Badge>}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {!acc.is_primary && data.bank_accounts.length > 1 && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button type="button" variant="secondary" className="h-8 w-8" onClick={() => setPrimary(index)}>
                                                            <CircleCheck className="size-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Jadikan Rekening Utama</TooltipContent>
                                                </Tooltip>
                                            )}

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button type="button" variant="destructive" className="h-8 w-8" onClick={() => removeBankAccount(index)}>
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Hapus Rekening</TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        <Field>
                                            <FieldLabel>
                                                Nama Bank <span className="text-destructive">*</span>
                                            </FieldLabel>
                                            <Input
                                                value={acc.bank_name}
                                                onChange={(e) => updateBankAccount(index, 'bank_name', e.target.value)}
                                                placeholder="BCA, BRI, Mandiri..."
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel>
                                                Nomor Rekening <span className="text-destructive">*</span>
                                            </FieldLabel>
                                            <Input
                                                value={acc.account_number}
                                                onChange={(e) => updateBankAccount(index, 'account_number', e.target.value)}
                                                placeholder="1234567890"
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel>
                                                Atas Nama <span className="text-destructive">*</span>
                                            </FieldLabel>
                                            <Input
                                                value={acc.account_holder}
                                                onChange={(e) => updateBankAccount(index, 'account_holder', e.target.value)}
                                                placeholder="Nama pemilik rekening"
                                            />
                                        </Field>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
