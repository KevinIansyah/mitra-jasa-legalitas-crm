import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import finances from '@/routes/finances';
import type { Customer } from '@/types/contacts';
import type { Proposal, ProposalFormData } from '@/types/proposals';
import { ProposalForm } from '../../_components/proposal-form';
import type { ProposalFormErrors } from '../../_components/proposal-form';
import { ProposalSummary } from '../../_components/proposal-summary';

type EditSectionProps = {
    proposal: Proposal;
    selectedCustomer: Customer | null;
    isEdit: boolean;
};

function proposalToFormData(proposal: Proposal): ProposalFormData {
    return {
        customer_id: proposal.customer_id,
        project_name: proposal.project_name,
        proposal_date: proposal.proposal_date,
        valid_until: proposal.valid_until ?? '',
        tax_percent: Number(proposal.tax_percent),
        discount_percent: Number(proposal.discount_percent),
        notes: proposal.notes ?? '',
        items:
            proposal.items?.map((item) => ({
                description: item.description,
                quantity: Number(item.quantity),
                unit_price: Number(item.unit_price),
                tax_percent: Number(item.tax_percent),
                discount_percent: Number(item.discount_percent),
            })) ?? [],
    };
}

export default function EditSection({ proposal, selectedCustomer, isEdit }: EditSectionProps) {
    const [data, setData] = useState<ProposalFormData>(() => proposalToFormData(proposal));
    const [errors, setErrors] = useState<ProposalFormErrors>({});
    const [processing, setProcessing] = useState(false);

    function handleChange(val: Partial<ProposalFormData>) {
        setData((prev) => ({ ...prev, ...val }));
    }

    function handleSubmit() {
        setProcessing(true);
        const toastId = toast.loading('Menyimpan...', { description: 'Proposal sedang diperbarui.' });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        router.put(finances.proposals.update(proposal.id).url, data as any, {
            onSuccess: () => toast.success('Berhasil', { description: 'Proposal berhasil diperbarui.' }),
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
                <ProposalForm data={data} errors={errors} initialCustomer={selectedCustomer} isEdit={isEdit} onChange={handleChange} />
                
                <ProposalSummary items={data.items} processing={processing} onSubmit={handleSubmit} />
            </div>
        </div>
    );
}
