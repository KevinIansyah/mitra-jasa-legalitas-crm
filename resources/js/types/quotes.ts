import type { User } from './auth';
import type { Customer } from './contacts';
import type { Project } from './projects';
import type { Service, ServicePackage } from './service';

// ============================================================
// CORE TYPES
// ============================================================

export type QuoteStatus = 'pending' | 'contacted' | 'estimated' | 'accepted' | 'rejected' | 'converted';
export type QuoteTimeline = 'normal' | 'priority' | 'express';
export type QuoteBudgetRange = 'under_5jt' | '5_10jt' | '10_25jt' | '25_50jt' | 'above_50jt';
export type QuoteSource = 'portal' | 'whatsapp' | 'referral' | 'other';
export type EstimateStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

// ============================================================
// MODELS
// ============================================================

export interface EstimateItem {
    id: number;
    estimate_id: number;
    description: string;
    quantity: string;
    unit_price: string;
    tax_percent: string;
    discount_percent: string;
    subtotal: string;
    discount_amount: string;
    tax_amount: string;
    total_amount: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface Estimate {
    id: number;
    estimate_number: string;
    quote_id: number;
    version: number;
    is_active: boolean;
    subtotal: string;
    tax_percent: string;
    tax_amount: string;
    discount_percent: string;
    discount_amount: string;
    total_amount: string;
    valid_until: string | null;
    status: EstimateStatus;
    notes: string | null;
    rejected_reason: string | null;
    created_at: string;
    updated_at: string;

    // Computed
    version_label: string;
    is_expired: boolean;

    // Relations
    items?: EstimateItem[];
    quote?: Quote;
}

export interface Quote {
    id: number;
    reference_number: string;
    user_id: number;
    customer_id: number | null;
    project_id: number | null;
    service_id: number | null;
    service_package_id: number | null;
    project_name: string;
    description: string | null;
    business_type: string | null;
    business_legal_status: string | null;
    timeline: QuoteTimeline;
    budget_range: QuoteBudgetRange | null;
    source: QuoteSource;
    status: QuoteStatus;
    rejected_reason: string | null;
    notes: string | null;
    contacted_at: string | null;
    converted_at: string | null;
    created_at: string;
    updated_at: string;

    // Computed
    is_convertible: boolean;

    // Relations
    user?: User;
    customer?: Customer;
    project?: Project;
    service?: Service;
    service_package?: ServicePackage;
    estimates?: Estimate[];
    active_estimate?: Estimate | null;
}

// ============================================================
// FORM DATA
// ============================================================

export interface EstimateItemFormData {
    description: string;
    quantity: number;
    unit_price: number;
    tax_percent: number;
    discount_percent: number;
}

export interface EstimateFormData {
    quote_id: number;
    valid_until: string;
    tax_percent: number;
    discount_percent: number;
    notes: string;
    items: EstimateItemFormData[];
}

// ============================================================
// SUMMARY
// ============================================================

export interface QuoteSummary {
    total: number;
    pending: number;
    contacted: number;
    estimated: number;
    accepted: number;
    rejected: number;
    converted: number;
}

export type EstimateSummaryData = {
    total: number;
    draft: number;
    sent: number;
    accepted: number;
    rejected: number;
    total_amount: string;
    accepted_amount: string;
};

// ============================================================
// CONSTANTS
// ============================================================

export const QUOTE_STATUSES = [
    { value: 'pending', label: 'Pending', classes: 'bg-yellow-500 text-white' },
    { value: 'contacted', label: 'Contacted', classes: 'bg-blue-500 text-white' },
    { value: 'estimated', label: 'Estimated', classes: 'bg-indigo-500 text-white' },
    { value: 'accepted', label: 'Accepted', classes: 'bg-emerald-500 text-white' },
    { value: 'rejected', label: 'Rejected', classes: 'bg-red-500 text-white' },
    { value: 'converted', label: 'Converted', classes: 'bg-slate-600 text-white' },
] as const;

export const QUOTE_STATUSES_MAP = Object.fromEntries(QUOTE_STATUSES.map((item) => [item.value, item]));

export const QUOTE_TIMELINES = [
    { value: 'normal', label: 'Normal', classes: 'bg-slate-500 text-white' },
    { value: 'priority', label: 'Priority (+30%)', classes: 'bg-orange-500 text-white' },
    { value: 'express', label: 'Express (+50%)', classes: 'bg-red-500 text-white' },
] as const;

export const QUOTE_TIMELINES_MAP = Object.fromEntries(QUOTE_TIMELINES.map((item) => [item.value, item]));

export const QUOTE_BUDGET_RANGES = [
    { value: 'under_5jt', label: '< Rp 5 Juta' },
    { value: '5_10jt', label: 'Rp 5 - 10 Juta' },
    { value: '10_25jt', label: 'Rp 10 - 25 Juta' },
    { value: '25_50jt', label: 'Rp 25 - 50 Juta' },
    { value: 'above_50jt', label: '> Rp 50 Juta' },
] as const;

export const QUOTE_BUDGET_RANGES_MAP = Object.fromEntries(QUOTE_BUDGET_RANGES.map((item) => [item.value, item]));

export const QUOTE_SOURCES = [
    { value: 'portal', label: 'Portal' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'referral', label: 'Referral' },
    { value: 'other', label: 'Lainnya' },
] as const;

export const QUOTE_SOURCES_MAP = Object.fromEntries(QUOTE_SOURCES.map((item) => [item.value, item]));

export const ESTIMATE_STATUSES = [
    { value: 'draft', label: 'Draft', classes: 'bg-slate-500 text-white' },
    { value: 'sent', label: 'Sent', classes: 'bg-blue-500 text-white' },
    { value: 'accepted', label: 'Accepted', classes: 'bg-emerald-500 text-white' },
    { value: 'rejected', label: 'Rejected', classes: 'bg-red-500 text-white' },
] as const;

export const ESTIMATE_STATUSES_MAP = Object.fromEntries(ESTIMATE_STATUSES.map((item) => [item.value, item]));
