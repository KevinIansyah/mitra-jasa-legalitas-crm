import { useForm } from '@inertiajs/react';
import axios from 'axios';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import roles from '@/routes/roles';
import type { RoleFormData } from '@/types/role';

type DrawerEditProps = {
    roleId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function DrawerEdit({ roleId, open, onOpenChange }: DrawerEditProps) {
    const [loading, setLoading] = React.useState(false);
    const loadingFocusRef = React.useRef<HTMLButtonElement>(null);

    const { data, setData, put, processing, errors } = useForm<RoleFormData>({
        name: '',
    });

    React.useEffect(() => {
        if (open && roleId) {
            setLoading(true);

            axios
                .get(roles.edit(roleId).url)
                .then((response) => {
                    const role = response.data.role;
                    setData({
                        name: role.name || '',
                    });
                })
                .catch(() => {
                    toast.error('Gagal', {
                        description: 'Terjadi kesalahan saat mengambil data role',
                    });
                    onOpenChange(false);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [open, roleId, setData, onOpenChange]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(roles.update(roleId).url, {
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
                <div className="mx-auto flex w-full max-w-lg flex-1 flex-col overflow-y-auto">
                    <DrawerHeader className="px-4">
                        <DrawerTitle>Edit Role</DrawerTitle>
                        <DrawerDescription>Perbarui data role yang sudah ada melalui formulir di bawah ini.</DrawerDescription>
                    </DrawerHeader>

                    {loading ? (
                        <div className="flex flex-1 flex-col px-4">
                            <div>
                                <Field>
                                    <FieldLabel htmlFor="name">Nama</FieldLabel>
                                    <Skeleton className="h-10 w-full" />
                                    <FieldDescription>
                                        Gunakan huruf kecil. Jika nama terdiri dari lebih dari satu kata, pisahkan dengan tanda strip (<code>-</code>).
                                    </FieldDescription>
                                    {errors.name && <FieldError>{errors.name}</FieldError>}
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
                            <div>
                                <Field>
                                    <FieldLabel htmlFor="name">Label</FieldLabel>
                                    <Input
                                        id="name"
                                        type="text"
                                        name="name"
                                        required
                                        autoFocus
                                        placeholder="Masukkan nama role"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        disabled={processing || loading}
                                    />
                                    <FieldDescription>
                                        Gunakan huruf kecil. Jika nama terdiri dari lebih dari satu kata, pisahkan dengan tanda strip (<code>-</code>).
                                    </FieldDescription>
                                    {errors.name && <FieldError>{errors.name}</FieldError>}
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
