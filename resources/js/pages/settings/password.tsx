import { Head, useForm } from '@inertiajs/react';
import { useRef } from 'react';

import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import SettingsProfileLayout from '@/layouts/settings/profile-layout';

import { edit } from '@/routes/user-password';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: edit().url,
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(edit().url, {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errs) => {
                if (errs.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errs.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Password" />

            <h1 className="sr-only">Pengaturan Password</h1>

            <SettingsProfileLayout>
                <div className="space-y-6">
                    <Heading variant="small" title="Update Password" description="Pastikan akun Anda menggunakan password yang panjang dan acak untuk tetap aman" />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Field>
                            <Label htmlFor="current_password">Password Saat Ini</Label>
                            <Input
                                id="current_password"
                                ref={currentPasswordInput}
                                type="password"
                                className="mt-1 block w-full"
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                autoComplete="current-password"
                                placeholder="Password Saat Ini"
                            />
                            <InputError message={errors.current_password} />
                        </Field>

                        <Field>
                            <Label htmlFor="password">Password Baru</Label>
                            <Input
                                id="password"
                                ref={passwordInput}
                                type="password"
                                className="mt-1 block w-full"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                autoComplete="new-password"
                                placeholder="Password Baru"
                            />
                            <InputError message={errors.password} />
                        </Field>

                        <Field>
                            <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                className="mt-1 block w-full"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                autoComplete="new-password"
                                placeholder="Konfirmasi Password"
                            />
                            <InputError message={errors.password_confirmation} />
                        </Field>

                        <Button disabled={processing} className="w-full md:w-40" data-test="update-password-button">
                            {processing ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Password'
                            )}
                        </Button>
                    </form>
                </div>
            </SettingsProfileLayout>
        </AppLayout>
    );
}
