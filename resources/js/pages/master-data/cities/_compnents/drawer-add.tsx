import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

import citiesRoute from '@/routes/master-data/cities';
import type { CityFormData } from '@/types/cities';

export function DrawerAdd() {
    const [open, setOpen] = React.useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<CityFormData>({
        name: '',
        slug: '',
        province: '',
        description: '',
        status: 'active',
        sort_order: 0,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Kota sedang ditambahkan.',
        });

        post(citiesRoute.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Kota berhasil ditambahkan.',
                });

                reset();
                setOpen(false);
            },
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat menambahkan kota, coba lagi.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => {
                toast.dismiss(id);
            },
        });
    };

    return (
        <Drawer direction="bottom" open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button className="flex-1 gap-1.5 md:w-30">
                    <Plus />
                    Tambah
                </Button>
            </DrawerTrigger>

            <DrawerContent className="flex h-screen flex-col">
                <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 overflow-y-auto">
                    <DrawerHeader className="px-4">
                        <DrawerTitle>Tambah Kota Baru</DrawerTitle>
                        <DrawerDescription>Isi formulir di bawah untuk menambahkan data kota ke sistem</DrawerDescription>
                    </DrawerHeader>

                    <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-4">
                        <div className="grid gap-4">
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="name">
                                        Nama Kota <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="name"
                                        type="text"
                                        name="name"
                                        required
                                        autoFocus
                                        placeholder="Contoh: Jakarta Selatan"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    {errors.name && <FieldError>{errors.name}</FieldError>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="slug">Slug</FieldLabel>
                                    <Input
                                        id="slug"
                                        type="text"
                                        name="slug"
                                        placeholder="jakarta-selatan (opsional, otomatis dari nama)"
                                        value={data.slug ?? ''}
                                        onChange={(e) => setData('slug', e.target.value)}
                                    />
                                    {errors.slug && <FieldError>{errors.slug}</FieldError>}
                                </Field>
                            </div>

                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="province">Provinsi</FieldLabel>
                                    <Input
                                        id="province"
                                        type="text"
                                        name="province"
                                        placeholder="Contoh: DKI Jakarta"
                                        value={data.province ?? ''}
                                        onChange={(e) => setData('province', e.target.value)}
                                    />
                                    {errors.province && <FieldError>{errors.province}</FieldError>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="status">
                                        Status <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Select required value={data.status} onValueChange={(value) => setData('status', value as 'active' | 'inactive')}>
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Pilih status..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Status</SelectLabel>
                                                <SelectItem value="active">Aktif</SelectItem>
                                                <SelectItem value="inactive">Tidak Aktif</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <FieldError>{errors.status}</FieldError>}
                                </Field>
                            </div>

                            <Field>
                                <FieldLabel htmlFor="sort_order">Urutan</FieldLabel>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    name="sort_order"
                                    placeholder="0"
                                    min={0}
                                    value={data.sort_order ?? 0}
                                    onChange={(e) => setData('sort_order', Number(e.target.value))}
                                />
                                {errors.sort_order && <FieldError>{errors.sort_order}</FieldError>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="description">Deskripsi</FieldLabel>
                                <Textarea
                                    id="description"
                                    className="min-h-24"
                                    placeholder="Tambahkan deskripsi kota jika diperlukan"
                                    value={data.description ?? ''}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                {errors.description && <FieldError>{errors.description}</FieldError>}
                            </Field>
                        </div>

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
