import { useForm } from '@inertiajs/react';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

import customers from '@/routes/contacts/customers';
import { TIER, type Customer, type CustomerFormData } from '@/types/contacts';

type DrawerEditProps = {
    customer: Customer;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function DrawerEdit({ customer, open, onOpenChange }: DrawerEditProps) {
    const loadingFocusRef = React.useRef<HTMLButtonElement>(null);

    const { data, setData, put, processing, errors } = useForm<CustomerFormData>({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        tier: customer.tier || '',
        status: customer.status || '',
        notes: customer.notes || '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Pelanggan sedang diperbarui.',
        });

        put(customers.update(customer.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Pelanggan berhasil diperbarui.',
                });

                onOpenChange(false);
            },
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui pelanggan, coba lagi.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => {
                toast.dismiss(id);
            },
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
                        <DrawerTitle>Edit Pelanggan</DrawerTitle>
                        <DrawerDescription>Perbarui data pelanggan yang sudah ada melalui formulir di bawah ini.</DrawerDescription>
                    </DrawerHeader>

                    <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-4">
                        <div className="grid gap-4">
                            <div className="gird-cols-1 grid gap-4 lg:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="name">
                                        Nama <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="name"
                                        type="text"
                                        name="name"
                                        required
                                        autoFocus
                                        placeholder="Masukkan nama lengkap"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    {errors.name && <FieldError>{errors.name}</FieldError>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="phone">
                                        No Telepon / Whatsapp <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="phone"
                                        type="text"
                                        name="phone"
                                        required
                                        placeholder="628xxxxxxxxxx"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                    />
                                    {errors.phone && <FieldError>{errors.phone}</FieldError>}
                                </Field>
                            </div>

                            <div className="gird-cols-1 grid gap-4 lg:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="email">
                                        Email <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="nama@email.com"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    {errors.email && <FieldError>{errors.email}</FieldError>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="tier">
                                        Tier <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Select required value={data.tier} onValueChange={(value) => setData('tier', value)}>
                                        <SelectTrigger id="tier">
                                            <SelectValue placeholder="Pilih tier" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Tier</SelectLabel>
                                                {TIER.map((item) => (
                                                    <SelectItem key={item.value} value={item.value}>
                                                        <span className={`mr-2 inline-block h-2 w-2 rounded-full ${item.classes.replace('text-white', '')}`} />
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {errors.tier && <FieldError>{errors.tier}</FieldError>}
                                </Field>
                            </div>

                            <Field>
                                <FieldLabel htmlFor="status">
                                    Status <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Select required value={data.status} onValueChange={(value) => setData('status', value)}>
                                    <SelectTrigger id="status">
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
                                {errors.status && <FieldError>{errors.status}</FieldError>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="notes">Catatan</FieldLabel>
                                <Textarea
                                    id="notes"
                                    className="min-h-24"
                                    placeholder="Tambahkan catatan jika diperlukan"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                />
                                {errors.notes && <FieldError>{errors.notes}</FieldError>}
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
