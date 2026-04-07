import { AlertTriangle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { formatDate, formatFileSize } from '@/lib/utils';
import type { ProjectDocument } from '@/types/projects';

export default function DocumentDetail({ document }: { document: ProjectDocument }) {
    return (
        <div className="space-y-4 p-4 whitespace-normal">
            {document.status === 'rejected' && document.rejection_reason && (
                <Alert className="border-destructive bg-destructive/10 text-destructive">
                    <AlertTriangle />
                    <AlertTitle>Alasan Penolakan</AlertTitle>
                    <AlertDescription>{document.rejection_reason}</AlertDescription>
                </Alert>
            )}

            {document.description && (
                <div className="space-y-1 text-sm text-foreground">
                    <p className="text-xs font-medium text-muted-foreground">Deskripsi</p>
                    <p>{document.description}</p>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Format</p>
                    <p className="uppercase">{document.document_format ?? '-'}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Ukuran File</p>
                    <p>{document.file_size ? formatFileSize(document.file_size) : '-'}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Diunggah</p>
                    <p>{document.uploaded_at ? formatDate(document.uploaded_at) : '-'}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Diverifikasi</p>
                    <p>{document.verified_at ? formatDate(document.verified_at) : '-'}</p>
                </div>
            </div>

            {document.notes && (
                <div className="space-y-1 text-sm text-foreground">
                    <p className="text-xs text-muted-foreground">Catatan</p>
                    <p>{document.notes}</p>
                </div>
            )}
        </div>
    );
}
