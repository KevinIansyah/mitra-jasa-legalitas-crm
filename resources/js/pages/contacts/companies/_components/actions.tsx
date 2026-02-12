import { Eye, Pencil, UserRoundCog } from 'lucide-react';
import { useState } from 'react';
import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import companies from '@/routes/contacts/companies';
import type { CompanyWithCustomers } from '@/types/contact';
import { DrawerEdit } from './drawer-edit';
import { DrawerManageCustomers } from './drawer-manage-customer';

type ActionsProps = {
    company: CompanyWithCustomers;
};

export default function Actions({ company }: ActionsProps) {
    const [editingCompanyId, setEditingCompanyId] = useState<number | null>(null);
    const [isManagingCustomers, setIsManagingCustomers] = useState(false);

    return (
        <>
            <div className="flex items-center gap-2">
                <HasPermission permission="edit-contact-companies">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8" onClick={() => setIsManagingCustomers(true)}>
                                <UserRoundCog className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Kelola Pelanggan (PIC) Perusahaan</p>
                        </TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="view-contact-companies">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8">
                                <Eye className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Lihat Detail Perusahaan</p>
                        </TooltipContent>
                    </Tooltip>
                </HasPermission>

                {/* Edit */}
                <HasPermission permission="edit-contact-companies">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8" onClick={() => setEditingCompanyId(company.id)}>
                                <Pencil className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Edit Perusahaan</p>
                        </TooltipContent>
                    </Tooltip>
                </HasPermission>

                {/* Delete */}
                <HasPermission permission="delete-contact-companies">
                    <DialogDelete
                        description={`Tindakan ini tidak dapat dibatalkan. Data perusahaan "${company.name}" akan dihapus secara permanen dari sistem.`}
                        deleteUrl={companies.destroy(company.id).url}
                        tooltipText="Hapus Perusahaan"
                    />
                </HasPermission>
            </div>

            {/* Edit Drawer */}
            {editingCompanyId && (
                <DrawerEdit
                    companyId={editingCompanyId}
                    open={!!editingCompanyId}
                    onOpenChange={(open) => {
                        if (!open) setEditingCompanyId(null);
                    }}
                />
            )}

            {/* Manage Customers Drawer */}
            {isManagingCustomers && <DrawerManageCustomers company={company} open={isManagingCustomers} onOpenChange={setIsManagingCustomers} />}
        </>
    );
}
