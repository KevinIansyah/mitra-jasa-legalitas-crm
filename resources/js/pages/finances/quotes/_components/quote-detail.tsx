import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import { CATEGORY_BUSINESS_MAP, STATUS_LEGAL_MAP } from '@/types/contacts';
import { ESTIMATE_STATUSES_MAP } from '@/types/estimates';
import type { Quote } from '@/types/quotes';
import { QUOTE_BUDGET_RANGES_MAP } from '@/types/quotes';

export default function QuoteDetail({ quote }: { quote: Quote }) {
    const estimates = quote.estimates ?? [];
    const budgetInfo = quote.budget_range ? QUOTE_BUDGET_RANGES_MAP[quote.budget_range] : null;
    const hasContent =
        quote.description || quote.rejected_reason || estimates.length > 0 || budgetInfo || quote.business_type || quote.business_legal_status || quote.service_package;

    const BusinessLegalStatus = quote.business_legal_status ? STATUS_LEGAL_MAP[quote.business_legal_status] : null;
    const BusinesType = quote.business_type ? CATEGORY_BUSINESS_MAP[quote.business_type] : null;

    if (!hasContent) return <div className="p-4 text-center text-sm text-muted-foreground">Tidak ada informasi tambahan</div>;

    return (
        <div className="space-y-4 p-4 text-sm whitespace-normal">
            {quote.status === 'rejected' && quote.rejected_reason && (
                <Alert className="border-destructive bg-destructive/10 text-destructive">
                    <AlertTriangle />
                    <AlertTitle>Alasan Penolakan</AlertTitle>
                    <AlertDescription>{quote.rejected_reason}</AlertDescription>
                </Alert>
            )}

            {(budgetInfo || quote.business_type || quote.service_package || quote.business_legal_status) && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {quote.service_package && (
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Paket</p>
                            <p>{quote.service_package.name}</p>
                        </div>
                    )}
                    {budgetInfo && (
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Budget</p>
                            <p>{budgetInfo.label}</p>
                        </div>
                    )}
                    {quote.business_type && (
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Tipe Bisnis</p>
                            <Badge className={BusinesType?.classes}>{BusinesType?.label}</Badge>
                        </div>
                    )}
                    {quote.business_type && (
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Legal Status</p>
                            <Badge className={BusinessLegalStatus?.classes}>{BusinessLegalStatus?.label}</Badge>
                        </div>
                    )}
                </div>
            )}

            {quote.description && (
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Deskripsi</p>
                    <p className="leading-relaxed">{quote.description}</p>
                </div>
            )}

            {estimates.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Riwayat Estimate ({estimates.length} versi)</p>
                    <div>
                        {estimates.map((est) => (
                            <div key={est.id} className="flex items-center justify-between border-t border-primary/20 p-3 last:border-b dark:border-border">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{est.estimate_number}</span>
                                    <Badge variant="outline" className="text-xs">
                                        {est.version_label}
                                    </Badge>
                                    {est.is_active && <Badge className="bg-emerald-500 text-xs text-white">Aktif</Badge>}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="tabular-nums">{formatRupiah(Number(est.total_amount))}</span>
                                    {est.valid_until && <span className="text-xs text-muted-foreground">s/d {formatDate(est.valid_until)}</span>}
                                    <Badge className={ESTIMATE_STATUSES_MAP[est.status]?.classes}>{ESTIMATE_STATUSES_MAP[est.status]?.label}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
