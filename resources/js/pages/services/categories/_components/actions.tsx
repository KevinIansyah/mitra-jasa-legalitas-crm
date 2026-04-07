import { Pencil } from 'lucide-react';
import { useState } from 'react';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import categories from '@/routes/services/categories';
import type { ServiceCategory } from '@/types/services';
import { DrawerEdit } from './drawer-edit';

type ActionsProps = {
    category: ServiceCategory;
};

export default function Actions({ category }: ActionsProps) {
    const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);

    return (
        <>
            <div className="flex items-center gap-1">
                <HasPermission permission="edit-service-categories">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8" onClick={() => setEditingCategory(category)}>
                                <Pencil className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Edit Kategori</p>
                        </TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="delete-service-categories">
                    <DialogDelete
                        description={`Tindakan ini tidak dapat dibatalkan. Data kategori layanan "${category.name}" akan dihapus secara permanen dari sistem.`}
                        deleteUrl={categories.destroy(category.id).url}
                        tooltipText="Hapus Kategori"
                    />
                </HasPermission>
            </div>

            {editingCategory && (
                <DrawerEdit
                    category={editingCategory}
                    open={!!editingCategory}
                    onOpenChange={(open) => {
                        if (!open) setEditingCategory(null);
                    }}
                />
            )}
        </>
    );
}
