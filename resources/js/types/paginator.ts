/**
 * Pagination Types
 */

// ============================================================
// PAGINATOR (Laravel-style Pagination)
// ============================================================

export interface Paginator<T> {
    data: T[];

    current_page: number;
    last_page: number;
    per_page: number;
    total: number;

    from: number | null;
    to: number | null;

    prev_page_url: string | null;
    next_page_url: string | null;

    path: string;
    first_page_url: string;
    last_page_url: string;
}
