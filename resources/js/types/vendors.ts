/**
 * Vendor Management - TypeScript Definitions
 */

// ============================================================
// CORE TYPES
// ============================================================

export type VendorStatus = 'active' | 'inactive';

// ============================================================
// MODELS
// ============================================================

export interface Vendor {
    id: number;
    name: string;
    category: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    npwp: string | null;
    notes: string | null;
    status: VendorStatus;
    created_at: string;
    updated_at: string;

    // Relations
    bank_accounts?: VendorBankAccount[];
    primary_bank_account?: VendorBankAccount | null;
    expenses_count?: number;
}

export interface VendorBankAccount {
    id?: number;
    vendor_id?: number;
    bank_name: string;
    account_number: string;
    account_holder: string;
    is_primary: boolean;
}

// ============================================================
// FORM DATA
// ============================================================

export interface VendorFormData {
    name: string;
    category: string;
    phone: string;
    email: string;
    address: string;
    npwp: string;
    notes: string;
    status: VendorStatus;
    bank_accounts: VendorBankAccount[];
}

// ============================================================
// CONSTANTS
// ============================================================

export const VENDOR_CATEGORIES = [
    { value: 'supplier', label: 'Supplier', classes: 'bg-blue-600 text-white' },
    { value: 'jasa', label: 'Jasa', classes: 'bg-emerald-500 text-white' },
    { value: 'notaris', label: 'Notaris & PPAT', classes: 'bg-violet-500 text-white' },
    { value: 'percetakan', label: 'Percetakan', classes: 'bg-slate-700 text-white' },
    { value: 'transportasi', label: 'Transportasi', classes: 'bg-cyan-600 text-white' },
    { value: 'akomodasi', label: 'Akomodasi', classes: 'bg-teal-500 text-white' },
    { value: 'konsultan', label: 'Konsultan', classes: 'bg-sky-500 text-white' },
    { value: 'pemerintah', label: 'Pemerintah & Instansi', classes: 'bg-amber-500 text-slate-900' },
    { value: 'lainnya', label: 'Lainnya', classes: 'bg-muted text-muted-foreground' },
] as const;

export const VENDOR_CATEGORIES_MAP = Object.fromEntries(VENDOR_CATEGORIES.map((item) => [item.value, item]));
