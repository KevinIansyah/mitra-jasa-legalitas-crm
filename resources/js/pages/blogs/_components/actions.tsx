import { Link } from '@inertiajs/react';
import { Pencil } from 'lucide-react';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import blogs from '@/routes/blogs';
import type { Blog } from '@/types/blogs';

type ActionsProps = {
    blog: Blog;
};

export default function Actions({ blog }: ActionsProps) {
    return (
        <div className="flex items-center gap-1">
            <HasPermission permission="edit-blogs">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="secondary" size="sm" className="h-8 w-8" asChild>
                            <Link href={blogs.edit(blog.id).url}>
                                <Pencil className="size-3.5" />
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Edit Blog</p>
                    </TooltipContent>
                </Tooltip>
            </HasPermission>

            <HasPermission permission="delete-blogs">
                <DialogDelete
                    description={`Tindakan ini tidak dapat dibatalkan. Data blog "${blog.title}" akan dihapus secara permanen dari sistem.`}
                    deleteUrl={blogs.destroy(blog.id).url}
                    tooltipText="Hapus Blog"
                />
            </HasPermission>
        </div>
    );
}
