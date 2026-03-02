// Components
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <AuthLayout title="Lupa Kata Sandi" description="Masukkan email Anda untuk menerima tautan reset kata sandi">
            <Head title="Lupa Kata Sandi" />

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}

            <div className="space-y-6">
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <>
                            <Field>
                                <FieldLabel htmlFor="email">Alamat Email</FieldLabel>
                                <Input id="email" type="email" name="email" autoComplete="off" autoFocus placeholder="email@contoh.com" />

                                <InputError message={errors.email} />
                            </Field>

                            <div className="my-6 flex items-center justify-start">
                                <Button className="w-full" disabled={processing} data-test="email-password-reset-link-button">
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Kirim Tautan Reset Kata Sandi
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="space-x-1 text-center text-sm text-muted-foreground">
                    <span>Atau, kembali ke</span>
                    <TextLink href={login()}>Masuk</TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}
