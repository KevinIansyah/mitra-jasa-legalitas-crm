/**
 * Estimate Management System - TypeScript Definitions
 */

import type { Customer } from './contacts';
import type { Proposal } from './proposals';
import type { Quote } from './quotes';

// ============================================================
// CORE TYPES
// ============================================================

export type EstimateStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

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
    quote_id: number | null;
    proposal_id: number | null;
    customer_id: number | null;
    version: number;
    is_active: boolean;
    subtotal: string;
    tax_percent: string;
    tax_amount: string;
    discount_percent: string;
    discount_amount: string;
    total_amount: string;
    valid_until: string;
    estimate_date: string;
    status: EstimateStatus;
    notes: string | null;
    rejected_reason: string | null;
    file_path: string | null;
    created_at: string;
    updated_at: string;

    // Computed
    version_label: string;

    // Relations
    items?: EstimateItem[];
    quote?: Quote;
    proposal?: Proposal;
    customer?: Customer;
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
    quote_id: number | null;
    proposal_id: number | null;
    customer_id: number | null;
    valid_until: string;
    estimate_date: string;
    tax_percent: number;
    discount_percent: number;
    notes: string;
    items: EstimateItemFormData[];
}

// ============================================================
// SUMMARY
// ============================================================

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

export const ESTIMATE_STATUSES = [
    { value: 'draft', label: 'Draft', classes: 'bg-slate-500 text-white' },
    { value: 'sent', label: 'Sent', classes: 'bg-blue-500 text-white' },
    { value: 'accepted', label: 'Accepted', classes: 'bg-emerald-500 text-white' },
    { value: 'rejected', label: 'Rejected', classes: 'bg-red-500 text-white' },
    { value: 'expired', label: 'Expired', classes: 'bg-yellow-500 text-white' },
] as const;

export const ESTIMATE_STATUSES_MAP = Object.fromEntries(ESTIMATE_STATUSES.map((item) => [item.value, item]));
