/**
 * Navigation Types
 */

import type { LucideIcon } from 'lucide-react';

// ============================================================
// BREADCRUMB
// ============================================================

export interface BreadcrumbItem {
    title: string;
    href: string;
}

// ============================================================
// SIDEBAR NAVIGATION
// ============================================================

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;

    /** Required permission(s) to display the item */
    permission?: string | string[];

    /** Nested navigation items */
    items?: NavItem[];
}

export interface NavSection {
    title: string;
    items: NavItem[];
}
