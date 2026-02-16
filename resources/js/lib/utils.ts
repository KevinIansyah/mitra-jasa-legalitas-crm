import type { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

/**
 * Format date string based on locale
 * @param dateString - ISO date string
 * @param locale - 'id' atau 'en'
 * @param options - Intl.DateTimeFormatOptions (optional)
 */
export function formatDate(dateString: string, locale: 'id' | 'en' = 'id', options?: Intl.DateTimeFormatOptions): string {
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };

    const localeString = locale === 'id' ? 'id-ID' : 'en-US';

    return new Date(dateString).toLocaleDateString(localeString, options || defaultOptions);
}

/**
 * Format date with custom options
 */
export function formatDateTime(dateString: string, locale: 'id' | 'en' = 'id'): string {
    return formatDate(dateString, locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format date short (e.g., "Jan 28, 2026" or "28 Jan 2026")
 */
export function formatDateShort(dateString: string, locale: 'id' | 'en' = 'id'): string {
    return formatDate(dateString, locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Format date for table
 * e.g., "28 Jan 2026" atau "Jan 28, 2026"
 */
export function formatDateTable(dateString: string, locale: 'id' | 'en' = 'id'): string {
    return formatDate(dateString, locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * Format relative time (e.g., "2 days ago", "3 hours ago")
 */
export function formatRelativeTime(dateString: string, locale: 'id' | 'en' = 'id'): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', {
        numeric: 'auto',
    });

    if (diffInSeconds < 60) {
        return rtf.format(-diffInSeconds, 'second');
    } else if (diffInSeconds < 3600) {
        return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (diffInSeconds < 86400) {
        return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (diffInSeconds < 2592000) {
        return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (diffInSeconds < 31536000) {
        return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    } else {
        return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
}
