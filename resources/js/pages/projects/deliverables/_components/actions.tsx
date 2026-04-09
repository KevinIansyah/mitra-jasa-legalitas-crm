import { ArrowDownToLine, ChevronDown, ChevronUp, FileCheck } from 'lucide-react';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import type { ProjectDeliverable } from '@/types/projects';
import projects from '@/routes/projects';

type ActionsProps = {
    deliverable: ProjectDeliverable;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
};

export default function Actions({ deliverable, isExpanded, onToggleExpand }: ActionsProps) {
    const hasFile = !!deliverable.file_path;

    function handleView() {
        if (!deliverable.file_path) return;
        window.open(
            projects.deliverables.view({
                project: deliverable.project_id,
                deliverable: deliverable.id,
                filename: deliverable.name,
            }).url,
            '_blank',
            'noopener,noreferrer',
        );
    }

    function handleDownload() {
        if (!deliverable.file_path) return;
        window.location.href = projects.deliverables.download({ project: deliverable.project_id, deliverable: deliverable.id }).url;
    }

    return (
        <>
            <div className="flex items-center gap-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="secondary" className="h-8 w-8" onClick={onToggleExpand}>
                            {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isExpanded ? 'Tutup Detail' : 'Lihat Detail'}</TooltipContent>
                </Tooltip>

                <HasPermission permission="view-project-deliverables">
                    {hasFile && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="secondary" className="h-8 w-8" onClick={handleView} disabled={deliverable.is_encrypted}>
                                    <FileCheck className="size-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Lihat Hasil Akhir</TooltipContent>
                        </Tooltip>
                    )}

                    {hasFile && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="secondary" className="h-8 w-8" onClick={handleDownload}>
                                    <ArrowDownToLine className="size-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Unduh Hasil Akhir</TooltipContent>
                        </Tooltip>
                    )}
                </HasPermission>

                <HasPermission permission="delete-project-deliverables">
                    <DialogDelete
                        description={`Tindakan ini tidak dapat dibatalkan. Data hasil akhir "${deliverable.name}" akan dihapus secara permanen dari sistem.`}
                        deleteUrl={projects.deliverables.destroy({ project: deliverable.project_id, deliverable: deliverable.id }).url}
                        tooltipText="Hapus Hasil Akhir"
                    />
                </HasPermission>
            </div>
        </>
    );
}
