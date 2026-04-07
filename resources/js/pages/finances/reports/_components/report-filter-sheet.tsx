import { router } from '@inertiajs/react';
import { Filter } from 'lucide-react';
import * as React from 'react';

import { DatePicker } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';


{/* ───────────────── Search & Filter Sheet (Period) ───────────────── */}
type PeriodFilterSheetProps = {
    from: string;
    to: string;
    routeUrl: string;
}

export function PeriodFilterSheet({ from, to, routeUrl }: PeriodFilterSheetProps) {
    const [open, setOpen] = React.useState(false);
    const [localFrom, setFrom] = React.useState(from);
    const [localTo, setTo] = React.useState(to);

    const apply = () => {
        router.get(
            routeUrl,
            { from: localFrom, to: localTo },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
        setOpen(false);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="secondary" className="flex-1 md:w-30 md:flex-none">
                    <Filter className="size-3.75" />
                    Filter
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Filter Periode</SheetTitle>
                    <SheetDescription>Tentukan rentang tanggal laporan</SheetDescription>
                </SheetHeader>
                <div className="space-y-4 px-4">
                    <Field>
                        <FieldLabel>Dari Tanggal</FieldLabel>
                        <DatePicker value={localFrom} onChange={setFrom} fromYear={2020} toYear={2040} />
                    </Field>
                    <Field>
                        <FieldLabel>Sampai Tanggal</FieldLabel>
                        <DatePicker value={localTo} onChange={setTo} fromYear={2020} toYear={2040} />
                    </Field>
                    <Button className="w-full" onClick={apply}>
                        Terapkan
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

{/* ───────────────── Search & Filter Sheet (As Of) ───────────────── */}
type AsOfFilterSheetProps = {
    asOf: string;
    routeUrl: string;
}

export function AsOfFilterSheet({ asOf, routeUrl }: AsOfFilterSheetProps) {
    const [open, setOpen] = React.useState(false);
    const [localAsOf, setLocalAsOf] = React.useState(asOf);

    const apply = () => {
        router.get(
            routeUrl,
            { as_of: localAsOf },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
        setOpen(false);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="secondary" className="flex-1 md:w-30 md:flex-none">
                    <Filter className="size-3.75" />
                    Filter
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Filter Tanggal</SheetTitle>
                    <SheetDescription>Tentukan tanggal posisi keuangan</SheetDescription>
                </SheetHeader>
                <div className="space-y-4 px-4">
                    <Field>
                        <FieldLabel>Per Tanggal</FieldLabel>
                        <DatePicker value={localAsOf} onChange={setLocalAsOf} fromYear={2020} toYear={2040} />
                    </Field>
                    <Button className="w-full" onClick={apply}>
                        Terapkan
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
