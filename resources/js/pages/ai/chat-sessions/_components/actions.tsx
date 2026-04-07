import { Link } from '@inertiajs/react';
import { Eye } from 'lucide-react';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import chatSessions from '@/routes/ai/chat-sessions';
import type { ChatSession } from '../index';

export function Actions({ session }: { session: ChatSession }) {
    return (
        <div className="flex items-center gap-1">
            <HasPermission permission="view-ai-chat-sessions">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="secondary" size="sm" className="h-8 w-8" asChild>
                            <Link href={chatSessions.show(session.id).url}>
                                <Eye className="size-3.5" />
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Lihat Percakapan</TooltipContent>
                </Tooltip>
            </HasPermission>
            <HasPermission permission="delete-ai-chat-sessions">
                <DialogDelete
                    description={`Sesi chat ini akan dihapus permanen beserta semua pesannya.`}
                    deleteUrl={chatSessions.destroy(session.id).url}
                    tooltipText="Hapus Sesi"
                />
            </HasPermission>{' '}
        </div>
    );
}
