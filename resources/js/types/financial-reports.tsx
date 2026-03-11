/**
 * Financial Reports - TypeScript Definitions
 */

// ============================================================
// SHARED
// ============================================================

export interface ReportPeriod {
    from: string;
    to: string;
}

export interface ReportAccountItem {
    code: string;
    name: string;
    amount: number;
}

// ============================================================
// LABA RUGI
// ============================================================

export interface LabaRugiMonthly {
    period: string; // 'YYYY-MM'
    label: string; // 'Jan 2026'
    revenue: number;
    expense: number;
    net: number;
}

export interface LabaRugiReport {
    period: ReportPeriod;
    revenue: {
        total: number;
        detail: ReportAccountItem[];
    };
    expense: {
        total: number;
        detail: ReportAccountItem[];
    };
    net_profit: number;
    is_profitable: boolean;
    monthly: LabaRugiMonthly[];
}

// ============================================================
// NERACA
// ============================================================

export interface NeracaReportSection {
    total: number;
    detail: ReportAccountItem[];
}

export interface NeracaReport {
    as_of: string;
    assets: NeracaReportSection;
    liabilities: NeracaReportSection;
    equity: NeracaReportSection;
    total_liabilities_and_equity: number;
    is_balanced: boolean;
}

// ============================================================
// CASH FLOW
// ============================================================

export interface CashFlowMonthly {
    period: string;
    label: string;
    cash_in: number;
    cash_out: number;
    net: number;
}

export interface CashFlowActivity {
    type: string;
    label: string;
    cash_in: number;
    cash_out: number;
    net: number;
}

export interface CashFlowReport {
    period: ReportPeriod;
    cash_in: number;
    cash_out: number;
    net_cashflow: number;
    monthly: CashFlowMonthly[];
    activities: CashFlowActivity[];
}

// ============================================================
// FILTERS
// ============================================================

export interface PeriodFilters {
    from: string;
    to: string;
}

export interface AsOfFilters {
    as_of: string;
}
