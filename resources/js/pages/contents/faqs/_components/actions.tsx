import { Pencil } from 'lucide-react';
import { useState } from 'react';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import contents from '@/routes/contents';
import type { Faq } from '@/types/contents';
import { FaqEditDrawer } from './faq-edit-drawer';

type ActionsProps = {
    faq: Faq;
};

export default function Actions({ faq }: ActionsProps) {
    const [editing, setEditing] = useState<Faq | null>(null);

    return (
        <>
            <div className="flex items-center gap-1">
                <HasPermission permission="edit-content-faqs">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8" type="button" onClick={() => setEditing(faq)}>
                                <Pencil className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="delete-content-faqs">
                    <DialogDelete
                        description="FAQ ini akan dihapus secara permanen."
                        deleteUrl={contents.faqs.destroy(faq.id).url}
                        tooltipText="Hapus FAQ"
                    />
                </HasPermission>
            </div>

            {editing && (
                <FaqEditDrawer
                    faq={editing}
                    open={!!editing}
                    onOpenChange={(open) => {
                        if (!open) setEditing(null);
                    }}
                />
            )}
        </>
    );
}
