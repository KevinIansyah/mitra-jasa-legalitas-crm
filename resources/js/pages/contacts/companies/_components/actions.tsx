import { Link } from '@inertiajs/react';
import { ChevronDown, ChevronUp, Eye, Pencil, UserRoundCog } from 'lucide-react';
import { useState } from 'react';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import companies from '@/routes/contacts/companies';
import type { Company, CompanyWithCustomers } from '@/types/contacts';
import { DrawerEdit } from './drawer-edit';
import { DrawerManageCustomers } from './drawer-manage-customer';

type ActionsProps = {
    company: CompanyWithCustomers;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
};

export default function Actions({ company, isExpanded, onToggleExpand }: ActionsProps) {
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [isManagingCustomers, setIsManagingCustomers] = useState(false);

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
                            <Button variant="secondary" size="sm" className="h-8 w-8" asChild>
                                <Link href={companies.show(company.id).url}>
                                    <Eye className="size-4" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Lihat Detail Perusahaan</p>
                        </TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="edit-contact-companies">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8" onClick={() => setEditingCompany(company)}>
                                <Pencil className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Edit Perusahaan</p>
                        </TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="delete-contact-companies">
                    <DialogDelete
                        description={`Tindakan ini tidak dapat dibatalkan. Data perusahaan "${company.name}" akan dihapus secara permanen dari sistem.`}
                        deleteUrl={companies.destroy(company.id).url}
                        tooltipText="Hapus Perusahaan"
                    />
                </HasPermission>
            </div>

            {editingCompany && (
                <DrawerEdit
                    company={editingCompany}
                    open={!!editingCompany}
                    onOpenChange={(open) => {
                        if (!open) setEditingCompany(null);
                    }}
                />
            )}

            {isManagingCustomers && <DrawerManageCustomers company={company} open={isManagingCustomers} onOpenChange={setIsManagingCustomers} />}
        </>
    );
}
