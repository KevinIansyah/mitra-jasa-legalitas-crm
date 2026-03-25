/**
 * Account Management - TypeScript Definitions
 */

// ============================================================
// CORE TYPES
// ============================================================

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export type AccountCategory = 'cash' | 'bank' | 'receivable' | 'reimbursement' | 'payable' | 'tax' | 'equity' | 'revenue' | 'expense';

export type AccountNormalBalance = 'debit' | 'credit';

export type AccountStatus = 'active' | 'inactive';

// ============================================================
// MODEL
// ============================================================

export interface Account {
    id: number;
    code: string;
    name: string;
    type: AccountType;
    category: AccountCategory;
    normal_balance: AccountNormalBalance;
    is_system: boolean;
    status: AccountStatus;
    journal_lines_count?: number;
    created_at: string;
    updated_at: string;
}

// ============================================================
// FORM DATA
// ============================================================

export interface AccountFormData {
    code: string;
    name: string;
    type: AccountType | '';
    category: AccountCategory | '';
    status?: AccountStatus;
    normal_balance: AccountNormalBalance | '';
}

// ============================================================
// SUMMARY
// ============================================================

export interface AccountSummary {
    total: number;
    active: number;
    inactive: number;
    asset: number;
    liability: number;
    equity: number;
    revenue: number;
    expense: number;
}

// ============================================================
// CONSTANTS
// ============================================================

export const ACCOUNT_TYPES = [
    { value: 'asset', label: 'Aset', classes: 'bg-blue-600 text-white' },
    { value: 'liability', label: 'Kewajiban', classes: 'bg-rose-600 text-white' },
    { value: 'equity', label: 'Ekuitas', classes: 'bg-violet-600 text-white' },
    { value: 'revenue', label: 'Pendapatan', classes: 'bg-emerald-500 text-white' },
    { value: 'expense', label: 'Beban', classes: 'bg-orange-500 text-white' },
];

export const ACCOUNT_TYPES_MAP = Object.fromEntries(ACCOUNT_TYPES.map((item) => [item.value, item]));

export const ACCOUNT_CATEGORIES = [
    { value: 'cash', label: 'Kas', classes: 'bg-blue-600 text-white', forTypes: ['asset'] },
    { value: 'bank', label: 'Bank', classes: 'bg-cyan-600 text-white', forTypes: ['asset'] },
    { value: 'receivable', label: 'Piutang Usaha', classes: 'bg-indigo-600 text-white', forTypes: ['asset'] },
    { value: 'reimbursement', label: 'Piutang Reimburse', classes: 'bg-sky-500 text-white', forTypes: ['asset'] },

    { value: 'payable', label: 'Hutang Usaha', classes: 'bg-rose-600 text-white', forTypes: ['liability'] },
    { value: 'tax', label: 'Pajak', classes: 'bg-pink-600 text-white', forTypes: ['liability'] },

    { value: 'equity', label: 'Modal / Ekuitas', classes: 'bg-violet-600 text-white', forTypes: ['equity'] },

    { value: 'revenue', label: 'Pendapatan', classes: 'bg-emerald-500 text-white', forTypes: ['revenue'] },

    { value: 'expense', label: 'Beban', classes: 'bg-amber-500 text-white', forTypes: ['expense'] },
];

export const ACCOUNT_CATEGORIES_MAP = Object.fromEntries(ACCOUNT_CATEGORIES.map((item) => [item.value, item]));
