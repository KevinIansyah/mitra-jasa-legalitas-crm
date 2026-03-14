import { Link } from '@inertiajs/react';
import { Pencil } from 'lucide-react';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import services from '@/routes/services';
import type { ServiceCityPage } from '@/types/service';

type ActionsProps = {
    cityPage: ServiceCityPage;
};

export function Actions({ cityPage }: ActionsProps) {
    return (
        <div className="flex items-center gap-1">
            <HasPermission permission="edit-service-city-pages">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="secondary" size="sm" className="h-8 w-8" asChild>
                            <Link href={services.cityPages.edit(cityPage.id).url}>
                                <Pencil className="size-3.5" />
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Halaman Kota</TooltipContent>
                </Tooltip>
            </HasPermission>

            <HasPermission permission="delete-service-city-pages">
                <DialogDelete
                    description={`Tindakan ini tidak dapat dibatalkan. Halaman "${cityPage.service?.name} di ${cityPage.city?.name}" akan dihapus secara permanen.`}
                    deleteUrl={services.cityPages.destroy(cityPage.id).url}
                    tooltipText="Hapus Halaman Kota"
                />
            </HasPermission>
        </div>
    );
}
