/**
 * Expense Management - TypeScript Definitions
 */

import type { User } from './auth';
import type { Project, ProjectInvoice } from './project';

// ============================================================
// CORE TYPES
// ============================================================

export type ExpenseCategory =
    | 'transportasi'
    | 'akomodasi'
    | 'konsumsi'
    | 'material'
    | 'atk'
    | 'operasional'
    | 'perizinan'
    | 'notaris'
    | 'jasa_profesional'
    | 'pihak_ketiga'
    | 'pengiriman'
    | 'cetak'
    | 'pajak'
    | 'administrasi'
    | 'lainnya';

// ============================================================
// MODELS
// ============================================================

export interface Expense {
    id: number;
    project_id: number | null;
    invoice_id: number | null;
    user_id: number | null;
    category: ExpenseCategory;
    description: string;
    amount: string;
    expense_date: string;
    receipt_file: string | null;
    is_billable: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    // Computed
    receipt_url?: string | null;

    // Relations
    project?: Project;
    invoice?: ProjectInvoice;
    user?: User;
}

// ============================================================
// FORM DATA
// ============================================================

export interface ExpenseFormData {
    project_id?: number | null;
    category: string;
    description: string;
    amount: number;
    expense_date: string;
    receipt_file?: File | null;
    remove_receipt_file?: boolean;
    is_billable?: boolean;
}

// ============================================================
// FILTER PARAMS
// ============================================================

export interface ExpenseFilterParams {
    project_id?: number | null;
    category?: ExpenseCategory;
    is_billable?: boolean;
    is_billed?: boolean;
    date_from?: string;
    date_to?: string;
    search?: string;
    page?: number;
    per_page?: number;
}

// ============================================================
// CONSTANTS
// ============================================================

export const EXPENSE_CATEGORIES = [
    { value: 'transportasi', label: 'Transportasi', classes: 'bg-cyan-600 text-white' },
    { value: 'akomodasi', label: 'Akomodasi', classes: 'bg-teal-500 text-white' },
    { value: 'konsumsi', label: 'Konsumsi', classes: 'bg-rose-500 text-white' },
    { value: 'material', label: 'Material', classes: 'bg-slate-600 text-white' },
    { value: 'atk', label: 'ATK & Perlengkapan', classes: 'bg-indigo-500 text-white' },
    { value: 'operasional', label: 'Operasional', classes: 'bg-emerald-500 text-white' },
    { value: 'perizinan', label: 'Perizinan', classes: 'bg-orange-500 text-white' },
    { value: 'notaris', label: 'Notaris', classes: 'bg-violet-500 text-white' },
    { value: 'jasa_profesional', label: 'Jasa Profesional', classes: 'bg-sky-500 text-white' },
    { value: 'pihak_ketiga', label: 'Jasa Pihak Ketiga', classes: 'bg-blue-600 text-white' },
    { value: 'pengiriman', label: 'Pengiriman & Kurir', classes: 'bg-blue-500 text-white' },
    { value: 'cetak', label: 'Cetak & Fotokopi', classes: 'bg-slate-700 text-white' },
    { value: 'pajak', label: 'Pajak & Biaya Pemerintah', classes: 'bg-amber-500 text-slate-900' },
    { value: 'administrasi', label: 'Administrasi', classes: 'bg-slate-500 text-white' },
    { value: 'lainnya', label: 'Lain-lain', classes: 'bg-muted text-muted-foreground' },
] as const;

export const EXPENSE_CATEGORIES_MAP = Object.fromEntries(EXPENSE_CATEGORIES.map((item) => [item.value, item]));
