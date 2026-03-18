import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import finances from '@/routes/finances';
import type { ProposalFormData } from '@/types/proposals';
import { ProposalForm } from '../../_components/proposal-form';
import type { ProposalFormErrors } from '../../_components/proposal-form';
import { ProposalSummary } from '../../_components/proposal-summary';

const EMPTY_FORM: ProposalFormData = {
    customer_id: null,
    proposal_date: '',
    valid_until: '',
    tax_percent: 11,
    discount_percent: 0,
    notes: '',
    items: [{ description: '', quantity: 1, unit_price: 0, tax_percent: 11, discount_percent: 0 }],
};

export default function CreateSection() {
    const [data, setData] = useState<ProposalFormData>(EMPTY_FORM);
    const [errors, setErrors] = useState<ProposalFormErrors>({});
    const [processing, setProcessing] = useState(false);

    function handleChange(val: Partial<ProposalFormData>) {
        setData((prev) => ({ ...prev, ...val }));
    }

    function handleSubmit() {
        setProcessing(true);
        const toastId = toast.loading('Menyimpan...', { description: 'Proposal sedang ditambahkan.' });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        router.post(finances.proposals.store().url, data as any, {
            onSuccess: () => toast.success('Berhasil', { description: 'Proposal berhasil ditambahkan.' }),
            onError: (errors) => {
                setErrors(errors as ProposalFormErrors);
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan, coba lagi.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => {
                setProcessing(false);
                toast.dismiss(toastId);
            },
        });
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
                <ProposalForm data={data} errors={errors} onChange={handleChange} />
                <ProposalSummary items={data.items} processing={processing} onSubmit={handleSubmit} />
            </div>
        </div>
    );
}
