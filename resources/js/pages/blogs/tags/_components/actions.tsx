import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import tags from '@/routes/blogs/tags';
import type { BlogTag } from '@/types/blogs';
import { DrawerEdit } from './drawer-edit';

type ActionsProps = {
    tag: BlogTag;
};

export default function Actions({ tag }: ActionsProps) {
    const [editingTag, setEditingTag] = useState<BlogTag | null>(null);

    return (
        <>
            <div className="flex items-center gap-1">
                <HasPermission permission="edit-blog-tags">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8" onClick={() => setEditingTag(tag)}>
                                <Pencil className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Edit Tag</p>
                        </TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="delete-blog-tags">
                    <DialogDelete
                        description={`Tindakan ini tidak dapat dibatalkan. Data tag blog "${tag.name}" akan dihapus secara permanen dari sistem.`}
                        deleteUrl={tags.destroy(tag.id).url}
                        tooltipText="Hapus Tag"
                    />
                </HasPermission>
            </div>

            {editingTag && (
                <DrawerEdit
                    tag={editingTag}
                    open={!!editingTag}
                    onOpenChange={(open) => {
                        if (!open) setEditingTag(null);
                    }}
                />
            )}
        </>
    );
}
