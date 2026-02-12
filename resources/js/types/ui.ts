/**
 * Layout Component Props
 */

import type { ReactNode } from 'react';
import type { BreadcrumbItem } from './navigation';

// ============================================================
// APP LAYOUT
// ============================================================

export interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

// ============================================================
// AUTH LAYOUT
// ============================================================

export interface AuthLayoutProps {
    children?: ReactNode;
    name?: string;
    title?: string;
    description?: string;
}
