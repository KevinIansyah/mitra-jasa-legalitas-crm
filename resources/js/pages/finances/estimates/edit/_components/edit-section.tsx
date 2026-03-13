import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import finances from '@/routes/finances';
import type { Estimate, EstimateFormData, Quote } from '@/types/quote';
import { EstimateForm } from '../../_components/estimate-form';
import type { EstimateFormErrors } from '../../_components/estimate-form';
import { EstimateSummary } from '../../_components/estimate-summary';

type EditSectionProps = {
    estimate: Estimate;
    selectedQuote: Quote | null;
    fromQuote: boolean;
    isEdit: boolean;
};

function estimateToFormData(estimate: Estimate): EstimateFormData {
    return {
        quote_id: estimate.quote_id,
        valid_until: estimate.valid_until ?? '',
        tax_percent: Number(estimate.tax_percent),
        discount_percent: Number(estimate.discount_percent),
        notes: estimate.notes ?? '',
        items:
            estimate.items?.map((item) => ({
                description: item.description,
                quantity: Number(item.quantity),
                unit_price: Number(item.unit_price),
                tax_percent: Number(item.tax_percent),
                discount_percent: Number(item.discount_percent),
            })) ?? [],
    };
}

export default function EditSection({ estimate, selectedQuote, fromQuote, isEdit }: EditSectionProps) {
    const [data, setData] = useState<EstimateFormData>(() => estimateToFormData(estimate));
    const [errors, setErrors] = useState<EstimateFormErrors>({});
    const [processing, setProcessing] = useState(false);

    function handleChange(val: Partial<EstimateFormData>) {
        setData((prev) => ({ ...prev, ...val }));
    }

    function handleSubmit() {
        setProcessing(true);
        const toastId = toast.loading('Menyimpan...', { description: 'Estimate sedang diperbarui.' });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        router.put(finances.estimates.update(estimate.id).url, { ...data, from_quote: fromQuote } as any, {
            onSuccess: () => {
                toast.success('Berhasil', { description: 'Estimate berhasil diperbarui.' });
            },
            onError: (errors) => {
                setErrors(errors as EstimateFormErrors);
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui estimasi, coba lagi.';
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
                <EstimateForm data={data} errors={errors} initialQuote={selectedQuote} fromQuote={fromQuote} isEdit={isEdit} onChange={handleChange} />
                
                <EstimateSummary items={data.items} processing={processing} onSubmit={() => handleSubmit()} />
            </div>
        </div>
    );
}
