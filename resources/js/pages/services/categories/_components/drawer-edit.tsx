import { useForm } from '@inertiajs/react';
import { Info } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
        palette_color: category.palette_color || '',
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

                            {/* Palette Color */}
                            <Field>
                                <FieldLabel htmlFor="palette_color">Palette Color</FieldLabel>
                                <Alert className="border-primary bg-primary/20">
                                    <Info />
                                    <AlertTitle>Panduan Warna Kategori (palette_color)</AlertTitle>
                                    <AlertDescription>
                                        <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-foreground/70">
                                            <li>
                                                <strong>Pilihan Warna:</strong> Gunakan nilai <code>Oklch</code> untuk palette_color.
                                            </li>
                                            <li>
                                                <strong>Referensi:</strong> Bisa dilihat di{' '}
                                                <a href="https://tailwindcss.com/docs/colors" target="_blank" className="text-primary underline">
                                                    Tailwind CSS Colors
                                                </a>{' '}
                                                untuk contoh nilai Oklch.
                                            </li>
                                            <li>
                                                <strong>Tips:</strong> Pilih warna yang harmonis antar kategori untuk konsistensi UI.
                                            </li>
                                        </ul>
                                    </AlertDescription>
                                </Alert>

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
