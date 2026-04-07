import { CircleCheck, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type ContractInvoiceLineFieldsProps = {
    description: string;
    itemDetails: string[];
    onChange: (patch: { contract_item_description?: string; contract_item_details?: string[] }) => void;
};

export function ContractInvoiceLineFields({ description, itemDetails, onChange }: ContractInvoiceLineFieldsProps) {
    const [lineInput, setLineInput] = useState('');

    function addLine() {
        const trimmed = lineInput.trim();
        if (!trimmed) return;
        onChange({ contract_item_details: [...itemDetails, trimmed] });
        setLineInput('');
    }

    function deleteLine(lineIndex: number) {
        onChange({ contract_item_details: itemDetails.filter((_, i) => i !== lineIndex) });
    }

    return (
        <div className="space-y-4">
            <Field>
                <FieldLabel>Deskripsi</FieldLabel>
                <Input value={description} onChange={(e) => onChange({ contract_item_description: e.target.value })} placeholder="Contoh: Jasa Pendirian PT, Biaya PNBP..." />
            </Field>

            <Field>
                <FieldLabel>Rincian</FieldLabel>
                {itemDetails.length > 0 && (
                    <div className="mb-2 space-y-2">
                        {itemDetails.map((line, lineIndex) => (
                            <div key={lineIndex} className="flex items-center justify-between gap-4 rounded-lg bg-primary/10 p-3 dark:bg-muted/40">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                                        <CircleCheck className="size-4 text-primary" />
                                    </div>
                                    <span className="text-sm">{line}</span>
                                </div>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button type="button" variant="destructive" className="h-8 w-8" onClick={() => deleteLine(lineIndex)}>
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p>Hapus baris</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex gap-2">
                    <Input
                        value={lineInput}
                        onChange={(e) => setLineInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLine())}
                        placeholder="Contoh: Termin 50%"
                        className="flex-1"
                    />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button type="button" size="icon" onClick={addLine}>
                                <Plus className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>Tambah baris rincian</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </Field>
        </div>
    );
}
