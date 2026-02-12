import { useForm } from '@inertiajs/react';
import axios from 'axios';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import customers from '@/routes/contacts/customers';
import type { CustomerFormData } from '@/types/contact';

type DrawerEditProps = {
    customerId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function DrawerEdit({ customerId, open, onOpenChange }: DrawerEditProps) {
    const [loading, setLoading] = React.useState(false);
    const loadingFocusRef = React.useRef<HTMLButtonElement>(null);

    const { data, setData, put, processing, errors } = useForm<CustomerFormData>({
        name: '',
        phone: '',
        email: '',
        tier: '',
        notes: '',
    });

    React.useEffect(() => {
        if (open && customerId) {
            setLoading(true);

            axios
                .get(customers.edit(customerId).url)
                .then((response) => {
                    const customer = response.data.customer;
                    console.log(customer);
                    setData({
                        name: customer.name || '',
                        phone: customer.phone || '',
                        email: customer.email || '',
                        tier: customer.tier || '',
                        status: customer.status || '',
                        notes: customer.notes || '',
                    });
                })
                .catch(() => {
                    toast.error('Gagal', {
                        description: 'Terjadi kesalahan saat mengambil data customer',
                    });
                    onOpenChange(false);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [open, customerId, setData, onOpenChange]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(customers.update(customerId).url, {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
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
                <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-y-auto">
                    <DrawerHeader className="px-4">
                        <DrawerTitle>Edit Pelanggan</DrawerTitle>
                        <DrawerDescription>Perbarui data pelanggan yang sudah ada melalui formulir di bawah ini.</DrawerDescription>
                    </DrawerHeader>

                    {loading ? (
                        <div className="flex flex-1 flex-col px-4">
                            <div className="grid gap-4">
                                <div className="gird-cols-1 grid gap-4 lg:grid-cols-2">
                                    <Field>
                                        <FieldLabel htmlFor="name">
                                            Nama <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Skeleton className="h-10 w-full" />
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="phone">
                                            No Telpon / Whatsapp <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Skeleton className="h-10 w-full" />
                                    </Field>
                                </div>

                                <div className="gird-cols-1 grid gap-4 lg:grid-cols-2">
                                    <Field>
                                        <FieldLabel htmlFor="email">
                                            Email <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Skeleton className="h-10 w-full" />
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="tier">
                                            Tier <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Skeleton className="h-10 w-full" />
                                    </Field>
                                </div>

                                <Field>
                                    <FieldLabel htmlFor="status">
                                        Status <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Skeleton className="h-10 w-full" />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="notes">Catatan</FieldLabel>
                                    <Skeleton className="h-24 w-full" />
                                </Field>
                            </div>

                            <DrawerFooter className="mt-auto px-0">
                                <Button type="button" ref={loadingFocusRef}>
                                    Simpan Perubahan
                                </Button>
                                <DrawerClose asChild>
                                    <Button variant="outline" type="button">
                                        Batal
                                    </Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-4">
                            {/* Content */}
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
                                            placeholder="Contoh: 6281234567890"
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
                                            placeholder="Contoh: nama@email.com"
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
                                                    <SelectItem value="bronze">Bronze</SelectItem>
                                                    <SelectItem value="silver">Silver</SelectItem>
                                                    <SelectItem value="gold">Gold</SelectItem>
                                                    <SelectItem value="platinum">Platinum</SelectItem>
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

                            {/* Footer */}
                            <DrawerFooter className="mt-auto px-0">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Simpan Perubahan
                                </Button>
                                <DrawerClose asChild>
                                    <Button variant="outline" type="button">
                                        Batal
                                    </Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </form>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
}
