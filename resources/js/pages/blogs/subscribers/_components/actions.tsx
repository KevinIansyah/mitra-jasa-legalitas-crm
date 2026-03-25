import { ChevronDown, ChevronUp } from 'lucide-react';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import blogs from '@/routes/blogs';
import type { BlogSubscriber } from '@/types/blogs';

type ActionsProps = {
    subscriber: BlogSubscriber;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
};

export default function Actions({ subscriber, isExpanded, onToggleExpand }: ActionsProps) {
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

            <HasPermission permission="delete-blog-subscribers">
                <DialogDelete
                    description={`Subscriber "${subscriber.email}" akan dihapus secara permanen.`}
                    deleteUrl={blogs.subscribers.destroy({ subscriber: subscriber.id }).url}
                    tooltipText="Hapus Subscriber"
                />
            </HasPermission>
        </div>
    );
}
