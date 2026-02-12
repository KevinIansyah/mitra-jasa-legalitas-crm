import { Link } from '@inertiajs/react';
import {  Pencil } from 'lucide-react';
import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import services from '@/routes/services';
import type { Service } from '@/types/service';

type ActionsProps = {
    service: Service;
};

export default function Actions({ service }: ActionsProps) {
    return (
        <>
            <div className="flex items-center gap-2">
                <HasPermission permission="edit-services">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8">
                                <Link href={services.edit(service.id)}>
                                    <Pencil className="size-3.5" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Edit Layanan</p>
                        </TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="delete-services">
                    <DialogDelete
                        description={`Tindakan ini tidak dapat dibatalkan. Data layanan "${service.name}" akan dihapus secara permanen dari sistem.`}
                        deleteUrl={services.destroy(service.id).url}
                        tooltipText="Hapus Layanan"
                    />
                </HasPermission>
            </div>
        </>
    );
}
