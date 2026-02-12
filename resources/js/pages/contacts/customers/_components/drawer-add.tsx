import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import customers from '@/routes/contacts/customers';
import type { CustomerFormData } from '@/types/contact';

export function DrawerAdd() {
    const [open, setOpen] = React.useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<CustomerFormData>({
        name: '',
        phone: '',
        email: '',
        tier: 'bronze',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(customers.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setOpen(false);
            },
            onError: (error) => {
                console.error(error);
            },
        });
    };

    return (
        <Drawer direction="bottom" open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button className="flex-1 md:w-30">
                    Tambah
                    <Plus />
                </Button>
            </DrawerTrigger>

            <DrawerContent className="flex h-screen flex-col">
                <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-y-auto">
                    <DrawerHeader className="px-4">
                        <DrawerTitle>Tambah Pelanggan Baru (PIC)</DrawerTitle>
                        <DrawerDescription>Isi formulir di bawah untuk menambahkan data pelanggan ke sistem</DrawerDescription>
                    </DrawerHeader>

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
                                <Button variant="outline" type="button">
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
