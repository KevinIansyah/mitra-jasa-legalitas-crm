import { router } from '@inertiajs/react';
import { Pencil, Power } from 'lucide-react';
import { useState } from 'react';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import accountsRoutes from '@/routes/finances/accounts';
import type { Account } from '@/types/account';
import { AccountEditDrawer } from './account-edit-drawer';

type ActionsProps = {
    account: Account;
};

export default function Actions({ account }: ActionsProps) {
    const [editing, setEditing] = useState(false);
    const hasTransactions = (account.journal_lines_count ?? 0) > 0;

    const handleToggleStatus = () => {
        router.patch(accountsRoutes.toggleStatus(account.id).url, {}, { preserveScroll: true });
    };

    return (
        <>
            <div className="flex items-center gap-1">
                <HasPermission permission="edit-finance-accounts">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" className="h-8 w-8" disabled={account.is_system} onClick={handleToggleStatus}>
                                <Power className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{account.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}</TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="edit-finance-accounts">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" className="h-8 w-8" onClick={() => setEditing(true)}>
                                <Pencil className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Akun</TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="delete-finance-accounts">
                    <DialogDelete
                        description={
                            hasTransactions
                                ? `Akun "${account.name}" memiliki transaksi dan tidak dapat dihapus. Nonaktifkan jika tidak ingin digunakan.`
                                : `Akun "${account.name}" akan dihapus secara permanen.`
                        }
                        deleteUrl={accountsRoutes.destroy(account.id).url}
                        tooltipText="Hapus Akun"
                        isDisabled={account.is_system || hasTransactions}
                    />
                </HasPermission>
            </div>

            {editing && (
                <AccountEditDrawer
                    account={account}
                    open={editing}
                    onOpenChange={(open) => {
                        if (!open) setEditing(false);
                    }}
                />
            )}
        </>
    );
}
