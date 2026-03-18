import { AlertTriangle, Toolbox } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatRupiah } from '@/lib/service';
import type { Proposal } from '@/types/proposals';

export default function ProposalDetail({ proposal }: { proposal: Proposal }) {
    const hasContent = proposal.notes || proposal.items?.length || proposal.status === 'rejected';

    if (!hasContent) return <div className="p-4 text-center text-sm text-muted-foreground">Tidak ada informasi tambahan</div>;

    return (
        <div className="space-y-4 p-4 text-sm whitespace-normal">
            {proposal.items && proposal.items.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Rincian Item</p>
                    <div>
                        <div className="border-b border-primary/20 dark:border-border">
                            {proposal.items.map((item, i) => (
                                <div key={i} className="mb-0 flex items-start justify-between gap-4 border-t border-primary/20 px-3 py-2 text-sm dark:border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                                            <Toolbox className="size-4 text-primary" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p>{item.description}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.quantity} × {formatRupiah(Number(item.unit_price))}
                                                {Number(item.discount_percent) > 0 && <span className="ml-2 text-destructive">diskon {item.discount_percent}%</span>}
                                                {Number(item.tax_percent) > 0 && <span className="ml-2">pajak {item.tax_percent}%</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="shrink-0 tabular-nums">{formatRupiah(Number(item.total_amount))}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-1 border-t border-primary/20 px-3 py-2 text-sm dark:border-border">
                            <div className="flex justify-between font-medium">
                                <span>Total</span>
                                <span className="tabular-nums">{formatRupiah(Number(proposal.total_amount))}</span>
                            </div>
                            <div className="flex justify-between font-medium">
                                <span className="text-xs text-muted-foreground">Subtotal</span>
                                <span className="text-xs text-muted-foreground">{formatRupiah(Number(proposal.subtotal))}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {proposal.status === 'rejected' && proposal.rejected_reason && (
                <Alert className="border-destructive bg-destructive/10 text-destructive">
                    <AlertTriangle />
                    <AlertTitle>Alasan Penolakan</AlertTitle>
                    <AlertDescription>{proposal.rejected_reason}</AlertDescription>
                </Alert>
            )}

            {proposal.notes && (
                <div className="space-y-1 text-sm text-foreground">
                    <p className="text-xs text-muted-foreground">Catatan</p>
                    <p>{proposal.notes}</p>
                </div>
            )}
        </div>
    );
}
