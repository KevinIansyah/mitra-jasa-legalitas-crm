/**
 * Company & Customer Management - TypeScript Definitions
 */

import type { User } from './auth';

// ============================================================
// CORE MODELS
// ============================================================

export interface Company {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    website: string | null;
    address: string | null;
    city: string | null;
    province: string | null;
    postal_code: string | null;
    npwp: string | null;
    status_legal: string | null;
    category_business: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    customers?: Customer[];
    customers_count?: number;
}

export interface Customer {
    id: number;
    user_id: number | null;
    name: string;
    phone: string | null;
    email: string | null;
    status: string | null;
    tier: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    user?: User;
    companies?: Company[];
    pivot?: CustomerCompanyPivot;
}

export interface CustomerCompanyPivot {
    company_id: number;
    customer: number;
    is_primary: boolean;
    position_at_company: string | null;
    created_at: string;
    updated_at: string;
}

// ============================================================
// EXTENDED INTERFACES
// ============================================================

export interface CompanyWithCustomers extends Company {
    customers: Array<Customer & { pivot: CustomerCompanyPivot }>;
}

export interface CustomersWithCompanies extends Customer {
    companies: Array<Company & { pivot: CustomerCompanyPivot }>;
}

// ============================================================
// FORM DATA TYPES
// ============================================================

export interface CompanyFormData {
    name: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    npwp?: string;
    status_legal?: string;
    category_business?: string;
    notes?: string;
}

export interface CustomerFormData {
    user_id?: number | null;
    name: string;
    phone?: string;
    email?: string;
    status?: string;
    tier?: string;
    notes?: string;
}

export interface AttachCustomerToCompanyFormData {
    customer_id: number;
    is_primary?: boolean;
    position_at_company?: string;
}

export interface SyncCustomerToCompanyFormData {
    customers: Array<{
        customer_id: number;
        is_primary?: boolean;
        position_at_company?: string;
    }>;
}
