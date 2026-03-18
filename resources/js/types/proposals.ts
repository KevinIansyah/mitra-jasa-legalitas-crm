/**
 * Proposal Management System - TypeScript Definitions
 */

import type { Customer } from './contacts';

// ============================================================
// CORE TYPES
// ============================================================

export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

// ============================================================
// MODELS
// ============================================================

export interface ProposalItem {
    id: number;
    proposal_id: number;
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

export interface Proposal {
    id: number;
    proposal_number: string;
    customer_id: number;
    project_name: string;
    subtotal: string;
    tax_percent: string;
    tax_amount: string;
    discount_percent: string;
    discount_amount: string;
    total_amount: string;
    proposal_date: string;
    valid_until: string | null;
    status: ProposalStatus;
    notes: string | null;
    rejected_reason: string | null;
    file_path: string | null;
    created_at: string;
    updated_at: string;

    // Computed
    is_expired: boolean;
    estimates_count: number;

    // Relations
    items?: ProposalItem[];
    customer?: Customer;
}

// ============================================================
// FORM DATA
// ============================================================

export interface ProposalItemFormData {
    description: string;
    quantity: number;
    unit_price: number;
    tax_percent: number;
    discount_percent: number;
}

export interface ProposalFormData {
    customer_id: number | null;
    project_name: string;
    proposal_date: string;
    valid_until: string;
    tax_percent: number;
    discount_percent: number;
    notes: string;
    items: ProposalItemFormData[];
}

// ============================================================
// SUMMARY
// ============================================================

export type ProposalSummaryData = {
    total: number;
    draft: number;
    sent: number;
    accepted: number;
    rejected: number;
    revised: number;
    total_amount: string;
    accepted_amount: string;
};

// ============================================================
// CONSTANTS
// ============================================================

export const PROPOSAL_STATUSES = [
    { value: 'draft', label: 'Draft', classes: 'bg-slate-500 text-white' },
    { value: 'sent', label: 'Sent', classes: 'bg-blue-500 text-white' },
    { value: 'accepted', label: 'Accepted', classes: 'bg-emerald-500 text-white' },
    { value: 'rejected', label: 'Rejected', classes: 'bg-red-500 text-white' },
] as const;

export const PROPOSAL_STATUSES_MAP = Object.fromEntries(PROPOSAL_STATUSES.map((item) => [item.value, item]));
