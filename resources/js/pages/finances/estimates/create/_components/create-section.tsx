import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import finances from '@/routes/finances';
import type { EstimateFormData } from '@/types/estimates';
import type { Proposal } from '@/types/proposals';
import type { Quote } from '@/types/quotes';
import { EstimateForm } from '../../_components/estimate-form';
import type { EstimateFormErrors } from '../../_components/estimate-form';
import { EstimateSummary } from '../../_components/estimate-summary';

type CreateSectionProps = {
    selectedQuote: Quote | null;
    fromQuote: boolean;
    selectedProposal: Proposal | null;
    fromProposal: boolean;
};

const EMPTY_FORM: EstimateFormData = {
    quote_id: null,
    proposal_id: null,
    customer_id: null,
    valid_until: '',
    estimate_date: '',
    tax_percent: 11,
    discount_percent: 0,
    notes: '',
    items: [{ description: '', quantity: 1, unit_price: 0, tax_percent: 11, discount_percent: 0 }],
};

function buildInitialForm(selectedQuote: Quote | null, fromQuote: boolean, selectedProposal: Proposal | null, fromProposal: boolean): EstimateFormData {
    if (fromQuote && selectedQuote) {
        return { ...EMPTY_FORM, quote_id: selectedQuote.id };
    }

    if (fromProposal && selectedProposal) {
        return {
            ...EMPTY_FORM,
            proposal_id: selectedProposal.id,
            items: [],
        };
    }

    return EMPTY_FORM;
}

export default function CreateSection({ selectedQuote, fromQuote, selectedProposal, fromProposal }: CreateSectionProps) {
    const [data, setData] = useState<EstimateFormData>(() => buildInitialForm(selectedQuote, fromQuote, selectedProposal, fromProposal));
    const [errors, setErrors] = useState<EstimateFormErrors>({});
    const [processing, setProcessing] = useState(false);

    function handleChange(val: Partial<EstimateFormData>) {
        setData((prev) => ({ ...prev, ...val }));
    }

    function handleSubmit() {
        setProcessing(true);
        const toastId = toast.loading('Menyimpan...', { description: 'Estimasi sedang ditambahkan.' });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        router.post(finances.estimates.store().url, { ...data, from_quote: fromQuote, from_proposal: fromProposal } as any, {
            onSuccess: () => {
                toast.success('Berhasil', { description: 'Estimasi berhasil ditambahkan.' });
            },
            onError: (errors) => {
                setErrors(errors as EstimateFormErrors);
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat menambahkan estimasi, coba lagi.';
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
                <EstimateForm
                    data={data}
                    errors={errors}
                    initialQuote={selectedQuote}
                    initialProposal={selectedProposal}
                    fromQuote={fromQuote}
                    fromProposal={fromProposal}
                    onChange={handleChange}
                />
                <EstimateSummary items={data.items} processing={processing} onSubmit={handleSubmit} />
            </div>
        </div>
    );
}
