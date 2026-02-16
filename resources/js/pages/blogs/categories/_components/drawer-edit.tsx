import { useForm } from '@inertiajs/react';
import axios from 'axios';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import categories from '@/routes/services/categories';
import type { ServiceCategoryFormData } from '@/types/service';

type DrawerEditProps = {
    categoryId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function DrawerEdit({ categoryId, open, onOpenChange }: DrawerEditProps) {
    const [loading, setLoading] = React.useState(false);
    const loadingFocusRef = React.useRef<HTMLButtonElement>(null);

    const { data, setData, put, processing, errors } = useForm<ServiceCategoryFormData>({
        name: '',
    });

    React.useEffect(() => {
        if (open && categoryId) {
            setLoading(true);

            axios
                .get(categories.edit(categoryId).url)
                .then((response) => {
                    const category = response.data.category;

                    setData({
                        name: category.name || '',
                    });
                })
                .catch(() => {
                    toast.error('Gagal', {
                        description: 'Terjadi kesalahan saat mengambil data kategori layanan',
                    });
                    
                    onOpenChange(false);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [open, categoryId, setData, onOpenChange]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Kategori layanan sedang diperbarui.',
        });

        put(categories.update(categoryId).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Kategori layanan berhasil diperbarui.',
                })

                onOpenChange(false);
            },
            onError: () => {
                toast.error('Gagal', {
                    description: 'Kategori layanan gagal diperbarui. Silakan periksa kembali data kategori layanan yang diisi.',
                });
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
                <div className="mx-auto flex w-full max-w-lg flex-1 flex-col overflow-y-auto">
                    <DrawerHeader className="px-4">
                        <DrawerTitle>Edit Kategori Layanan</DrawerTitle>
                        <DrawerDescription>Perbarui data kategori layanan yang sudah ada melalui formulir di bawah ini.</DrawerDescription>
                    </DrawerHeader>

                    {loading ? (
                        <div className="flex flex-1 flex-col px-4">
                            <div>
                                <Field>
                                    <FieldLabel htmlFor="name">Nama</FieldLabel>
                                    <Skeleton className="h-10 w-full" />
                                    {errors.name && <FieldError>{errors.name}</FieldError>}
                                </Field>
                            </div>

                            <DrawerFooter className="mt-auto px-0">
                                <Button type="button" ref={loadingFocusRef}>
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
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-4">
                            <div>
                                <Field>
                                    <FieldLabel htmlFor="name">Label</FieldLabel>
                                    <Input
                                        id="name"
                                        type="text"
                                        name="name"
                                        required
                                        autoFocus
                                        placeholder="Masukkan nama kategori layanan, contoh: Perizinan"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        disabled={processing || loading}
                                    />

                                    {errors.name && <FieldError>{errors.name}</FieldError>}
                                </Field>
                            </div>

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
