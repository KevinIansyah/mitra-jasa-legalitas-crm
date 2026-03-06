import { formatDate, formatFileSize } from '@/lib/utils';
import type { ProjectDeliverable } from '@/types/project';

export default function DeliverableDetail({ deliverable }: { deliverable: ProjectDeliverable }) {
    return (
            <div className="p-4 space-y-4 whitespace-normal">
                {deliverable.description && (
                    <div className="space-y-1 text-sm text-foreground">
                        <p className="text-xs text-muted-foreground">Deskripsi</p>
                        <p>{deliverable.description}</p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Format</p>
                        <p className="uppercase">{deliverable.file_type ? deliverable.file_type.split('/').pop() : '-'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Ukuran File</p>
                        <p>{formatFileSize(deliverable.file_size) ? formatFileSize(deliverable.file_size) : '-'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Diunggah</p>
                        <p>{deliverable.uploaded_at ? formatDate(deliverable.uploaded_at) : '-'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Oleh</p>
                        <p>{deliverable.uploader ? deliverable.uploader.name : '-'}</p>
                    </div>
                </div>

                {deliverable.notes && (
                    <div className="space-y-1 text-sm text-foreground">
                        <p className="text-xs text-muted-foreground">Catatan</p>
                        <p>{deliverable.notes}</p>
                    </div>
                )}
            </div>

    );
}
