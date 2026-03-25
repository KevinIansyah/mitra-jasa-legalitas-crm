import type { VisibilityState } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, Filter, Search, X } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { useDataTableWithFilters } from '@/hooks/use-datatable-with-filters';
import blogs from '@/routes/blogs';
import { BLOG_SUBSCRIBER_VERIFIED_FILTER, type BlogSubscriber } from '@/types/blogs';
import getColumns from './columns';
import SubscriberDetail from './subscriber-detail';

interface DataTableProps {
    data: BlogSubscriber[];
    pageIndex: number;
    setPageIndex: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
    totalItems: number;
    perPage: number;
    initialFilters?: {
        search?: string;
        verified?: string;
    };
}

export function DataTable({ data, pageIndex, setPageIndex, totalPages, totalItems, perPage, initialFilters = {} }: DataTableProps) {
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [expandedRow, setExpandedRow] = React.useState<string | null>(null);
    const [isFilterOpen, setIsFilterOpen] = React.useState(false);

    const { searchValue, clearSearch, handleSearchChange, filters, updateFilter, goToPage, changePageSize, canPreviousPage, canNextPage, resetFilters, activeFiltersCount } =
        useDataTableWithFilters({
            pageIndex,
            setPageIndex,
            totalPages,
            perPage,
            initialFilters,
            onlyFields: ['subscribers', 'filters'],
            routeUrl: blogs.subscribers.index().url,
        });

    const columns = getColumns(expandedRow, setExpandedRow);
    const selectedVerified = BLOG_SUBSCRIBER_VERIFIED_FILTER.find((s) => s.value === filters.verified);

    const table = useReactTable({
        data,
        columns,
        state: {
            columnVisibility,
            pagination: { pageIndex, pageSize: perPage },
        },
        pageCount: totalPages,
        manualPagination: true,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <>
            <div className="flex flex-col gap-4 pb-4">
                <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
                    <div className="flex w-full flex-1 items-center gap-2 md:w-auto">
                        <InputGroup className="max-w-sm">
                            <InputGroupInput placeholder="Cari email atau nama..." value={searchValue} onChange={handleSearchChange} />
                            <InputGroupAddon>
                                <Search className="mr-1" />
                            </InputGroupAddon>
                        </InputGroup>

                        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <SheetTrigger asChild>
                                <Button variant="secondary" className="relative gap-1.5 lg:w-30">
                                    <Filter className="size-3.75" />
                                    <span className="hidden lg:inline">Filter</span>
                                    {activeFiltersCount > 0 && (
                                        <Badge className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-background">{activeFiltersCount}</Badge>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>Filter Data</SheetTitle>
                                    <SheetDescription>Atur filter untuk menyaring subscriber blog</SheetDescription>
                                </SheetHeader>
                                <div className="space-y-4 px-4">
                                    <Field>
                                        <FieldLabel>Status verifikasi</FieldLabel>
                                        <Select value={filters.verified || ''} onValueChange={(v) => updateFilter('verified', v || undefined)}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Semua status..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Status</SelectLabel>
                                                    {BLOG_SUBSCRIBER_VERIFIED_FILTER.map((s) => (
                                                        <SelectItem key={s.value} value={s.value}>
                                                            {s.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    {activeFiltersCount > 0 && (
                                        <Button className="w-full" onClick={resetFilters}>
                                            Reset Filter
                                        </Button>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

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
                        {filters.verified && (
                            <Badge variant="secondary" className="gap-2">
                                Status: {selectedVerified?.label}
                                <Button variant="ghost" size="sm" className="h-6 w-6 text-xs" onClick={() => updateFilter('verified', undefined)}>
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
                                    <TableRow className={expandedRow === String(row.original.id) ? 'border-none' : ''}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                    {expandedRow === String(row.original.id) && (
                                        <TableRow className="hover:bg-transparent">
                                            <TableCell colSpan={columns.length} className="pb-4">
                                                <div className="rounded-lg bg-primary/10 dark:bg-muted/40">
                                                    <SubscriberDetail subscriber={row.original} />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {searchValue ? 'Tidak ada hasil yang ditemukan' : 'Belum ada subscriber'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between gap-8 pt-4">
                <div className="hidden flex-1 text-sm md:flex">
                    Menampilkan {Math.min(pageIndex * perPage + 1, totalItems)} sampai {Math.min((pageIndex + 1) * perPage, totalItems)} dari {totalItems} hasil
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
                                {[20, 30, 40, 50].map((size) => (
                                    <SelectItem key={size} value={`${size}`}>
                                        {size}
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
        </>
    );
}
