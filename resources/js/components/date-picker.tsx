import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type DatePickerProps = {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    fromYear?: number;
    toYear?: number;
};

const MONTHS = Array.from({ length: 12 }, (_, i) => format(new Date(2000, i), 'MMMM', { locale: id }));

export function DatePicker({ value, onChange, placeholder = 'Pilih tanggal', fromYear = 2020, toYear = 2030 }: DatePickerProps) {
    const selected = value ? new Date(value) : undefined;
    const [month, setMonth] = React.useState<Date>(selected ?? new Date());

    const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => fromYear + i);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !value && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 size-4" />
                    <span>{selected ? format(selected, 'dd MMMM yyyy', { locale: id }) : placeholder}</span>
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
                {/* Custom month/year navigation */}
                <div className="flex items-center gap-2 border-b px-3 py-2">
                    <Select value={String(month.getMonth())} onValueChange={(val) => setMonth(new Date(month.getFullYear(), Number(val)))}>
                        <SelectTrigger className="h-8 flex-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {MONTHS.map((name, i) => (
                                <SelectItem key={i} value={String(i)}>
                                    {name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={String(month.getFullYear())} onValueChange={(val) => setMonth(new Date(Number(val), month.getMonth()))}>
                        <SelectTrigger className="h-8 w-20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year) => (
                                <SelectItem key={year} value={String(year)}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Calendar mode="single" month={month} onMonthChange={setMonth} selected={selected} onSelect={(date) => onChange?.(date ? format(date, 'yyyy-MM-dd') : '')} />
            </PopoverContent>
        </Popover>
    );
}
