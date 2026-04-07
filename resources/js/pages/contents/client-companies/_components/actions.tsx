import { Pencil } from 'lucide-react';
import { useState } from 'react';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import contents from '@/routes/contents';
import type { ClientCompany } from '@/types/contents';
import { ClientCompanyEditDrawer } from './client-company-edit-drawer';

type ActionsProps = {
    clientCompany: ClientCompany;
};

export default function Actions({ clientCompany }: ActionsProps) {
    const [editing, setEditing] = useState<ClientCompany | null>(null);

    return (
        <>
            <div className="flex items-center gap-1">
                <HasPermission permission="edit-content-client-companies">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8" type="button" onClick={() => setEditing(clientCompany)}>
                                <Pencil className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="delete-content-client-companies">
                    <DialogDelete
                        description="Logo di penyimpanan akan ikut dihapus jika ada."
                        deleteUrl={contents.clientCompanies.destroy(clientCompany.id).url}
                        tooltipText="Hapus"
                    />
                </HasPermission>
            </div>

            {editing && (
                <ClientCompanyEditDrawer key={editing.id} clientCompany={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
            )}
        </>
    );
}
