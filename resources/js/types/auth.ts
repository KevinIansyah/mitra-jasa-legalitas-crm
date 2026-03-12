/**
 * Authentication & User Types - TypeScript Definitions
 */

import type { Customer } from './contact';

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
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;

    // Relations
    roles?: string[];
    permissions?: string[];
    customer?: Customer;

    // Computed
    active_projects_count?: number;
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
