import { Pencil } from 'lucide-react';
import { useState } from 'react';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import staffRoutes from '@/routes/staff';
import type { Role } from '@/types/role';
import type { Staff } from '@/types/staff';
import { DrawerEdit } from './drawer-edit';


type ActionsProps = {
    staff: Staff;
    roles: Role[];
};

export default function Actions({ staff, roles }: ActionsProps) {
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

    return (
        <>
            <div className="flex items-center gap-1">
                <HasPermission permission="edit-staff">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8" onClick={() => setEditingStaff(staff)}>
                                <Pencil className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Staff</TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="delete-staff">
                    <DialogDelete
                        description={`Tindakan ini tidak dapat dibatalkan. Data staff "${staff.name}" beserta akun login-nya akan dihapus secara permanen dari sistem.`}
                        deleteUrl={staffRoutes.destroy(staff.id).url}
                        tooltipText="Hapus Staff"
                    />
                </HasPermission>
            </div>

            {editingStaff && (
                <DrawerEdit
                    staff={editingStaff}
                    roles={roles}
                    open={!!editingStaff}
                    onOpenChange={(open) => {
                        if (!open) setEditingStaff(null);
                    }}
                />
            )}
        </>
    );
}
