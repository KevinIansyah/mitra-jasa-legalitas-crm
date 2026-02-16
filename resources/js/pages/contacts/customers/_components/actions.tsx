import { Eye, Pencil, UserRoundCheck } from 'lucide-react';
import { useState } from 'react';
import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import customers from '@/routes/contacts/customers';
import type { Customer } from '@/types/contact';
import { DrawerEdit } from './drawer-edit';

type ActionsProps = {
    customer: Customer;
};

export default function Actions({ customer }: ActionsProps) {
    const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);
    const isDisabled = customer.user_id !== null;

    return (
        <>
            <div className="flex items-center gap-1">
                <HasPermission permission="edit-contact-customers">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8" disabled={isDisabled}>
                                <UserRoundCheck className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Buat Akun Pelanggan</p>
                        </TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="view-contact-customers">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8">
                                <Eye className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Lihat Detail Pelanggan</p>
                        </TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="edit-contact-customers">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8" onClick={() => setEditingCustomerId(customer.id)}>
                                <Pencil className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Edit Pelanggan</p>
                        </TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="delete-contact-customers">
                    <DialogDelete
                        description={`Tindakan ini tidak dapat dibatalkan. Data pelanggan (PIC) "${customer.name}" akan dihapus secara permanen dari sistem.`}
                        deleteUrl={customers.destroy(customer.id).url}
                        tooltipText="Hapus Pelanggan"
                    />
                </HasPermission>
            </div>

            {editingCustomerId && (
                <DrawerEdit
                    customerId={editingCustomerId}
                    open={!!editingCustomerId}
                    onOpenChange={(open) => {
                        if (!open) setEditingCustomerId(null);
                    }}
                />
            )}
        </>
    );
}
