/**
 * Shared Application Types
 */

// Re-export module types
export type * from './auth';
export type * from './navigation';
export type * from './ui';

import type { Auth } from './auth';

// ============================================================
// SHARED DATA (Inertia / Global Page Props)
// ============================================================

export interface SharedData {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;

    flash?: {
        success?: string;
        error?: string;
    };

    [key: string]: unknown;
}
