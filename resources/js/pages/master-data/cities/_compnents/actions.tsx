import { Pencil } from 'lucide-react';
import { useState } from 'react';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import citiesRoute from '@/routes/master-data/cities';
import type { City } from '@/types/cities';
import { DrawerEdit } from './drawer-edit';

type ActionsProps = {
    city: City;
};

export default function Actions({ city }: ActionsProps) {
    const [editingCity, setEditingCity] = useState<City | null>(null);

    return (
        <>
            <div className="flex items-center gap-1">
                <HasPermission permission="edit-master-cities">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8" onClick={() => setEditingCity(city)}>
                                <Pencil className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Kota</TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="delete-master-cities">
                    <DialogDelete
                        description={`Tindakan ini tidak dapat dibatalkan. Data kota "${city.name}" akan dihapus secara permanen dari sistem.`}
                        deleteUrl={citiesRoute.destroy(city.id).url}
                        tooltipText="Hapus Kota"
                    />
                </HasPermission>
            </div>

            {editingCity && (
                <DrawerEdit
                    city={editingCity}
                    open={!!editingCity}
                    onOpenChange={(open) => {
                        if (!open) setEditingCity(null);
                    }}
                />
            )}
        </>
    );
}
