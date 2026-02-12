import { Link } from '@inertiajs/react';
import { Pencil, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import roles from '@/routes/roles';
import type { Role } from '@/types/role';
import { DrawerEdit } from './drawer-edit';

type ActionsProps = {
    role: Role;
};

export default function Actions({ role }: ActionsProps) {
    const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
    const isDisabled = ['super-admin', 'user'].includes(role.name);

    return (
        <>
            <div className="flex items-center gap-2">
                <HasPermission permission="edit-permissions">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {isDisabled ? (
                                <Button variant="secondary" size="sm" className="h-8 w-8" disabled>
                                    <ShieldCheck className="size-4.5" />
                                </Button>
                            ) : (
                                <Button variant="secondary" size="sm" className="h-8 w-8" asChild>
                                    <Link href={roles.permission.edit(role.id)}>
                                        <ShieldCheck className="size-4.5" />
                                    </Link>
                                </Button>
                            )}
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Berikan Hak Akses</p>
                        </TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="edit-roles">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8" onClick={() => setEditingRoleId(role.id)} disabled={isDisabled}>
                                <Pencil className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Edit Role</p>
                        </TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="delete-roles">
                    <DialogDelete
                        description={`Tindakan ini tidak dapat dibatalkan. Data role "${role.name}" akan dihapus secara permanen dari sistem.`}
                        deleteUrl={roles.destroy(role.id).url}
                        tooltipText="Hapus Role"
                        isDisabled={isDisabled}
                    />
                </HasPermission>
            </div>

            {editingRoleId && (
                <DrawerEdit
                    roleId={editingRoleId}
                    open={!!editingRoleId}
                    onOpenChange={(open) => {
                        if (!open) setEditingRoleId(null);
                    }}
                />
            )}
        </>
    );
}
