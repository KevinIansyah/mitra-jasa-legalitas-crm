import { formatRupiah } from '@/lib/service';
import type { ProjectInvoice } from '@/types/project';
import { PaymentCard } from '../../payments/_components/payment-card';

export default function InvoiceDetail({ invoice }: { invoice: ProjectInvoice }) {
    const items = invoice.items ?? [];
    const { subtotal, discount_amount, tax_amount, total_amount, paid_at } = invoice;
    const hasBreakdown = Number(discount_amount) > 0 || Number(tax_amount) > 0;

    return (
        <div className="space-y-4 whitespace-normal">
            {items.length > 0 && (
                <div className="space-y-4">
                    <p className="text-sm font-medium">Item Invoice</p>
                    <div className="space-y-2">
                        {items.map((item, i) => (
                            <div key={i} className="flex items-start justify-between gap-4 rounded-lg bg-primary/10 p-4 text-sm dark:bg-muted/40">
                                <div className="space-y-0.5">
                                    <p className="font-medium">{item.description}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.quantity} × {formatRupiah(Number(item.unit_price))}
                                        {Number(item.discount_percent) > 0 && <span className="ml-2 text-destructive">diskon {item.discount_percent}%</span>}
                                        {Number(item.tax_percent) > 0 && <span className="ml-2">pajak {item.tax_percent}%</span>}
                                    </p>
                                </div>
                                <p className="shrink-0 font-semibold tabular-nums">{formatRupiah(Number(item.total))}</p>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="space-y-1 border-t pt-3 text-sm">
                        {hasBreakdown && (
                            <>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span className="tabular-nums">{formatRupiah(Number(subtotal))}</span>
                                </div>
                                {Number(discount_amount) > 0 && (
                                    <div className="flex justify-between text-destructive">
                                        <span>Diskon</span>
                                        <span className="tabular-nums">- {formatRupiah(Number(discount_amount))}</span>
                                    </div>
                                )}
                                {Number(tax_amount) > 0 && (
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Pajak</span>
                                        <span className="tabular-nums">+ {formatRupiah(Number(tax_amount))}</span>
                                    </div>
                                )}
                            </>
                        )}
                        <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span className="tabular-nums">{formatRupiah(Number(total_amount))}</span>
                        </div>
                        {paid_at && (
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Dibayar pada</span>
                                <span>{formatDate(paid_at)}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <PaymentCard invoice={invoice} />
        </div>
    );
}
