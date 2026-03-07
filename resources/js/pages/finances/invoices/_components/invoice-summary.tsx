import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/service';
import type { ProjectInvoiceItemFormData } from '@/types/project';

type InvoiceSummaryProps = {
    subtotal?: number;
    taxPercent?: number;
    discountPercent?: number;
    items?: ProjectInvoiceItemFormData[];
    isAdditional: boolean;
    processing: boolean;
    onSubmitDraft: () => void;
    onSubmitSend: () => void;
};

function calcSimple(subtotal: number, taxPercent: number, discountPercent: number) {
    const discountAmount = subtotal * (discountPercent / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (taxPercent / 100);
    const total = afterDiscount + taxAmount;
    return { subtotal, discountAmount, taxAmount, total };
}

function calcItems(items: ProjectInvoiceItemFormData[]) {
    let subtotal = 0;
    let discountAmount = 0;
    let taxAmount = 0;
    let total = 0;

    for (const item of items) {
        const s = item.quantity * item.unit_price;
        const d = s * ((item.discount_percent ?? 0) / 100);
        const ad = s - d;
        const t = ad * ((item.tax_percent ?? 0) / 100);

        subtotal += s;
        discountAmount += d;
        taxAmount += t;
        total += ad + t;
    }

    return { subtotal, discountAmount, taxAmount, total };
}

export function InvoiceSummary({ subtotal = 0, taxPercent = 0, discountPercent = 0, items = [], isAdditional, processing, onSubmitDraft, onSubmitSend }: InvoiceSummaryProps) {
    const calc = isAdditional ? calcItems(items) : calcSimple(subtotal, taxPercent, discountPercent);

    return (
        <div className="space-y-4">
            <div className="rounded-xl bg-sidebar p-5 shadow dark:shadow-none">
                <h3 className="mb-4 font-semibold">Ringkasan</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">{formatRupiah(calc.subtotal)}</span>
                    </div>

                    {calc.discountAmount > 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                                Diskon
                                {!isAdditional && discountPercent > 0 && <span className="ml-1 text-xs">({discountPercent}%)</span>}
                            </span>
                            <span className="font-medium text-destructive">-{formatRupiah(calc.discountAmount)}</span>
                        </div>
                    )}

                    {calc.taxAmount > 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                                Pajak
                                {!isAdditional && taxPercent > 0 && <span className="ml-1 text-xs">({taxPercent}%)</span>}
                            </span>
                            <span className="font-medium">{formatRupiah(calc.taxAmount)}</span>
                        </div>
                    )}

                    <div className="border-t border-border pt-3">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold">Total</span>
                            <span className="text-lg font-bold">{formatRupiah(calc.total)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Button type="button" className="w-full" disabled={processing} onClick={onSubmitSend}>
                    Simpan & Kirim
                </Button>

                <Button type="button" variant="secondary" className="w-full" disabled={processing} onClick={onSubmitDraft}>
                    Simpan sebagai Draft
                </Button>
            </div>
        </div>
    );
}
