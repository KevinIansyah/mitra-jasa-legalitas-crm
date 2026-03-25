import { Pencil } from 'lucide-react';
import { useState } from 'react';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import contents from '@/routes/contents';
import type { Testimonial } from '@/types/contents';
import type { Service } from '@/types/services';
import { TestimonialEditDrawer } from './testimonial-edit-drawer';

type ActionsProps = {
    testimonial: Testimonial;
    services: Service[];
};

export default function Actions({ testimonial, services }: ActionsProps) {
    const [editing, setEditing] = useState<Testimonial | null>(null);

    return (
        <>
            <div className="flex items-center gap-1">
                <HasPermission permission="edit-content-testimonials">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8" type="button" onClick={() => setEditing(testimonial)}>
                                <Pencil className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="delete-content-testimonials">
                    <DialogDelete description="Testimoni ini akan dihapus beserta file avatar jika ada." deleteUrl={contents.testimonials.destroy(testimonial.id).url} tooltipText="Hapus" />
                </HasPermission>
            </div>

            {editing && (
                <TestimonialEditDrawer testimonial={editing} services={services} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
            )}
        </>
    );
}
