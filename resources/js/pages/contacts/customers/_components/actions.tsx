import { Eye, Pencil, UserRoundCheck, UserRoundMinus } from 'lucide-react';
import { useState } from 'react';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import customers from '@/routes/contacts/customers';
import type { Customer } from '@/types/contact';
import { DialogManageAccount } from './dialog-manage-account';
import { DrawerEdit } from './drawer-edit';

type ActionsProps = {
    customer: Customer;
};

export default function Actions({ customer }: ActionsProps) {
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [managingAccount, setManagingAccount] = useState<Customer | null>(null);
    const hasAccount = !!customer.user_id;

    return (
        <>
            <div className="flex items-center gap-1">
                <HasPermission permission="edit-contact-customers">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8" onClick={() => setManagingAccount(customer)}>
                                {hasAccount ? <UserRoundMinus className="size-4" /> : <UserRoundCheck className="size-4" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{hasAccount ? 'Kelola Akun' : 'Buatkan Akun'}</TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="view-contact-customers">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8">
                                <Eye className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Lihat Detail Pelanggan</TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="edit-contact-customers">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8" onClick={() => setEditingCustomer(customer)}>
                                <Pencil className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Pelanggan</TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="delete-contact-customers">
                    <DialogDelete
                        description={`Tindakan ini tidak dapat dibatalkan. Data pelanggan "${customer.name}" akan dihapus secara permanen dari sistem.`}
                        deleteUrl={customers.destroy(customer.id).url}
                        tooltipText="Hapus Pelanggan"
                    />
                </HasPermission>
            </div>

            {editingCustomer && (
                <DrawerEdit
                    customer={editingCustomer}
                    open={!!editingCustomer}
                    onOpenChange={(open) => {
                        if (!open) setEditingCustomer(null);
                    }}
                />
            )}

            {managingAccount && (
                <DialogManageAccount
                    customer={managingAccount}
                    open={!!managingAccount}
                    onOpenChange={(open) => {
                        if (!open) setManagingAccount(null);
                    }}
                />
            )}
        </>
    );
}
