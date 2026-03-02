import { Link } from '@inertiajs/react';
import { Eye } from 'lucide-react';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import projects from '@/routes/projects';
import type { Project } from '@/types/project';

type ActionsProps = {
    project: Project;
};

export default function Actions({ project }: ActionsProps) {
    return (
        <>
            <div className="flex items-center gap-1">
                <HasPermission permission="view-projects">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8">
                                <Link href={projects.show(project.id).url}>
                                    <Eye className="size-4" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Detail Project</p>
                        </TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="delete-projects">
                    <DialogDelete
                        description={`Tindakan ini tidak dapat dibatalkan. Data project "${project.name}" akan dihapus secara permanen dari sistem.`}
                        deleteUrl={projects.destroy(project.id).url}
                        tooltipText="Hapus Project"
                    />
                </HasPermission>
            </div>
        </>
    );
}
