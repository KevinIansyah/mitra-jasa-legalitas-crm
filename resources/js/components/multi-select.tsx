/* eslint-disable @typescript-eslint/no-explicit-any */
import { Check, ChevronsUpDown, X } from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Option {
    id: number;
    label: string;
}

interface MultiSelectProps {
    options: Option[];
    selected: number[];
    onChange: (selected: number[]) => void;
    placeholder?: string;
}

export default function MultiSelect({ options, selected, onChange, placeholder = 'Select items...' }: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (optionId: number) => {
        if (selected.includes(optionId)) {
            onChange(selected.filter((id) => id !== optionId));
        } else {
            onChange([...selected, optionId]);
        }
    };

    const handleRemove = (optionId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(selected.filter((id) => id !== optionId));
    };

    const selectedOptions = options.filter((option) => selected.includes(option.id));

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="h-auto min-h-10 w-full justify-between">
                    <div className="flex flex-wrap gap-1">
                        {selectedOptions.length === 0 ? (
                            <span className="text-muted-foreground font-normal">{placeholder}</span>
                        ) : (
                            selectedOptions.map((option) => (
                                <Badge key={option.id} className="mr-1 flex items-center gap-1">
                                    {option.label}

                                    <span
                                        role="button"
                                        tabIndex={0}
                                        className="ml-1 cursor-pointer rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleRemove(option.id, e as any);
                                            }
                                        }}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onClick={(e) => handleRemove(option.id, e)}
                                    >
                                        <X className="size-3" />
                                    </span>
                                </Badge>
                            ))
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command>
                    <CommandInput placeholder="Cari..." />
                    <CommandList>
                        <CommandEmpty>Hasil tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => {
                                const isSelected = selected.includes(option.id);
                                return (
                                    <CommandItem key={option.id} value={option.label} onSelect={() => handleSelect(option.id)}>
                                        <Check className={cn('mr-2 size-3.5', isSelected ? 'opacity-100' : 'opacity-0')} />
                                        {option.label}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
