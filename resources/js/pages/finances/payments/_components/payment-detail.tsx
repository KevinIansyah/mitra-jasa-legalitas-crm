import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { ProjectPayment } from '@/types/project';

export default function PaymentDetail({ payment }: { payment: ProjectPayment }) {
    const hasContent = payment.notes || (payment.status === 'rejected' && payment.rejection_reason);

    if (!hasContent) return <div className="p-4 text-center text-sm text-muted-foreground">Tidak ada informasi tambahan</div>;

    return (
        <div className="space-y-4 p-4 whitespace-normal">
            {payment.status === 'rejected' && payment.rejection_reason && (
                <Alert className="border-destructive bg-destructive/10 text-destructive">
                    <AlertTriangle />
                    <AlertTitle>Alasan Penolakan:</AlertTitle>
                    <AlertDescription>{payment.rejection_reason}</AlertDescription>
                </Alert>
            )}

            {payment.notes && (
                <div className="space-y-1 text-sm text-foreground">
                    <p className="text-xs text-muted-foreground">Catatan</p>
                    <p>{payment.notes}</p>
                </div>
            )}
        </div>
    );
}
