import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatRupiah } from '@/lib/service';
import type { Estimate } from '@/types/quote';

export default function EstimateDetail({ estimate }: { estimate: Estimate }) {
    const hasContent = estimate.notes || estimate.items?.length || estimate.status === 'rejected';

    if (!hasContent) return <div className="p-4 text-center text-sm text-muted-foreground">Tidak ada informasi tambahan</div>;

    return (
        <div className="space-y-4 p-4 text-sm whitespace-normal">
            {estimate.items && estimate.items.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Rincian Item</p>
                    <div>
                        {estimate.items.map((item, i) => (
                            <div key={i} className="flex items-start justify-between border-t border-primary/20 p-3 last:border-b dark:border-border">
                                <div className="space-y-0.5">
                                    <p className="font-medium">{item.description}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.quantity} × {formatRupiah(Number(item.unit_price))}
                                        {Number(item.discount_percent) > 0 && <span className="ml-2 text-destructive">diskon {item.discount_percent}%</span>}
                                        {Number(item.tax_percent) > 0 && <span className="ml-2">pajak {item.tax_percent}%</span>}
                                    </p>
                                </div>
                                <p className="shrink-0 font-semibold tabular-nums">{formatRupiah(Number(item.total_amount))}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {estimate.status === 'rejected' && estimate.rejected_reason && (
                <Alert className="border-destructive bg-destructive/10 text-destructive">
                    <AlertTriangle />
                    <AlertTitle>Alasan Penolakan</AlertTitle>
                    <AlertDescription>{estimate.rejected_reason}</AlertDescription>
                </Alert>
            )}

            {estimate.notes && (
                <div className="space-y-1 text-sm text-foreground">
                    <p className="text-xs text-muted-foreground">Catatan</p>
                    <p>{estimate.notes}</p>
                </div>
            )}
        </div>
    );
}
