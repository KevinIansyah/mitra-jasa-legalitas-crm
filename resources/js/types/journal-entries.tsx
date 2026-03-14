/**
 * Journal Entry - TypeScript Definitions
 */

import type { Account } from './account';

// ============================================================
// CORE TYPES
// ============================================================

export type JournalReferenceType = 'invoice' | 'payment' | 'expense' | 'opening_balance' | 'manual';

// ============================================================
// MODELS
// ============================================================

export interface JournalEntryLine {
    id: number;
    journal_entry_id: number;
    account_id: number;
    debit: string;
    credit: string;
    notes: string | null;
    account?: Account;
}

export interface JournalEntry {
    id: number;
    date: string;
    description: string;
    reference_type: JournalReferenceType;
    reference_id: number | null;
    created_at: string;
    updated_at: string;
    lines?: JournalEntryLine[];
}

export interface JournalSummary {
    total: number;
    this_month: number;
    manual_count: number;
    auto_count: number;
}

// ============================================================
// FORM DATA
// ============================================================

export interface JournalLineFormData {
    account_id: number | '';
    debit: number;
    credit: number;
    notes: string;
}

export interface ManualJournalFormData {
    date: string;
    description: string;
    lines: JournalLineFormData[];
}

export interface ManualJournalFormErrors {
    date?: string;
    description?: string;
    lines?: string;
    [key: string]: string | undefined;
}

export interface OpeningBalanceItemFormData {
    account_id: number | '';
    balance: number;
}

export interface OpeningBalanceFormData {
    date: string;
    balances: OpeningBalanceItemFormData[];
}

export interface OpeningBalanceFormErrors {
    date?: string;
    balances?: string;
    [key: string]: string | undefined;
}

// ============================================================
// EXISTING OPENING BALANCE
// ============================================================

export interface OpeningBalanceItem {
    account_id: number;
    account_code: string;
    account_name: string;
    account_type: string;
    normal_balance: 'debit' | 'credit';
    balance: number;
}

export interface ExistingOpeningBalance {
    date: string;
    balances: OpeningBalanceItem[];
}

// ============================================================
// CONSTANTS
// ============================================================

export const JOURNAL_REFERENCE_TYPES = [
    { value: 'invoice', label: 'Invoice', classes: 'bg-blue-600 text-white' },
    { value: 'payment', label: 'Pembayaran', classes: 'bg-emerald-500 text-white' },
    { value: 'expense', label: 'Pengeluaran', classes: 'bg-orange-500 text-white' },
    { value: 'opening_balance', label: 'Saldo Awal', classes: 'bg-violet-500 text-white' },
    { value: 'manual', label: 'Jurnal Manual', classes: 'bg-slate-600 text-white' },
] as const;

export const JOURNAL_REFERENCE_TYPES_MAP = Object.fromEntries(JOURNAL_REFERENCE_TYPES.map((item) => [item.value, item]));
