import { formatDate, formatFileSize } from '@/lib/utils';
import type { ProjectDeliverable } from '@/types/project';

export default function DeliverableDetail({ deliverable }: { deliverable: ProjectDeliverable }) {
    return (
        <div className="p-4">
            <div className="space-y-4">
                {deliverable.description && (
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Deskripsi</p>
                        <p className="whitespace-normal">{deliverable.description}</p>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    <span>
                        Format <span className="text-foreground uppercase">{deliverable.file_type.split('/').pop()}</span>
                    </span>
                    <span>
                        Ukuran File <span className="text-foreground">{formatFileSize(deliverable.file_size)}</span>
                    </span>
                    <span>
                        Diunggah <span className="text-foreground">{formatDate(deliverable.uploaded_at)}</span>
                    </span>
                    {deliverable.uploader && (
                        <span>
                            Oleh <span className="text-foreground">{deliverable.uploader.name}</span>
                        </span>
                    )}
                </div>

                {deliverable.notes && (
                    <div className="text-xs whitespace-normal text-foreground">
                        <span className="text-muted-foreground">Catatan: </span>
                        {deliverable.notes}
                    </div>
                )}
            </div>
        </div>
    );
}
