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

// ============================================================
// CONSTANTS
// ============================================================

export const TIER_VARIANT_MAP: Record<string, string> = {
    bronze: 'bg-amber-700 text-white',
    silver: 'bg-slate-400 text-slate-900',
    gold: 'bg-yellow-500 text-white',
    platinum: 'bg-indigo-600 text-white',
} as const;

export const CATEGORY_BUSINESS = [
    { value: 'perdagangan', label: 'Perdagangan', className: 'bg-blue-500 text-white' },
    { value: 'retail', label: 'Retail', className: 'bg-blue-600 text-white' },
    { value: 'fnb', label: 'Food & Beverage', className: 'bg-rose-500 text-white' },
    { value: 'jasa', label: 'Jasa', className: 'bg-emerald-500 text-white' },
    { value: 'manufaktur', label: 'Manufaktur', className: 'bg-slate-700 text-white' },
    { value: 'konstruksi', label: 'Konstruksi', className: 'bg-orange-500 text-white' },
    { value: 'properti', label: 'Properti & Real Estate', className: 'bg-indigo-500 text-white' },
    { value: 'teknologi', label: 'Teknologi Informasi', className: 'bg-sky-500 text-white' },
    { value: 'telekomunikasi', label: 'Telekomunikasi', className: 'bg-sky-700 text-white' },
    { value: 'keuangan', label: 'Keuangan', className: 'bg-amber-500 text-slate-900' },
    { value: 'transportasi', label: 'Transportasi & Logistik', className: 'bg-cyan-600 text-white' },
    { value: 'pariwisata', label: 'Pariwisata', className: 'bg-teal-500 text-white' },
    { value: 'perhotelan', label: 'Perhotelan', className: 'bg-teal-700 text-white' },
    { value: 'kesehatan', label: 'Kesehatan', className: 'bg-red-500 text-white' },
    { value: 'pendidikan', label: 'Pendidikan', className: 'bg-violet-500 text-white' },
    { value: 'pertanian', label: 'Pertanian & Perkebunan', className: 'bg-lime-600 text-white' },
    { value: 'perikanan', label: 'Perikanan', className: 'bg-blue-400 text-white' },
    { value: 'peternakan', label: 'Peternakan', className: 'bg-green-700 text-white' },
    { value: 'pertambangan', label: 'Pertambangan', className: 'bg-stone-700 text-white' },
    { value: 'energi', label: 'Energi', className: 'bg-yellow-500 text-black' },
    { value: 'industri_kreatif', label: 'Industri Kreatif', className: 'bg-pink-500 text-white' },
    { value: 'lingkungan', label: 'Lingkungan & Pengolahan Limbah', className: 'bg-green-600 text-white' },
    { value: 'lainnya', label: 'Lainnya', className: 'bg-muted text-muted-foreground' },
] as const;

export const CATEGORY_BUSINESS_MAP = Object.fromEntries(CATEGORY_BUSINESS.map((item) => [item.value, item]));

export const STATUS_LEGAL = [
    { value: 'belum_ada', label: 'Belum Ada Legalitas', className: 'bg-gray-400 text-white' },
    { value: 'pt', label: 'Perseroan Terbatas (PT)', className: 'bg-indigo-500 text-white' },
    { value: 'pt_perorangan', label: 'PT Perorangan', className: 'bg-indigo-400 text-white' },
    { value: 'pt_pma', label: 'PT PMA (Penanaman Modal Asing)', className: 'bg-indigo-700 text-white' },
    { value: 'cv', label: 'Commanditaire Vennootschap (CV)', className: 'bg-sky-500 text-white' },
    { value: 'firma', label: 'Firma', className: 'bg-emerald-500 text-white' },
    { value: 'persekutuan_perdata', label: 'Persekutuan Perdata', className: 'bg-emerald-400 text-white' },
    { value: 'ud', label: 'Usaha Dagang (UD)', className: 'bg-amber-600 text-white' },
    { value: 'perorangan', label: 'Usaha Perorangan', className: 'bg-amber-500 text-slate-900' },
    { value: 'koperasi', label: 'Koperasi', className: 'bg-lime-500 text-slate-900' },
    { value: 'yayasan', label: 'Yayasan', className: 'bg-violet-500 text-white' },
    { value: 'bumdes', label: 'BUMDes', className: 'bg-green-600 text-white' },
    { value: 'lainnya', label: 'Lainnya', className: 'bg-muted text-muted-foreground' },
] as const;

export const STATUS_LEGAL_MAP = Object.fromEntries(STATUS_LEGAL.map((item) => [item.value, item]));
