import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatDate } from '@/lib/utils';
import { PAYMENT_METHODS_MAP, type ProjectPayment } from '@/types/project';

export default function PaymentDetail({ payment }: { payment: ProjectPayment }) {
    const { notes, status, rejection_reason, payment_method, reference_number, verified_at, verifier } = payment;
    const method = payment_method ? PAYMENT_METHODS_MAP[payment_method] : null;

    return (
        <div className="space-y-4 p-4 whitespace-normal">
            {status === 'rejected' && rejection_reason && (
                <Alert className="border-destructive bg-destructive/10 text-destructive">
                    <AlertTriangle />
                    <AlertTitle>Alasan Penolakan</AlertTitle>
                    <AlertDescription>{rejection_reason}</AlertDescription>
                </Alert>
            )}

            {(method || reference_number || verified_at || verifier) && (
                <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                    {method && (
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Metode</p>
                            <p>{method.label}</p>
                        </div>
                    )}

                    {reference_number && (
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Referensi</p>
                            <p>{reference_number}</p>
                        </div>
                    )}

                    {verified_at && (
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Diverifikasi</p>
                            <p>{formatDate(verified_at)}</p>
                        </div>
                    )}

                    {verifier && (
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Oleh</p>
                            <p>{verifier.name}</p>
                        </div>
                    )}
                </div>
            )}

            {notes && (
                <div className="space-y-1 text-sm">
                    <p className="text-xs text-muted-foreground">Catatan</p>
                    <p>{notes}</p>
                </div>
            )}

            {!method && !reference_number && !verified_at && !verifier && !notes && !rejection_reason && (
                <p className="text-center text-sm text-muted-foreground">Tidak ada informasi tambahan</p>
            )}
        </div>
    );
}
