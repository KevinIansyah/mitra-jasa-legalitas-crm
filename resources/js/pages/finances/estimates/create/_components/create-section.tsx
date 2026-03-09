/* eslint-disable @typescript-eslint/no-explicit-any */
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { EstimateFormData, Quote } from '@/types/quote';
import { EstimateForm } from '../../_components/estimate-form';
import type { EstimateFormErrors } from '../../_components/estimate-form';
import { EstimateSummary } from '../../_components/estimate-summary';
import finances from '@/routes/finances';

type CreateSectionProps = {
    selectedQuote: Quote | null;
    fromQuote: boolean;
};

const EMPTY_FORM: EstimateFormData = {
    quote_id: 0,
    valid_until: '',
    tax_percent: 11,
    discount_percent: 0,
    notes: '',
    items: [{ description: '', quantity: 1, unit_price: 0, tax_percent: 11, discount_percent: 0 }],
};

export default function CreateSection({ selectedQuote, fromQuote }: CreateSectionProps) {
    const [data, setData] = useState<EstimateFormData>({
        ...EMPTY_FORM,
        quote_id: selectedQuote ? Number(selectedQuote.id) : 0,
    });
    const [errors, setErrors] = useState<EstimateFormErrors>({});
    const [processing, setProcessing] = useState(false);

    function handleChange(val: Partial<EstimateFormData>) {
        setData((prev) => ({ ...prev, ...val }));
    }

    function submit(status: 'draft' | 'sent') {
        setProcessing(true);
        const toastId = toast.loading('Menyimpan...', { description: 'Estimate sedang ditambahkan.' });

        router.post(finances.estimates.store().url, { ...data, status, from_quote: fromQuote } as any, {
            onSuccess: () => {
                toast.success('Berhasil', { description: 'Estimate berhasil ditambahkan.' });
            },
            onError: (errors) => {
                setErrors(errors as EstimateFormErrors);
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
                <EstimateForm data={data} errors={errors} initialQuote={selectedQuote} fromQuote={fromQuote} onChange={handleChange} />
                <EstimateSummary items={data.items} processing={processing} onSubmitDraft={() => submit('draft')} onSubmitSend={() => submit('sent')} />
            </div>
        </div>
    );
}
