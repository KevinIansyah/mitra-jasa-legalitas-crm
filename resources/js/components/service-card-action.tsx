import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type ServiceCardActionProps = {
    index: number;
    totalItems: number;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onDelete: () => void;
    direction?: 'horizontal' | 'vertical';
};

export function ServiceCardAction({ index, totalItems, onMoveUp, onMoveDown, onDelete, direction = 'vertical' }: ServiceCardActionProps) {
    const isVertical = direction === 'vertical';

    const MoveBackIcon = isVertical ? ArrowUp : ArrowLeft;
    const MoveNextIcon = isVertical ? ArrowDown : ArrowRight;

    const moveBackText = isVertical ? 'Pindah ke Atas' : 'Pindah ke Kiri';
    const moveNextText = isVertical ? 'Pindah ke Bawah' : 'Pindah ke Kanan';

    return (
        <div className="flex items-center gap-1">
            {/* Move Back */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="secondary" size="icon" onClick={onMoveUp} disabled={index === 0} className="h-8 w-8">
                        <MoveBackIcon className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                    <p>{moveBackText}</p>
                </TooltipContent>
            </Tooltip>

            {/* Move Next */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="secondary" size="icon" onClick={onMoveDown} disabled={index === totalItems - 1} className="h-8 w-8">
                        <MoveNextIcon className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                    <p>{moveNextText}</p>
                </TooltipContent>
            </Tooltip>

            {/* Delete */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="destructive" size="icon" onClick={onDelete} className="h-8 w-8">
                        <Trash2 className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                    <p>Hapus Kategori</p>
                </TooltipContent>
            </Tooltip>
        </div>
    );
}
