import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <AuthLayout title="Masuk ke akun Anda" description="Masukkan email dan kata sandi Anda untuk melanjutkan">
            <Head title="Masuk" />

            <Form {...store.form()} resetOnSuccess={['password']} className="flex flex-col gap-6">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <Field>
                                <FieldLabel htmlFor="email">Alamat Email</FieldLabel>
                                <Input id="email" type="email" name="email" required autoFocus tabIndex={1} autoComplete="email" placeholder="email@contoh.com" />
                                <InputError message={errors.email} />
                            </Field>

                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">Kata Sandi</FieldLabel>
                                    {canResetPassword && (
                                        <TextLink href={request()} className="ml-auto text-sm" tabIndex={5}>
                                            Lupa kata sandi?
                                        </TextLink>
                                    )}
                                </div>
                                <Input id="password" type="password" name="password" required tabIndex={2} autoComplete="current-password" placeholder="Masukkan kata sandi" />
                                <InputError message={errors.password} />
                            </Field>

                            <div className="flex items-center space-x-3">
                                <Checkbox id="remember" name="remember" tabIndex={3} />
                                <Label htmlFor="remember">Ingat saya</Label>
                            </div>

                            <Button type="submit" className="w-full" tabIndex={4} disabled={processing} data-test="login-button">
                                {processing && <Spinner className="mr-2" />}
                                {processing ? 'Sedang masuk...' : 'Masuk'}
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
