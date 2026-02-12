import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import categories from '@/routes/services/categories';
import type { ServiceCategoryFormData } from '@/types/service';

export function DrawerAdd() {
    const [open, setOpen] = React.useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<ServiceCategoryFormData>({
        name: '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(categories.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setOpen(false);
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
                <div className="mx-auto flex w-full max-w-lg flex-1 flex-col overflow-y-auto px-4">
                    <DrawerHeader className="px-4">
                        <DrawerTitle>Tambah Kategori Layanan Baru</DrawerTitle>
                        <DrawerDescription>Isi formulir di bawah untuk menambahkan kategori layanan baru ke sistem</DrawerDescription>
                    </DrawerHeader>

                    <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-4">
                        {/* Content */}
                        <div>
                            <Field>
                                <FieldLabel htmlFor="name">Nama</FieldLabel>
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
