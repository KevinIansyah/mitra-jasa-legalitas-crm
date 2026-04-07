import type { VisibilityState } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ChevronDown, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, Filter, Plus, Search, X } from 'lucide-react';
import * as React from 'react';

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
import accountsRoutes from '@/routes/finances/accounts';
import { ACCOUNT_TYPES, type Account } from '@/types/accounts';
import { AccountAddDrawer } from './account-add-drawer';
import getColumns from './columns';

type DataTableProps = {
    data: Account[];
    pageIndex: number;
    setPageIndex: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
    totalItems: number;
    perPage: number;
    initialFilters?: { search?: string; type?: string; status?: string };
}

export function DataTable({ data, pageIndex, setPageIndex, totalPages, totalItems, perPage, initialFilters = {} }: DataTableProps) {
    const [adding, setAdding] = React.useState(false);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [isFilterOpen, setIsFilterOpen] = React.useState(false);

    const { searchValue, clearSearch, handleSearchChange, filters, updateFilter, goToPage, changePageSize, canPreviousPage, canNextPage, resetFilters, activeFiltersCount } =
        useDataTableWithFilters({
            pageIndex,
            setPageIndex,
            totalPages,
            perPage,
            initialFilters,
            onlyFields: ['accounts', 'filters'],
            routeUrl: accountsRoutes.index().url,
        });

    const columns = getColumns();
    const selectedType = ACCOUNT_TYPES.find((t) => t.value === filters.type);

    const table = useReactTable({
        data,
        columns,
        state: { columnVisibility, pagination: { pageIndex, pageSize: perPage } },
        pageCount: totalPages,
        manualPagination: true,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <>
            {/* ───────────────── Search and Filter Section ───────────────── */}
            <div className="flex flex-col gap-4 pb-4">
                <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
                    <div className="flex w-full flex-1 items-center gap-2 md:w-auto">
                        {/* Search */}
                        <InputGroup className="max-w-sm">
                            <InputGroupInput placeholder="Cari kode atau nama akun..." value={searchValue} onChange={handleSearchChange} />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>

                        {/* Filter */}
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
                                    <SheetTitle>Filter Akun</SheetTitle>
                                    <SheetDescription>Saring akun berdasarkan tipe atau status</SheetDescription>
                                </SheetHeader>
                                <div className="space-y-4 px-4">
                                    <Field>
                                        <FieldLabel>Status</FieldLabel>
                                        <Select value={filters.status || ''} onValueChange={(v) => updateFilter('status', v || undefined)}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Pilih status..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Status</SelectLabel>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    <Field>
                                        <FieldLabel>Tipe Akun</FieldLabel>
                                        <Select value={filters.type || ''} onValueChange={(v) => updateFilter('type', v || undefined)}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Pilih tipe..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Tipe</SelectLabel>
                                                    {ACCOUNT_TYPES.map((item) => (
                                                        <SelectItem key={item.value} value={item.value}>
                                                            {item.label}
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

                    <div className="flex w-full gap-2 md:w-auto">
                        {/* Column Visibility */}
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

                        {/* Add Account */}
                        <HasPermission permission="create-finance-accounts">
                            <Button
                                type="button"
                                className="flex-1 md:min-w-30 md:flex-none"
                                onClick={(e) => {
                                    e.currentTarget.blur();
                                    setAdding(true);
                                }}
                            >
                                <Plus className="size-4" />
                                Tambah
                            </Button>
                        </HasPermission>
                    </div>
                </div>

                {/* Active Filters */}
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
                        {filters.type && (
                            <Badge variant="secondary" className="gap-2">
                                Tipe: {selectedType?.label}
                                <Button variant="ghost" size="sm" className="h-6 w-6 text-xs" onClick={() => updateFilter('type', undefined)}>
                                    <X className="size-3" />
                                </Button>
                            </Badge>
                        )}
                        {filters.status && (
                            <Badge variant="secondary" className="gap-2">
                                {filters.status === 'active' ? 'Active' : 'Inactive'}
                                <Button variant="ghost" size="sm" className="h-6 w-6 text-xs" onClick={() => updateFilter('status', undefined)}>
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

            {/* ───────────────── Table Section ───────────────── */}
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
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {searchValue ? 'Tidak ada hasil yang ditemukan' : 'Tidak ada data'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* ───────────────── Pagination Section ───────────────── */}
            <div className="flex items-center justify-between gap-8 pt-4">
                <div className="hidden flex-1 text-sm md:flex">
                    Menampilkan {Math.min(pageIndex * perPage + 1, totalItems)} sampai {Math.min((pageIndex + 1) * perPage, totalItems)} dari {totalItems} hasil
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

            {adding && (
                <AccountAddDrawer
                    open={adding}
                    onOpenChange={(open) => {
                        if (!open) setAdding(false);
                    }}
                />
            )}
        </>
    );
}
