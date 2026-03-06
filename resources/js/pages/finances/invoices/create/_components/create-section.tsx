/* eslint-disable @typescript-eslint/no-explicit-any */
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import type { Project, ProjectInvoiceFormData } from '@/types/project';
import { InvoiceForm } from '../../_components/invoice-form';
import { InvoiceSummary } from '../../_components/invoice-summary';
import invoices from '@/routes/finances/invoices';

export type InvoiceFormErrors = Partial<Record<string, string>>;

type CreateSectionProps = {
    projects: Project[];
    selectedProject: Project | null;
    fromProject: boolean;
};

const EMPTY_FORM: ProjectInvoiceFormData = {
    project_id: 0,
    type: 'dp',
    invoice_date: '',
    due_date: '',
    percentage: 0,
    amount: 0,
    tax_percent: 11,
    discount_percent: 0,
    notes: '',
    payment_instructions: '',
    items: [{ description: '', quantity: 1, unit_price: 0, tax_percent: 11, discount_percent: 0 }],
};

export default function CreateSection({ projects, selectedProject, fromProject }: CreateSectionProps) {
    const [data, setData] = useState<ProjectInvoiceFormData>({
        ...EMPTY_FORM,
        project_id: selectedProject ? Number(selectedProject.id) : 0,
    });
    const [errors, setErrors] = useState<InvoiceFormErrors>({});
    const [processing, setProcessing] = useState(false);

    function handleChange(val: Partial<ProjectInvoiceFormData>) {
        setData((prev) => ({ ...prev, ...val }));
    }

    function submit(status: 'draft' | 'sent') {
        setProcessing(true);
        const toastId = toast.loading('Menyimpan...', { description: 'Invoice sedang ditambahkan.' });

        router.post(invoices.store().url, { ...data, status, from_project: fromProject } as any, {
            onSuccess: () => {
                toast.success('Berhasil', { description: 'Invoice berhasil ditambahkan.' });
            },
            onError: (errors) => {
                setErrors(errors as InvoiceFormErrors);
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat menamnbahkan invoice, coba lagi.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => {
                setProcessing(false);
                toast.dismiss(toastId);
            },
        });
    }

    const isAdditional = data.type === 'additional';

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
                <InvoiceForm data={data} errors={errors} projects={projects} fromProject={fromProject} onChange={handleChange} />

                <InvoiceSummary
                    amount={data.amount}
                    taxPercent={data.tax_percent ?? 0}
                    discountPercent={data.discount_percent ?? 0}
                    items={data.items ?? []}
                    isAdditional={isAdditional}
                    processing={processing}
                    onSubmitDraft={() => submit('draft')}
                    onSubmitSend={() => submit('sent')}
                />
            </div>
        </div>
    );
}
