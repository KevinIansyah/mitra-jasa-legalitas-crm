import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import finances from '@/routes/finances';
import type { Customer } from '@/types/contacts';
import type { Project, ProjectInvoice, ProjectInvoiceFormData } from '@/types/projects';
import { InvoiceForm } from '../../_components/invoice-form';
import { InvoiceSummary } from '../../_components/invoice-summary';
import type { InvoiceFormErrors } from '../../create/_components/create-section';

type EditSectionProps = {
    invoice: ProjectInvoice;
    selectedProject: Project | null;
    fromProject: boolean;
    selectedCustomer: Customer | null;
    isEdit: boolean;
};

function invoiceToFormData(invoice: ProjectInvoice): ProjectInvoiceFormData {
    const isContract = invoice.type === 'dp' || invoice.type === 'progress' || invoice.type === 'final';
    const first = invoice.items?.[0];

    return {
        project_id: invoice.project_id ?? null,
        customer_id: invoice.customer_id ?? null,
        type: invoice.type,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        percentage: invoice.percentage ? Number(invoice.percentage) : 0,
        subtotal: Number(invoice.subtotal),
        tax_percent: Number(invoice.tax_percent),
        discount_percent: Number(invoice.discount_percent),
        notes: invoice.notes ?? '',
        payment_instructions: invoice.payment_instructions ?? '',
        contract_item_description: isContract && first ? (first.description === '—' ? '' : first.description) : '',
        contract_item_details: isContract && first && Array.isArray(first.item_details) ? [...first.item_details] : [],
        items:
            invoice.type === 'additional'
                ? (invoice.items?.map((item) => ({
                      expense_id: item.expense_id ?? undefined,
                      description: item.description,
                      item_details: Array.isArray(item.item_details) ? [...item.item_details] : [],
                      quantity: Number(item.quantity),
                      unit_price: Number(item.unit_price),
                      tax_percent: Number(item.tax_percent),
                      discount_percent: Number(item.discount_percent),
                  })) ?? [])
                : [],
    };
}

export default function EditSection({ invoice, selectedProject, fromProject, selectedCustomer, isEdit }: EditSectionProps) {
    const [data, setData] = useState<ProjectInvoiceFormData>(() => invoiceToFormData(invoice));
    const [errors, setErrors] = useState<InvoiceFormErrors>({});
    const [processing, setProcessing] = useState(false);

    function handleChange(val: Partial<ProjectInvoiceFormData>) {
        setData((prev) => ({ ...prev, ...val }));
    }

    function handleSubmit() {
        setProcessing(true);
        const toastId = toast.loading('Menyimpan...', { description: 'Invoice sedang diperbarui.' });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        router.put(finances.invoices.update(invoice.id).url, { ...data, from_project: fromProject } as any, {
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
                <InvoiceForm data={data} errors={errors} initialProject={selectedProject} fromProject={fromProject} initialCustomer={selectedCustomer} isEdit={isEdit} onChange={handleChange} />

                <InvoiceSummary
                    subtotal={data.subtotal}
                    taxPercent={data.tax_percent ?? 0}
                    discountPercent={data.discount_percent ?? 0}
                    items={data.items ?? []}
                    useLineItemTotals={isAdditional}
                    processing={processing}
                    onSubmit={() => handleSubmit()}
                />
            </div>
        </div>
    );
}
