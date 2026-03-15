import { router } from '@inertiajs/react';
import axios from 'axios';
import { Info, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';

import contacts from '@/routes/contacts';
import type { Customer } from '@/types/contacts';

type Props = {
    customer: Customer;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type Step = 'check' | 'confirm_link' | 'create' | 'credentials' | 'revoke';
type ExistingUser = { id: number; name: string; email: string };
type Credentials = { email: string; password: string };

export function DialogManageAccount({ customer, open, onOpenChange }: Props) {
    const hasAccount = !!customer.user_id;
    const [step, setStep] = useState<Step>(hasAccount ? 'revoke' : 'check');
    const [existingUser, setExistingUser] = useState<ExistingUser | null>(null);
    const [credentials, setCredentials] = useState<Credentials | null>(null);
    const [loading, setLoading] = useState(false);

    function handleClose(open: boolean) {
        if (!open) {
            if (step === 'credentials') {
                router.reload({ only: ['customers'] });
            }
            setStep(hasAccount ? 'revoke' : 'check');
            setExistingUser(null);
            setCredentials(null);
        }
        onOpenChange(open);
    }

    // ============================================================
    // CHECK EMAIL
    // ============================================================
    async function handleCheck() {
        setLoading(true);
        const toastId = toast.loading('Memeriksa...', { description: 'Sedang mencari akun.' });

        try {
            const res = await axios.post(contacts.customers.checkAccount(customer.id).url);
            const { status, message, user } = res.data;

            if (status === 'exists') {
                setExistingUser(user);
                setStep('confirm_link');
                toast.success('Akun ditemukan', { description: `Email ${customer.email} sudah terdaftar.` });
            } else if (status === 'not_found') {
                setStep('create');
            } else {
                toast.error('Gagal', { description: message });
            }
        } catch (errors) {
            let msg = 'Terjadi kesalahan saat memeriksa email, coba lagi.';

            if (axios.isAxiosError(errors)) {
                msg = errors.response?.data?.message || (Object.values(errors.response?.data?.errors || {})[0] as string) || msg;
            }

            toast.error('Gagal', { description: msg });
        } finally {
            setLoading(false);
            toast.dismiss(toastId);
        }
    }

    // ============================================================
    // LINK EXISTING USER
    // ============================================================
    async function handleLink() {
        if (!existingUser) return;
        setLoading(true);
        const toastId = toast.loading('Memproses...', { description: 'Akun sedang dihubungkan.' });

        try {
            await axios.post(contacts.customers.linkAccount(customer.id).url, { user_id: existingUser.id });
            toast.success('Berhasil', { description: 'Akun berhasil dihubungkan.' });
            router.reload({ only: ['customers'] });
            onOpenChange(false);
        } catch (errors) {
            let msg = 'Terjadi kesalahan saat menghubungkan akun, coba lagi.';

            if (axios.isAxiosError(errors)) {
                msg = errors.response?.data?.message || (Object.values(errors.response?.data?.errors || {})[0] as string) || msg;
            }

            toast.error('Gagal', { description: msg });
        } finally {
            setLoading(false);
            toast.dismiss(toastId);
        }
    }

    // ============================================================
    // CREATE ACCOUNT
    // ============================================================
    async function handleCreate() {
        setLoading(true);
        const toastId = toast.loading('Memproses...', { description: 'Akun sedang dibuat.' });

        try {
            const res = await axios.post(contacts.customers.createAccount(customer.id).url);
            setCredentials({ email: res.data.email, password: res.data.password });
            setStep('credentials');
            toast.success('Berhasil', { description: 'Akun berhasil dibuat.' });
        } catch (errors) {
            let msg = 'Terjadi kesalahan saat membuat akun, coba lagi.';

            if (axios.isAxiosError(errors)) {
                msg = errors.response?.data?.message || (Object.values(errors.response?.data?.errors || {})[0] as string) || msg;
            }

            toast.error('Gagal', { description: msg });
        } finally {
            setLoading(false);
            toast.dismiss(toastId);
        }
    }

    // ============================================================
    // REVOKE ACCOUNT
    // ============================================================
    async function handleRevoke() {
        setLoading(true);
        const toastId = toast.loading('Memproses...', { description: 'Akun sedang dicabut.' });

        try {
            await axios.post(contacts.customers.revokeAccount(customer.id).url);
            toast.success('Berhasil', { description: 'Akun berhasil dicabut.' });
            router.reload({ only: ['customers'] });
            onOpenChange(false);
        } catch (errors) {
            let msg = 'Terjadi kesalahan saat mencabut akun, coba lagi.';

            if (axios.isAxiosError(errors)) {
                msg = errors.response?.data?.message || (Object.values(errors.response?.data?.errors || {})[0] as string) || msg;
            }

            toast.error('Gagal', { description: msg });
        } finally {
            setLoading(false);
            toast.dismiss(toastId);
        }
    }

    // ============================================================
    // COPY & WA
    // ============================================================
    function handleCopy() {
        if (!credentials) return;

        navigator.clipboard.writeText(`Email: ${credentials.email}\nPassword: ${credentials.password}`);

        toast.success('Disalin!', { description: 'Kredensial berhasil disalin ke clipboard.' });
    }

    function handleSendWA() {
        if (!credentials || !customer.phone) return;

        const phone = customer.phone.replace(/^0/, '62').replace(/\D/g, '');

        const text = encodeURIComponent(
            `Halo ${customer.name},

Akun portal Anda telah dibuat. Berikut informasi login:

Email: ${credentials.email}
Password: ${credentials.password}

Segera login dan ganti password Anda.`,
        );

        window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener,noreferrer');
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                {/* ───────────────── Revoke Account Section ───────────────── */}
                {step === 'revoke' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Kelola Akun</DialogTitle>
                            <DialogDescription>
                                Customer <span className="font-medium text-foreground">{customer.name}</span> sudah memiliki akun portal.
                            </DialogDescription>
                        </DialogHeader>

                        <Alert className="border-primary bg-primary/20">
                            <Info />
                            <AlertTitle>Informasi</AlertTitle>
                            <AlertDescription>
                                Mencabut akun akan menonaktifkan akses customer ke portal. Data tidak akan dihapus dan akun bisa dihubungkan kembali kapan saja.
                            </AlertDescription>
                        </Alert>

                        <DialogFooter>
                            <Button variant="secondary" onClick={() => onOpenChange(false)}>
                                Batal
                            </Button>
                            <Button variant="destructive" disabled={loading} onClick={handleRevoke}>
                                {loading ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Memproses...
                                    </>
                                ) : (
                                    'Cabut Akun'
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {/* ───────────────── Check Email Section ───────────────── */}
                {step === 'check' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Buatkan Akun Portal</DialogTitle>
                            <DialogDescription>
                                Sistem akan memeriksa apakah email <span className="font-medium text-foreground">{customer.email ?? '(tidak ada email)'}</span> sudah terdaftar.
                            </DialogDescription>
                        </DialogHeader>
                        {!customer.email && (
                            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                                Customer ini belum memiliki email. Tambahkan email terlebih dahulu sebelum membuat akun.
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => onOpenChange(false)}>
                                Batal
                            </Button>
                            <Button disabled={!customer.email || loading} onClick={handleCheck}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Memeriksa...
                                    </>
                                ) : (
                                    'Periksa Email'
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {/* ───────────────── Confirm Link Section ───────────────── */}
                {step === 'confirm_link' && existingUser && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Email Sudah Terdaftar</DialogTitle>
                            <DialogDescription>Ditemukan akun dengan email ini. Apakah ingin menghubungkan akun tersebut ke customer ini?</DialogDescription>
                        </DialogHeader>
                        <div className="rounded-lg bg-primary/10 p-4 text-sm dark:bg-muted/40">
                            <p className="font-medium">{existingUser.name}</p>
                            <p className="text-muted-foreground">{existingUser.email}</p>
                        </div>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => onOpenChange(false)}>
                                Batal
                            </Button>
                            <Button disabled={loading} onClick={handleLink}>
                                {loading ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Memproses...
                                    </>
                                ) : (
                                    'Ya, Hubungkan'
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {/* ───────────────── Create Account Section ───────────────── */}
                {step === 'create' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Buat Akun Baru</DialogTitle>
                            <DialogDescription>
                                Email <span className="font-medium text-foreground">{customer.email}</span> belum terdaftar. Sistem akan membuat akun baru dengan password yang
                                di-generate otomatis.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => onOpenChange(false)}>
                                Batal
                            </Button>
                            <Button disabled={loading} onClick={handleCreate}>
                                {loading ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Membuat Akun...
                                    </>
                                ) : (
                                    'Buat Akun'
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {/* ───────────────── Credentials Section ───────────────── */}
                {step === 'credentials' && credentials && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Akun Berhasil Dibuat</DialogTitle>
                            <DialogDescription>Bagikan kredensial ini kepada customer. Sarankan untuk segera mengganti password setelah login pertama.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2 rounded-lg bg-primary/10 p-4 text-sm dark:bg-muted/40">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground">Email</span>
                                <span className="font-medium">{credentials.email}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground">Password</span>
                                <span className="font-medium tracking-widest">{credentials.password}</span>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="secondary" className="flex-1" onClick={handleCopy}>
                                Salin
                            </Button>
                            {customer.phone && (
                                <Button className="flex-1 bg-green-600 text-white hover:bg-green-700" onClick={handleSendWA}>
                                    Kirim via WA
                                </Button>
                            )}
                            <Button className="flex-1" onClick={() => onOpenChange(false)}>
                                Selesai
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
