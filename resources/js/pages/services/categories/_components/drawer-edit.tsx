import { useForm } from '@inertiajs/react';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';

import categories from '@/routes/services/categories';
import type { ServiceCategory, ServiceCategoryFormData } from '@/types/services';

type DrawerEditProps = {
    category: ServiceCategory;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function DrawerEdit({ category, open, onOpenChange }: DrawerEditProps) {
    const loadingFocusRef = React.useRef<HTMLButtonElement>(null);

    const { data, setData, patch, processing, errors } = useForm<ServiceCategoryFormData>({
        name: category.name || '',
        status: category.status || 'active',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Kategori layanan sedang diperbarui.',
        });

        patch(categories.update(category.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Kategori layanan berhasil diperbarui.',
                });

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
                <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 overflow-y-auto">
                    <DrawerHeader className="px-4">
                        <DrawerTitle>Edit Kategori Layanan</DrawerTitle>
                        <DrawerDescription>Perbarui data kategori layanan yang sudah ada melalui formulir di bawah ini.</DrawerDescription>
                    </DrawerHeader>

                    <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-4">
                        <div className="space-y-4">
                            <Field>
                                <FieldLabel htmlFor="name">
                                    Label <span className="text-destructive">*</span>
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
                                    disabled={processing}
                                />

                                {errors.name && <FieldError>{errors.name}</FieldError>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="status">Status</FieldLabel>
                                <Select value={data.status} onValueChange={(value) => setData('status', value as 'active' | 'inactive')} disabled={processing}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Pilih status..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && <FieldError>{errors.status}</FieldError>}
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
