/* eslint-disable @typescript-eslint/no-explicit-any */
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import type { Project, ProjectInvoice, ProjectInvoiceFormData } from '@/types/project';
import { InvoiceForm } from '../../_components/invoice-form';
import { InvoiceSummary } from '../../_components/invoice-summary';
import type { InvoiceFormErrors } from '../../create/_components/create-section';
import invoices from '@/routes/finances/invoices';

type EditSectionProps = {
    invoice: ProjectInvoice;
    projects: Project[];
    fromProject: boolean;
    isEdit: boolean;
};

function invoiceToFormData(invoice: ProjectInvoice): ProjectInvoiceFormData {
    return {
        project_id: invoice.project_id,
        type: invoice.type,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        percentage: invoice.percentage ? Number(invoice.percentage) : 0,
        subtotal: Number(invoice.subtotal),
        tax_percent: Number(invoice.tax_percent),
        discount_percent: Number(invoice.discount_percent),
        notes: invoice.notes ?? '',
        payment_instructions: invoice.payment_instructions ?? '',
        items:
            invoice.items?.map((item) => ({
                description: item.description,
                quantity: Number(item.quantity),
                unit_price: Number(item.unit_price),
                tax_percent: Number(item.tax_percent),
                discount_percent: Number(item.discount_percent),
            })) ?? [],
    };
}

export default function EditSection({ invoice, projects, fromProject, isEdit }: EditSectionProps) {
    const [data, setData] = useState<ProjectInvoiceFormData>(() => invoiceToFormData(invoice));
    const [errors, setErrors] = useState<InvoiceFormErrors>({});
    const [processing, setProcessing] = useState(false);

    function handleChange(val: Partial<ProjectInvoiceFormData>) {
        setData((prev) => ({ ...prev, ...val }));
    }

    function submit(status: 'draft' | 'sent') {
        setProcessing(true);
        const toastId = toast.loading('Menyimpan...', { description: 'Invoice sedang diperbarui.' });

        router.put(invoices.update(invoice.id).url, { ...data, status, from_project: fromProject } as any, {
            onSuccess: () => {
                toast.success('Berhasil', { description: 'Invoice berhasil diperbarui.' });
            },
            onError: (errors) => {
                setErrors(errors as InvoiceFormErrors);
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui invoice, coba lagi.';
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
                <InvoiceForm data={data} errors={errors} projects={projects} fromProject={fromProject} isEdit={isEdit} onChange={handleChange} />

                <InvoiceSummary
                    subtotal={data.subtotal}
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
