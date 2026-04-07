/**
 * Company & Customer Management - TypeScript Definitions
 */

import type { User } from './auth';

// ============================================================
// CORE TYPES
// ============================================================

export type ContactMessageStatus = 'unread' | 'read' | 'contacted';

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

    // computed
    projects_count?: number;
}

export interface Customer {
    id: number;
    user_id: number | null;
    name: string;
    phone: string | null;
    email: string | null;
    status: string;
    tier: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    user?: User;
    companies?: Company[];
    pivot?: CustomerCompanyPivot;

    // computed
    projects_count?: number;
}

export interface CustomerCompanyPivot {
    company_id: number;
    customer: number;
    is_primary: boolean;
    position_at_company: string | null;
    created_at: string;
    updated_at: string;
}

export interface ContactMessage {
    id: number;
    name: string;
    whatsapp_number: string;
    email: string | null;
    topic: string | null;
    message: string;
    status: ContactMessageStatus;
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
// SUMMARY DATA
// ============================================================

export interface CompanySummary {
    total: number;
    with_customers: number;
    with_npwp: number;
    with_legal_status: number;
}

/** Agregasi keuangan semua project per perusahaan (selaras dengan ringkasan finance per project). */
export interface CompanyFinanceSummary {
    projects_count: number;
    total_budget: number;
    total_contract_invoiced: number;
    total_contract_invoiced_with_tax: number;
    total_contract_paid: number;
    total_contract_paid_with_tax: number;
    total_additional_invoiced: number;
    total_additional_invoiced_with_tax: number;
    total_additional_paid: number;
    total_additional_paid_with_tax: number;
    total_invoiced: number;
    total_invoiced_with_tax: number;
    total_paid: number;
    total_paid_with_tax: number;
    outstanding_amount: number;
    remaining_bill: number;
    total_expenses: number;
    total_billable_expenses: number;
    non_billable_expenses: number;
    contract_profit: number;
    actual_profit: number;
}

export interface CustomerSummary {
    total: number;
    with_account: number;
    with_company: number;
    active: number;
}

export interface ContactMessageSummary {
    total: number;
    unread: number;
    read: number;
    contacted: number;
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

export interface ContactMessageFormData {
    name: string;
    whatsapp_number: string;
    email?: string;
    topic?: string;
    message: string;
}

export interface ContactMessageUpdateStatusFormData {
    status: ContactMessageStatus;
}

// ============================================================
// CONSTANTS
// ============================================================

export const TIER = [
    { value: 'bronze', label: 'Bronze', classes: 'bg-amber-700 text-white' },
    { value: 'silver', label: 'Silver', classes: 'bg-slate-400 text-white' },
    { value: 'gold', label: 'Gold', classes: 'bg-yellow-500 text-white' },
    { value: 'platinum', label: 'Platinum', classes: 'bg-indigo-600 text-white' },
] as const;

export const TIER_MAP = Object.fromEntries(TIER.map((item) => [item.value, item]));

export const CATEGORY_BUSINESS = [
    { value: 'perdagangan', label: 'Perdagangan', classes: 'bg-blue-500 text-white' },
    { value: 'retail', label: 'Retail', classes: 'bg-blue-600 text-white' },
    { value: 'fnb', label: 'Food & Beverage', classes: 'bg-rose-500 text-white' },
    { value: 'jasa', label: 'Jasa', classes: 'bg-emerald-500 text-white' },
    { value: 'manufaktur', label: 'Manufaktur', classes: 'bg-slate-700 text-white' },
    { value: 'konstruksi', label: 'Konstruksi', classes: 'bg-orange-500 text-white' },
    { value: 'properti', label: 'Properti & Real Estate', classes: 'bg-indigo-500 text-white' },
    { value: 'teknologi', label: 'Teknologi Informasi', classes: 'bg-sky-500 text-white' },
    { value: 'telekomunikasi', label: 'Telekomunikasi', classes: 'bg-sky-700 text-white' },
    { value: 'keuangan', label: 'Keuangan', classes: 'bg-amber-500 text-slate-900' },
    { value: 'transportasi', label: 'Transportasi & Logistik', classes: 'bg-cyan-600 text-white' },
    { value: 'pariwisata', label: 'Pariwisata', classes: 'bg-teal-500 text-white' },
    { value: 'perhotelan', label: 'Perhotelan', classes: 'bg-teal-700 text-white' },
    { value: 'kesehatan', label: 'Kesehatan', classes: 'bg-red-500 text-white' },
    { value: 'pendidikan', label: 'Pendidikan', classes: 'bg-violet-500 text-white' },
    { value: 'pertanian', label: 'Pertanian & Perkebunan', classes: 'bg-lime-600 text-white' },
    { value: 'perikanan', label: 'Perikanan', classes: 'bg-blue-400 text-white' },
    { value: 'peternakan', label: 'Peternakan', classes: 'bg-green-700 text-white' },
    { value: 'pertambangan', label: 'Pertambangan', classes: 'bg-stone-700 text-white' },
    { value: 'energi', label: 'Energi', classes: 'bg-yellow-500 text-black' },
    { value: 'industri_kreatif', label: 'Industri Kreatif', classes: 'bg-pink-500 text-white' },
    { value: 'lingkungan', label: 'Lingkungan & Pengolahan Limbah', classes: 'bg-green-600 text-white' },
    { value: 'lainnya', label: 'Lainnya', classes: 'bg-muted text-muted-foreground' },
] as const;

export const CATEGORY_BUSINESS_MAP = Object.fromEntries(CATEGORY_BUSINESS.map((item) => [item.value, item]));

export const STATUS_LEGAL = [
    { value: 'belum_ada', label: 'Belum Ada Legalitas', classes: 'bg-gray-400 text-white' },
    { value: 'pt', label: 'Perseroan Terbatas (PT)', classes: 'bg-indigo-500 text-white' },
    { value: 'pt_perorangan', label: 'PT Perorangan', classes: 'bg-indigo-400 text-white' },
    { value: 'pt_pma', label: 'PT PMA (Penanaman Modal Asing)', classes: 'bg-indigo-700 text-white' },
    { value: 'cv', label: 'Commanditaire Vennootschap (CV)', classes: 'bg-sky-500 text-white' },
    { value: 'firma', label: 'Firma', classes: 'bg-emerald-500 text-white' },
    { value: 'persekutuan_perdata', label: 'Persekutuan Perdata', classes: 'bg-emerald-400 text-white' },
    { value: 'ud', label: 'Usaha Dagang (UD)', classes: 'bg-amber-600 text-white' },
    { value: 'perorangan', label: 'Usaha Perorangan', classes: 'bg-amber-500 text-slate-900' },
    { value: 'koperasi', label: 'Koperasi', classes: 'bg-lime-500 text-slate-900' },
    { value: 'yayasan', label: 'Yayasan', classes: 'bg-violet-500 text-white' },
    { value: 'bumdes', label: 'BUMDes', classes: 'bg-green-600 text-white' },
    { value: 'lainnya', label: 'Lainnya', classes: 'bg-muted text-muted-foreground' },
] as const;

export const STATUS_LEGAL_MAP = Object.fromEntries(STATUS_LEGAL.map((item) => [item.value, item]));

export const CONTACT_MESSAGE_STATUS = [
    { value: 'unread', label: 'Belum Dibaca', classes: 'bg-slate-500 text-white' },
    { value: 'read', label: 'Sudah Dibaca', classes: 'bg-emerald-500 text-white' },
    { value: 'contacted', label: 'Sudah Dihubungi', classes: 'bg-blue-600 text-white' },
] as const;

export const CONTACT_MESSAGE_STATUS_MAP = Object.fromEntries(CONTACT_MESSAGE_STATUS.map((item) => [item.value, item]));
