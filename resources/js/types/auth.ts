/**
 * Authentication & User Types - TypeScript Definitions
 */

import type { Customer } from './contacts';

// ============================================================
// CORE TYPES
// ============================================================

export type UserStatus = 'active' | 'inactive' | 'suspended';

// ============================================================
// CORE MODELS
// ============================================================

export interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    avatar?: string;
    status: UserStatus;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;

    // Relations
    roles?: string[];
    permissions?: string[];
    customer?: Customer;

    // Computed
    active_project_count?: number;
    max_concurrent_project_count?: number;
}

// ============================================================
// AUTH STATE
// ============================================================

export interface Auth {
    user: User;
}

// ============================================================
// TWO FACTOR AUTHENTICATION
// ============================================================

export interface TwoFactorSetupData {
    svg: string;
    url: string;
}

export interface TwoFactorSecretKey {
    secretKey: string;
}

// ============================================================
// SUMMARY
// ============================================================

export interface UserSummary {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
}

// ============================================================
// CONSTANTS
// ============================================================

export const USER_STATUS = [
    { value: 'active', label: 'Active', classes: 'bg-emerald-500 text-white' },
    { value: 'inactive', label: 'Inactive', classes: 'bg-slate-500 text-white' },
    { value: 'suspended', label: 'Suspended', classes: 'bg-yellow-500 text-white' },
] as const;

export const USER_STATUS_MAP = Object.fromEntries(USER_STATUS.map((item) => [item.value, item]));
