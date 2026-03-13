import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';

import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import SettingsProfileLayout from '@/layouts/settings/profile-layout';

import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem, SharedData } from '@/types';
import { ImageUpload } from './_components/shared';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengaturan Profil',
        href: edit().url,
    },
];

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, post, processing, errors } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        avatar: null as File | null,
        remove_avatar: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Profil sedang diperbarui.',
        });

        post(edit().url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Profil berhasil diperbarui.',
                });
            },
            onError: (errs) => {
                const msg = Object.values(errs)[0] ?? 'Terjadi kesalahan, coba lagi.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => {
                toast.dismiss(id);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Profil" />

            <h1 className="sr-only">Pengaturan Profil</h1>

            <SettingsProfileLayout>
                <div className="space-y-6">
                    <Heading variant="small" title="Informasi Profil" description="Perbarui nama, email, dan avatar Anda" />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <ImageUpload
                            label="Avatar"
                            name="avatar"
                            currentUrl={auth.user.avatar ?? null}
                            hint="Rekomendasi: foto persegi, maks. 5 MB"
                            onChange={(file) => {
                                setData('avatar', file);
                                setData('remove_avatar', false);
                            }}
                            onRemove={() => {
                                setData('avatar', null);
                                setData('remove_avatar', true);
                            }}
                            errorForm={errors.avatar}
                        />

                        <Field>
                            <FieldLabel htmlFor="name">Nama</FieldLabel>
                            <Input
                                id="name"
                                name="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Nama lengkap"
                            />
                            {errors.name && <FieldError>{errors.name}</FieldError>}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="email">Alamat Email</FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Alamat Email"
                            />
                            {errors.email && <FieldError>{errors.email}</FieldError>}
                        </Field>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="-mt-4 text-sm text-muted-foreground">
                                    Alamat email Anda belum terverifikasi.{' '}
                                    <Link
                                        href={send()}
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Klik di sini untuk mengirim ulang email verifikasi.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">Sebuah tautan verifikasi baru telah dikirim ke alamat email Anda.</div>
                                )}
                            </div>
                        )}

                        <Button disabled={processing} className="w-full md:w-40" data-test="update-profile-button">
                            {processing ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan'
                            )}
                        </Button>
                    </form>
                </div>

                <DeleteUser />
            </SettingsProfileLayout>
        </AppLayout>
    );
}
