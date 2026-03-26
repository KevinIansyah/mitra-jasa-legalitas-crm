import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import categories from '@/routes/services/categories';
import type { ServiceCategoryFormData } from '@/types/services';

export function DrawerAdd() {
    const [open, setOpen] = React.useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<ServiceCategoryFormData>({
        name: '',
        palette_color: '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Kategori layanan sedang ditambahkan.',
        });

        post(categories.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Kategori layanan berhasil ditambahkan.',
                });

                reset();
                setOpen(false);
            },
            onError: () => {
                toast.error('Gagal', {
                    description: 'Kategori layanan gagal ditambahkan. Silakan periksa kembali data kategori layanan yang diisi.',
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
                <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 overflow-y-auto px-4">
                    <DrawerHeader className="px-4">
                        <DrawerTitle>Tambah Kategori Layanan Baru</DrawerTitle>
                        <DrawerDescription>Isi formulir di bawah untuk menambahkan kategori layanan baru ke sistem</DrawerDescription>
                    </DrawerHeader>

                    <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-4">
                        {/* Content */}
                        <div className="space-y-4">
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
                                    placeholder="Masukkan nama kategori layanan, contoh: Perizinan"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />

                                {errors.name && <FieldError>{errors.name}</FieldError>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="palette_color">Palette Color</FieldLabel>
                                <Input
                                    id="palette_color"
                                    type="text"
                                    name="palette_color"
                                    placeholder="Masukkan palette color kategori layanan"
                                    value={data.palette_color}
                                    onChange={(e) => setData('palette_color', e.target.value)}
                                />
                                {errors.palette_color && <FieldError>{errors.palette_color}</FieldError>}
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
