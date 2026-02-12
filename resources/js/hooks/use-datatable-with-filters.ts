/* eslint-disable @typescript-eslint/no-unused-vars */
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface UseDataTableWithFiltersProps<T extends Record<string, string | undefined>> {
    pageIndex: number;
    setPageIndex: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
    perPage: number;
    initialFilters?: T & { search?: string };
    onlyFields?: string[];
    routeUrl: string;
}

export const useDataTableWithFilters = <T extends Record<string, string | undefined>>({
    pageIndex,
    setPageIndex,
    totalPages,
    perPage,
    initialFilters = {} as T,
    onlyFields = [],
    routeUrl,
}: UseDataTableWithFiltersProps<T>) => {
    const getParamsFromUrl = () => {
        if (typeof window === 'undefined') return {};

        const params = new URLSearchParams(window.location.search);
        const result: Record<string, string> = {};

        params.forEach((value, key) => {
            if (value && value !== 'all') {
                result[key] = value;
            }
        });

        return result;
    };

    const urlParams = getParamsFromUrl();

    const [searchValue, setSearchValue] = useState(urlParams.search || initialFilters.search || '');
    const [filters, setFilters] = useState<Partial<T>>(() => {
        const { search: _search, page: _page, per_page: _per_page, ...restFilters } = urlParams;

        const cleanFilters = Object.fromEntries(Object.entries(restFilters).filter(([_, value]) => value && value !== 'all'));

        return cleanFilters as Partial<T>;
    });

    const buildParams = (newParams: Record<string, string | number | undefined> = {}) => {
        const params: Record<string, string | number> = {};

        // Add search if exists
        const currentSearch = newParams.search !== undefined ? newParams.search : searchValue;
        if (currentSearch) params.search = currentSearch;

        // Add filters (skip undefined dan 'all')
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'all' && newParams[key] === undefined) {
                params[key] = value;
            }
        });

        // Add per_page
        if (perPage) params.per_page = perPage;

        // Override with new params (skip undefined dan 'all')
        Object.entries(newParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '' && value !== 'all') {
                params[key] = value;
            } else {
                delete params[key];
            }
        });

        return params;
    };

    const navigate = (params: Record<string, string | number | undefined>) => {
        router.get(routeUrl, buildParams(params), {
            preserveState: true,
            preserveScroll: true,
            only: onlyFields,
        });
    };

    const debouncedSearch = useDebouncedCallback((searchTerm: string) => {
        setPageIndex(0);
        navigate({
            search: searchTerm || undefined,
            page: 1,
        });
    }, 500);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchValue(value);
        debouncedSearch(value);
    };

    const updateFilter = (key: keyof T, value: string | undefined) => {
        setFilters((prev) => {
            const newFilters = { ...prev };

            if (!value || value === 'all') {
                delete newFilters[key];
            } else {
                newFilters[key] = value as T[keyof T];
            }

            return newFilters;
        });

        setPageIndex(0);

        navigate({
            [key as string]: value && value !== 'all' ? value : undefined,
            page: 1,
        });
    };

    const goToPage = (page: number) => {
        const newPage = Math.max(0, Math.min(page, totalPages - 1));
        setPageIndex(newPage);

        navigate({
            page: newPage + 1,
        });
    };

    const changePageSize = (newPerPage: number) => {
        setPageIndex(0);

        navigate({
            per_page: newPerPage,
            page: 1,
        });
    };

    const resetFilters = () => {
        setFilters({});
        setSearchValue('');
        setPageIndex(0);

        router.get(
            routeUrl,
            { per_page: perPage },
            {
                preserveState: true,
                preserveScroll: true,
                only: onlyFields,
            },
        );
    };

    const clearSearch = () => {
        setSearchValue('');
        setPageIndex(0);

        navigate({
            search: undefined,
            page: 1,
        });
    };

    const activeFiltersCount = Object.values(filters).filter((v) => v && v !== 'all').length;

    return {
        // Search
        searchValue,
        setSearchValue,
        handleSearchChange,
        clearSearch,

        // Filters
        filters,
        updateFilter,
        resetFilters,
        activeFiltersCount,

        // Pagination
        goToPage,
        changePageSize,
        canPreviousPage: pageIndex > 0,
        canNextPage: pageIndex < totalPages - 1,
    };
};
