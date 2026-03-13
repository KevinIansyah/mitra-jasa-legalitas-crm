import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import finances from '@/routes/finances';
import type { VendorFormData } from '@/types/vendors';
import { VendorForm } from '../../_components/vendor-form';

type VendorFormErrors = Partial<Record<string, string>>;

const EMPTY_FORM: VendorFormData = {
    name: '',
    category: '',
    phone: '',
    email: '',
    address: '',
    npwp: '',
    notes: '',
    status: 'active',
    bank_accounts: [],
};

export default function CreateSection() {
    const [data, setData] = useState<VendorFormData>(EMPTY_FORM);
    const [errors, setErrors] = useState<VendorFormErrors>({});
    const [processing, setProcessing] = useState(false);

    function handleChange(val: Partial<VendorFormData>) {
        setData((prev) => ({ ...prev, ...val }));
    }

    function handleSubmit() {
        setProcessing(true);
        const toastId = toast.loading('Menyimpan...', { description: 'Vendor sedang ditambahkan.' });

        router.post(finances.vendors.store().url, data as never, {
            onSuccess: () => toast.success('Berhasil', { description: 'Vendor berhasil ditambahkan.' }),
            onError: (errs) => {
                setErrors(errs as VendorFormErrors);
                const msg = Object.values(errs)[0] ?? 'Terjadi kesalahan, coba lagi.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => {
                setProcessing(false);
                toast.dismiss(toastId);
            },
        });
    }

    function handleCancel() {
        router.visit(finances.vendors.index().url);
    }

    return (
        <div className="space-y-4">
            <VendorForm data={data} errors={errors} onChange={handleChange} />

            <div className="flex items-center justify-start gap-2">
                <Button type="submit" className="flex-1 md:w-45 md:flex-none" onClick={handleSubmit} disabled={processing}>
                    {processing ? (
                        <>
                            <Spinner className="mr-2" />
                            Menyimpan...
                        </>
                    ) : (
                        'Simpan'
                    )}
                </Button>
                <Button type="button" variant="secondary" className="flex-1 md:w-45 md:flex-none" onClick={handleCancel} disabled={processing}>
                    Batal
                </Button>
            </div>
        </div>
    );
}
