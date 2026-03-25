import { Pencil } from 'lucide-react';
import { useState } from 'react';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import contents from '@/routes/contents';
import type { ClientSuccessStory } from '@/types/contents';
import { StoryEditDrawer } from './story-edit-drawer';

type ActionsProps = {
    story: ClientSuccessStory;
};

export default function Actions({ story }: ActionsProps) {
    const [editing, setEditing] = useState<ClientSuccessStory | null>(null);

    return (
        <>
            <div className="flex items-center gap-1">
                <HasPermission permission="edit-content-client-success-stories">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8" type="button" onClick={() => setEditing(story)}>
                                <Pencil className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="delete-content-client-success-stories">
                    <DialogDelete
                        description="Kisah sukses ini akan dihapus beserta file logo jika ada."
                        deleteUrl={contents.clientSuccessStories.destroy({ client_success_story: story.id }).url}
                        tooltipText="Hapus"
                    />
                </HasPermission>
            </div>

            {editing && <StoryEditDrawer story={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />}
        </>
    );
}
