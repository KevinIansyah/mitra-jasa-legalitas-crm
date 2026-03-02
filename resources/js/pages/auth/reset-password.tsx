import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
};

export default function ResetPassword({ token, email }: Props) {
    return (
        <AuthLayout title="Reset Kata Sandi" description="Silakan masukkan kata sandi baru Anda">
            <Head title="Reset Kata Sandi" />

            <Form {...update.form()} transform={(data) => ({ ...data, token, email })} resetOnSuccess={['password', 'password_confirmation']}>
                {({ processing, errors }) => (
                    <div className="grid gap-6">
                        <Field>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Input id="email" type="email" name="email" autoComplete="email" value={email} readOnly />
                            <InputError message={errors.email} />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="password">Kata Sandi Baru</FieldLabel>
                            <Input id="password" type="password" name="password" autoComplete="new-password" autoFocus placeholder="Masukkan kata sandi baru" />
                            <InputError message={errors.password} />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="password_confirmation">Konfirmasi Kata Sandi</FieldLabel>
                            <Input id="password_confirmation" type="password" name="password_confirmation" autoComplete="new-password" placeholder="Ulangi kata sandi" />
                            <InputError message={errors.password_confirmation} />
                        </Field>

                        <Button type="submit" className="mt-4 w-full" disabled={processing} data-test="reset-password-button">
                            {processing && <Spinner />}
                            Reset Kata Sandi
                        </Button>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
}
