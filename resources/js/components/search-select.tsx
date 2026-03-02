import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';

type SearchSelectProps<T> = {
    options: T[];
    value?: string;
    onChange: (value: string) => void;
    valueKey: keyof T;
    labelKey: keyof T;
    placeholder?: string;
    searchPlaceholder?: string;
};

export function SearchSelect<T>({ options, value, onChange, valueKey, labelKey, placeholder = 'Pilih data', searchPlaceholder = 'Cari...' }: SearchSelectProps<T>) {
    const selected = options.find((item) => String(item[valueKey]) === value);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                    <span className="text-muted-foreground">{selected ? String(selected[labelKey]) : placeholder}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-full p-0">
                <Command className="w-full">
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandEmpty>Tidak ditemukan.</CommandEmpty>

                    <CommandGroup className="max-h-60 w-full overflow-y-auto">
                        {options.map((item, index) => {
                            const itemValue = String(item[valueKey]);
                            const itemLabel = String(item[labelKey]);

                            return (
                                <CommandItem key={index} value={itemLabel} onSelect={() => onChange(itemValue)}>
                                    {itemLabel}

                                    <Check className={cn('ml-auto text-background', value === itemValue ? 'opacity-100' : 'opacity-0')} />
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
