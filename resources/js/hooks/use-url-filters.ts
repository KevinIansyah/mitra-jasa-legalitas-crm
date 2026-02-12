import { useState } from 'react';

type Filters = Record<string, string | undefined>;

export const useUrlFilters = <T extends Filters>(initialFilters?: T) => {
    const getFiltersFromUrl = (): Partial<T> => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const filters: Partial<T> = {};

            params.forEach((value, key) => {
                if (key !== 'search' && key !== 'per_page') {
                    filters[key as keyof T] = value as T[keyof T];
                }
            });

            return filters;
        }
        return {};
    };

    const [filters, setFilters] = useState<Partial<T>>(() => {
        const urlFilters = getFiltersFromUrl();
        return { ...initialFilters, ...urlFilters };
    });

    const updateFilter = (key: keyof T, value: string | undefined) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const resetFilters = () => {
        setFilters(initialFilters || {});
    };

    return {
        filters,
        setFilters,
        updateFilter,
        resetFilters,
        getFiltersFromUrl,
    };
};
