import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

import { formatRupiah } from '@/lib/service';
import type { EstimateItemFormData } from '@/types/estimates';

type EstimateSummaryProps = {
    items: EstimateItemFormData[];
    processing: boolean;
    onSubmit?: () => void;
};

function calcItems(items: EstimateItemFormData[]) {
    let subtotal = 0,
        discountAmount = 0,
        taxAmount = 0,
        total = 0;

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

export function EstimateSummary({ items, processing, onSubmit }: EstimateSummaryProps) {
    const calc = calcItems(items);

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
                            <span className="text-muted-foreground">Diskon</span>
                            <span className="font-medium text-destructive">-{formatRupiah(calc.discountAmount)}</span>
                        </div>
                    )}

                    {calc.taxAmount > 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Pajak</span>
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

            <Button type="button" className="w-full" disabled={processing} onClick={onSubmit}>
                {processing ? (
                    <>
                        <Spinner className="mr-2" />
                        Menyimpan...
                    </>
                ) : (
                    'Simpan'
                )}
            </Button>
        </div>
    );
}
