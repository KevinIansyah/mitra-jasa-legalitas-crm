import type { VisibilityState } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ChevronDown, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, Filter, Search, X } from 'lucide-react';
import * as React from 'react';
import { HasPermission } from '@/components/has-permission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { categoryBusinessOptions, statusLegalOptions } from '@/constans';
import { useDataTableWithFilters } from '@/hooks/use-datatable-with-filters';
import companies from '@/routes/contacts/companies';
import type { CompanyWithCustomers } from '@/types/contact';
import getColumns from './columns';
import { DrawerAdd } from './drawer-add';

interface DataTableProps {
    data: CompanyWithCustomers[];
    pageIndex: number;
    setPageIndex: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
    totalItems: number;
    perPage: number;
    initialFilters?: {
        search?: string;
        status_legal?: string;
        category_business?: string;
    };
}

export function DataTable({ data, pageIndex, setPageIndex, totalPages, totalItems, perPage, initialFilters = {} }: DataTableProps) {
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [isFilterOpen, setIsFilterOpen] = React.useState(false);
    const { searchValue, clearSearch, handleSearchChange, filters, updateFilter, goToPage, changePageSize, canPreviousPage, canNextPage, resetFilters, activeFiltersCount } =
        useDataTableWithFilters({
            pageIndex,
            setPageIndex,
            totalPages,
            perPage,
            initialFilters,
            onlyFields: ['companies', 'filters'],
            routeUrl: companies.index().url,
        });

    const columns = getColumns();

    const table = useReactTable({
        data,
        columns,
        state: {
            columnVisibility,
            pagination: {
                pageIndex,
                pageSize: perPage,
            },
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
                            <InputGroupInput placeholder="Cari nama..." value={searchValue} onChange={handleSearchChange} />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>

                        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="relative lg:w-30">
                                    <span className="hidden lg:inline">Filter</span>
                                    <Filter className="size-3.5" />
                                    <Badge className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-background">
                                        {activeFiltersCount}
                                    </Badge>
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>Filter Data</SheetTitle>
                                    <SheetDescription>Atur filter untuk menyaring data perusahaan</SheetDescription>
                                </SheetHeader>

                                <div className="mt-6 space-y-4 px-4">
                                    <div className="space-y-2">
                                        <Label>Status Legal</Label>
                                        <Select value={filters.status_legal || ''} onValueChange={(value) => updateFilter('status_legal', value || undefined)}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Pilih status legal" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {statusLegalOptions.map((item) => (
                                                        <SelectItem key={item.value} value={item.value}>
                                                            {item.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select value={filters.category_business || ''} onValueChange={(value) => updateFilter('category_business', value || undefined)}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Pilih kategori bisnis" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {categoryBusinessOptions.map((item) => (
                                                        <SelectItem key={item.value} value={item.value}>
                                                            {item.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>

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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="flex-1 md:w-30">
                                    Kolom <ChevronDown className="size-4" />
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

                        <HasPermission permission="create-contact-companies">
                            <DrawerAdd />
                        </HasPermission>
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
                        {filters.status_legal && (
                            <Badge variant="secondary" className="flex items-center gap-2">
                                Status Legal: {filters.status_legal}
                                <Button variant="ghost" size="sm" className="h-6 w-6 text-xs" onClick={() => updateFilter('status_legal', undefined)}>
                                    <X className="size-3" />
                                </Button>
                            </Badge>
                        )}
                        {filters.category_business && (
                            <Badge variant="secondary" className="gap-2">
                                Kategori Bisnis: {filters.category_business}
                                <Button variant="ghost" size="sm" className="h-6 w-6 text-xs" onClick={() => updateFilter('category_business', undefined)}>
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

            <div className="overflow-hidden rounded-md border-b">
                <Table>
                    <TableHeader className="bg-primary hover:bg-primary">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="font-medium text-background">
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
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

            <div className="flex items-center justify-between gap-8 pt-4">
                <div className="hidden flex-1 text-sm md:flex">
                    Menampilkan {Math.min(pageIndex * perPage + 1, totalItems)} sampai {Math.min((pageIndex + 1) * perPage, totalItems)} dari {totalItems} hasil
                </div>
                <div className="flex w-full items-center gap-8 md:w-fit">
                    <div className="hidden items-center gap-2 md:flex">
                        <Label htmlFor="rows-per-page" className="text-sm font-medium">
                            Baris per halaman
                        </Label>
                        <Select value={`${perPage}`} onValueChange={(value) => changePageSize(Number(value))}>
                            <SelectTrigger className="w-20" id="rows-per-page">
                                <SelectValue placeholder={perPage} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[20, 30, 40, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex w-fit items-center justify-center text-sm font-medium">
                        Halaman {pageIndex + 1} dari {totalPages}
                    </div>

                    <div className="ml-auto flex items-center gap-2 lg:ml-0">
                        <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => goToPage(0)} disabled={!canPreviousPage}>
                            <span className="sr-only">Go to first page</span>
                            <ChevronsLeftIcon />
                        </Button>
                        <Button variant="outline" className="size-8" size="sm" onClick={() => goToPage(pageIndex - 1)} disabled={!canPreviousPage}>
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeftIcon />
                        </Button>
                        <Button variant="outline" className="size-8" size="sm" onClick={() => goToPage(pageIndex + 1)} disabled={!canNextPage}>
                            <span className="sr-only">Go to next page</span>
                            <ChevronRightIcon />
                        </Button>
                        <Button variant="outline" className="hidden size-8 lg:flex" size="sm" onClick={() => goToPage(totalPages - 1)} disabled={!canNextPage}>
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRightIcon />
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
