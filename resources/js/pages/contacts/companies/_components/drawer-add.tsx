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
import { categoryBusinessOptions, statusLegalOptions } from '@/constans';
import companies from '@/routes/contacts/companies';
import type { CompanyFormData } from '@/types/contact';

export function DrawerAdd() {
    const [open, setOpen] = React.useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<CompanyFormData>({
        name: '',
        phone: '',
        email: '',
        website: '',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        npwp: '',
        status_legal: '',
        category_business: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Perusahaan sedang ditambahkan.',
        });

        post(companies.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Perusahaan berhasil ditambahkan.',
                });

                reset();
                setOpen(false);
            },
            onError: () => {
                toast.error('Gagal', {
                    description: 'Perusahaan gagal ditambahkan. Silakan periksa kembali data perusahaan yang diisi.',
                });
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
                <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-y-auto">
                    <DrawerHeader className="px-4">
                        <DrawerTitle>Tambah Perusahaan Baru</DrawerTitle>
                        <DrawerDescription>Isi formulir di bawah untuk menambahkan data perusahaan ke sistem</DrawerDescription>
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
                                    <FieldLabel htmlFor="phone">No Telepon / Whatsapp</FieldLabel>
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
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
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
                                    <FieldLabel htmlFor="website">Website</FieldLabel>
                                    <Input
                                        id="website"
                                        type="url"
                                        name="website"
                                        placeholder="Contoh: https://example.com"
                                        value={data.website}
                                        onChange={(e) => setData('website', e.target.value)}
                                    />
                                    {errors.website && <FieldError>{errors.website}</FieldError>}
                                </Field>
                            </div>

                            <Field>
                                <FieldLabel htmlFor="address">
                                    Alamat <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Textarea
                                    id="address"
                                    className="min-h-24"
                                    placeholder="Masukkan alamat lengkap"
                                    required
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                />
                                {errors.address && <FieldError>{errors.address}</FieldError>}
                            </Field>

                            <div className="gird-cols-1 grid gap-4 lg:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="province">Provinsi</FieldLabel>
                                    <Input
                                        id="province"
                                        type="text"
                                        name="province"
                                        placeholder="Contoh: Jawa Timur"
                                        value={data.province}
                                        onChange={(e) => setData('province', e.target.value)}
                                    />
                                    {errors.province && <FieldError>{errors.province}</FieldError>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="city">Kabupaten / Kota</FieldLabel>
                                    <Input id="city" type="text" name="city" placeholder="Contoh: Surabaya" value={data.city} onChange={(e) => setData('city', e.target.value)} />
                                    {errors.city && <FieldError>{errors.city}</FieldError>}
                                </Field>
                            </div>

                            <div className="gird-cols-1 grid gap-4 lg:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="status_legal">
                                        Status Legal <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Select required value={data.status_legal} onValueChange={(value) => setData('status_legal', value)}>
                                        <SelectTrigger id="status_legal">
                                            <SelectValue placeholder="Pilih status legal" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Status Legal</SelectLabel>
                                                {statusLegalOptions.map((item) => (
                                                    <SelectItem key={item.value} value={item.value}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {errors.status_legal && <FieldError>{errors.status_legal}</FieldError>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="category_business">
                                        Kategori Bisnis <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Select required value={data.category_business} onValueChange={(value) => setData('category_business', value)}>
                                        <SelectTrigger id="category_business">
                                            <SelectValue placeholder="Pilih kategori bisnis" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Kategori Bisnis</SelectLabel>
                                                {categoryBusinessOptions.map((item) => (
                                                    <SelectItem key={item.value} value={item.value}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {errors.category_business && <FieldError>{errors.category_business}</FieldError>}
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
