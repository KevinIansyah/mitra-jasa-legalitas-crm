import type { VisibilityState } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ChevronDown, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, Filter, Plus, Search, X } from 'lucide-react';
import * as React from 'react';

import { DatePicker } from '@/components/date-picker';
import { HasPermission } from '@/components/has-permission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Field, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { useDataTableWithFilters } from '@/hooks/use-datatable-with-filters';
import finances from '@/routes/finances';
import type { Account } from '@/types/account';
import getColumns from './columns';
import { JournalAddDrawer } from './journal-add-drawer';
import { JournalEntryDetail } from './journal-entry-detail';
import { JOURNAL_REFERENCE_TYPES, type JournalEntry } from '@/types/journal-entries';

interface DataTableProps {
    data: JournalEntry[];
    accounts: Account[];
    pageIndex: number;
    setPageIndex: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
    totalItems: number;
    perPage: number;
    initialFilters?: { search?: string; from?: string; to?: string; reference_type?: string };
}

export function DataTable({ data, accounts, pageIndex, setPageIndex, totalPages, totalItems, perPage, initialFilters = {} }: DataTableProps) {
    const [addingJournal, setAddingJournal] = React.useState(false);
    const [expandedRow, setExpandedRow] = React.useState<string | null>(null);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [isFilterOpen, setIsFilterOpen] = React.useState(false);

    const { searchValue, clearSearch, handleSearchChange, filters, updateFilter, goToPage, changePageSize, canPreviousPage, canNextPage, resetFilters, activeFiltersCount } =
        useDataTableWithFilters({
            pageIndex,
            setPageIndex,
            totalPages,
            perPage,
            initialFilters,
            onlyFields: ['entries', 'filters'],
            routeUrl: finances.journalEntries.index().url,
        });

    const columns = getColumns(expandedRow, setExpandedRow);

    const table = useReactTable({
        data,
        columns,
        state: { columnVisibility, pagination: { pageIndex, pageSize: perPage } },
        pageCount: totalPages,
        manualPagination: true,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
    });

    const selectedType = JOURNAL_REFERENCE_TYPES.find((type) => type.value === filters.reference_type);

    return (
        <>
            {/* Toolbar */}
            <div className="flex flex-col gap-4 pb-4">
                <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
                    <div className="flex w-full flex-1 items-center gap-2 md:w-auto">
                        <InputGroup className="max-w-sm">
                            <InputGroupInput placeholder="Cari keterangan jurnal..." value={searchValue} onChange={handleSearchChange} />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>

                        {/* Filter Sheet */}
                        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <SheetTrigger asChild>
                                <Button variant="secondary" className="relative gap-1.5 lg:w-30">
                                    <Filter className="size-3.75" />
                                    <span className="hidden lg:inline">Filter</span>
                                    {activeFiltersCount > 0 && (
                                        <Badge className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-background">
                                            {activeFiltersCount}
                                        </Badge>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>Filter Jurnal</SheetTitle>
                                    <SheetDescription>Saring jurnal berdasarkan tipe atau tanggal</SheetDescription>
                                </SheetHeader>
                                <div className="space-y-4 px-4">
                                    <Field>
                                        <FieldLabel>Tipe Jurnal</FieldLabel>
                                        <Select value={filters.reference_type || ''} onValueChange={(v) => updateFilter('reference_type', v || undefined)}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Semua tipe" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Tipe</SelectLabel>
                                                    {JOURNAL_REFERENCE_TYPES.map((t) => (
                                                        <SelectItem key={t.value} value={t.value}>
                                                            {t.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    <Field>
                                        <FieldLabel>Dari Tanggal</FieldLabel>
                                        <DatePicker value={filters.from || ''} onChange={(v) => updateFilter('from', v || undefined)} fromYear={2020} toYear={2040} />
                                    </Field>

                                    <Field>
                                        <FieldLabel>Sampai Tanggal</FieldLabel>
                                        <DatePicker value={filters.to || ''} onChange={(v) => updateFilter('to', v || undefined)} fromYear={2020} toYear={2040} />
                                    </Field>

                                    {activeFiltersCount > 0 && (
                                        <Button className="w-full" variant="outline" onClick={resetFilters}>
                                            Reset Filter
                                        </Button>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <div className="flex w-full gap-2 md:w-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="flex-1 gap-1.5 md:w-30">
                                    Kolom <ChevronDown />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {table
                                    .getAllLeafColumns()
                                    .filter((c) => c.getCanHide())
                                    .map((column) => (
                                        <DropdownMenuCheckboxItem key={column.id} checked={column.getIsVisible()} onCheckedChange={() => column.toggleVisibility()}>
                                            {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <HasPermission permission="create-finance-journals">
                            <Button
                                type="button"
                                className="flex-1 md:min-w-30 md:flex-none"
                                onClick={(e) => {
                                    e.currentTarget.blur();
                                    setAddingJournal(true);
                                }}
                            >
                                <Plus className="size-4" />
                                Tambah
                            </Button>
                        </HasPermission>
                    </div>
                </div>

                {/* Active filter badges */}
                {activeFiltersCount > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-muted-foreground">Filter aktif:</span>
                        {searchValue && (
                            <Badge variant="secondary" className="gap-1">
                                Cari: {searchValue}
                                <Button variant="ghost" size="sm" className="h-6 w-6 text-xs" onClick={clearSearch}>
                                    <X className="size-3" />
                                </Button>
                            </Badge>
                        )}
                        {filters.reference_type && (
                            <Badge variant="secondary" className="gap-2">
                                Tipe: {selectedType?.label}
                                <Button variant="ghost" size="sm" className="h-6 w-6 text-xs" onClick={() => updateFilter('reference_type', undefined)}>
                                    <X className="size-3" />
                                </Button>
                            </Badge>
                        )}
                        {filters.from && (
                            <Badge variant="secondary" className="gap-2">
                                Dari: {filters.from}
                                <Button variant="ghost" size="sm" className="h-6 w-6 text-xs" onClick={() => updateFilter('from', undefined)}>
                                    <X className="size-3" />
                                </Button>
                            </Badge>
                        )}
                        {filters.to && (
                            <Badge variant="secondary" className="gap-2">
                                Sampai: {filters.to}
                                <Button variant="ghost" size="sm" className="h-6 w-6 text-xs" onClick={() => updateFilter('to', undefined)}>
                                    <X className="size-3" />
                                </Button>
                            </Badge>
                        )}
                        <Button variant="ghost" size="sm" className="h-7.5 text-xs" onClick={resetFilters}>
                            Reset semua
                        </Button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-t-md border-b">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-none">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <React.Fragment key={row.id}>
                                    <TableRow data-state={row.getIsSelected() && 'selected'} className={expandedRow === row.id ? 'border-none' : ''}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                    {expandedRow === row.id && (
                                        <TableRow className="hover:bg-transparent">
                                            <TableCell colSpan={columns.length} className="pb-4">
                                                <div className="rounded-lg bg-primary/10 dark:bg-muted/40">
                                                    <JournalEntryDetail entry={row.original} />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-muted-foreground">
                                    {searchValue ? 'Tidak ada hasil yang ditemukan' : 'Belum ada jurnal tercatat'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between gap-8 pt-4">
                <div className="hidden flex-1 text-sm md:flex">
                    Menampilkan {Math.min(pageIndex * perPage + 1, totalItems)} sampai {Math.min((pageIndex + 1) * perPage, totalItems)} dari {totalItems} jurnal
                    {searchValue && <span className="ml-1">untuk "{searchValue}"</span>}
                </div>
                <div className="flex w-full items-center gap-8 md:w-fit">
                    <div className="hidden items-center gap-2 md:flex">
                        <Label htmlFor="rows-per-page" className="text-sm font-medium">
                            Baris per halaman
                        </Label>
                        <Select value={`${perPage}`} onValueChange={(v) => changePageSize(Number(v))}>
                            <SelectTrigger className="w-20" id="rows-per-page">
                                <SelectValue placeholder={perPage} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[20, 30, 40, 50].map((s) => (
                                    <SelectItem key={s} value={`${s}`}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex w-fit items-center justify-center text-sm font-medium">
                        Halaman {pageIndex + 1} dari {totalPages}
                    </div>
                    <div className="ml-auto flex items-center gap-2 lg:ml-0">
                        <Button variant="secondary" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => goToPage(0)} disabled={!canPreviousPage}>
                            <ChevronsLeftIcon />
                        </Button>
                        <Button variant="secondary" className="size-8" size="sm" onClick={() => goToPage(pageIndex - 1)} disabled={!canPreviousPage}>
                            <ChevronLeftIcon />
                        </Button>
                        <Button variant="secondary" className="size-8" size="sm" onClick={() => goToPage(pageIndex + 1)} disabled={!canNextPage}>
                            <ChevronRightIcon />
                        </Button>
                        <Button variant="secondary" className="hidden size-8 lg:flex" size="sm" onClick={() => goToPage(totalPages - 1)} disabled={!canNextPage}>
                            <ChevronsRightIcon />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Create drawer */}
            {addingJournal && (
                <JournalAddDrawer
                    open={addingJournal}
                    onOpenChange={(open) => {
                        if (!open) setAddingJournal(false);
                    }}
                    accounts={accounts}
                />
            )}
        </>
    );
}
