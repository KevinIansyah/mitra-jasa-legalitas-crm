/**
 * Authentication & User Types - TypeScript Definitions
 */

import type { Customer } from "./contact";

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

    roles?: string[];
    permissions?: string[];
    customer?: Customer;
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
