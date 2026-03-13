import { router } from '@inertiajs/react';
import { ChevronDown, ChevronUp, Pencil } from 'lucide-react';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import finances from '@/routes/finances';
import type { Vendor } from '@/types/vendors';

type ActionsProps = {
    vendor: Vendor;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
};

export default function Actions({ vendor, isExpanded, onToggleExpand }: ActionsProps) {
    return (
        <div className="flex items-center gap-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="secondary" className="h-8 w-8" onClick={onToggleExpand}>
                        {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>{isExpanded ? 'Tutup Detail' : 'Lihat Detail'}</TooltipContent>
            </Tooltip>

            <HasPermission permission="edit-finance-vendors">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="secondary" className="h-8 w-8" onClick={() => router.visit(finances.vendors.edit(vendor.id).url)}>
                            <Pencil className="size-3.5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Vendor</TooltipContent>
                </Tooltip>
            </HasPermission>

            <HasPermission permission="delete-finance-vendors">
                <DialogDelete
                    description={`Vendor "${vendor.name}" akan dihapus secara permanen dari sistem.`}
                    deleteUrl={finances.vendors.destroy(vendor.id).url}
                    tooltipText="Hapus Vendor"
                />
            </HasPermission>
        </div>
    );
}
