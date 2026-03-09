import { formatRupiah } from '@/lib/service';
import type { ProjectInvoice } from '@/types/project';
import { PaymentCard } from '../../payments/_components/payment-card';

export default function InvoiceDetail({ invoice }: { invoice: ProjectInvoice }) {
    const items = invoice.items ?? [];

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
                </div>
            )}

            <PaymentCard invoice={invoice} />
        </div>
    );
}
