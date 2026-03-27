<?php

namespace App\Services;

use App\Models\Account;
use App\Models\JournalEntryLine;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class FinancialReportService
{
    // ------------------------------------------------------------------------
    // LABA RUGI
    // ------------------------------------------------------------------------

    /**
     * Laporan Laba Rugi untuk periode tertentu.
     *
     * Pendapatan  = semua akun type 'revenue'  → sum credit - debit
     * Beban       = semua akun type 'expense'  → sum debit - credit
     * Laba Bersih = Pendapatan - Beban
     */
    public static function labaRugi(Carbon $from, Carbon $to): array
    {
        $lines = JournalEntryLine::with(['account', 'journalEntry'])
            ->whereHas('journalEntry', fn($q) => $q->whereBetween('date', [$from, $to]))
            ->whereHas('account', fn($q) => $q->whereIn('type', ['revenue', 'expense']))
            ->get();

        $revenueLines = $lines->filter(fn($l) => $l->account->type === 'revenue');
        $expenseLines = $lines->filter(fn($l) => $l->account->type === 'expense');

        $revenueDetail = self::groupByAccount($revenueLines, 'credit');
        $expenseDetail = self::groupByAccount($expenseLines, 'debit');

        $totalRevenue = $revenueDetail->sum('amount');
        $totalExpense = $expenseDetail->sum('amount');
        $netProfit    = $totalRevenue - $totalExpense;

        $monthly = self::labaRugiMonthly($from, $to, $lines);

        return [
            'period' => [
                'from' => $from->toDateString(),
                'to'   => $to->toDateString(),
            ],
            'revenue' => [
                'total'  => $totalRevenue,
                'detail' => $revenueDetail->values(),
            ],
            'expense' => [
                'total'  => $totalExpense,
                'detail' => $expenseDetail->values(),
            ],
            'net_profit'    => $netProfit,
            'is_profitable' => $netProfit >= 0,
            'monthly'       => $monthly,
        ];
    }

    /**
     * Monthly breakdown: pendapatan dan beban per bulan.
     */
    private static function labaRugiMonthly(Carbon $from, Carbon $to, Collection $lines): array
    {
        // Build all months in range as keys
        $cursor  = $from->copy()->startOfMonth();
        $months  = [];
        while ($cursor->lte($to)) {
            $months[$cursor->format('Y-m')] = [
                'period'  => $cursor->format('Y-m'),
                'label'   => $cursor->translatedFormat('F Y'),
                'revenue' => 0.0,
                'expense' => 0.0,
                'net'     => 0.0,
            ];
            $cursor->addMonth();
        }

        foreach ($lines as $line) {
            $period = Carbon::parse($line->journalEntry->date)->format('Y-m');
            if (! isset($months[$period])) continue;

            if ($line->account->type === 'revenue') {
                $months[$period]['revenue'] += (float) $line->credit - (float) $line->debit;
            } else {
                $months[$period]['expense'] += (float) $line->debit - (float) $line->credit;
            }
        }

        foreach ($months as &$m) {
            $m['net'] = $m['revenue'] - $m['expense'];
        }

        return array_values($months);
    }

    // ------------------------------------------------------------------------
    // NERACA
    // ------------------------------------------------------------------------

    /**
     * Laporan Neraca per tanggal tertentu.
     *
     * Saldo akun dihitung dari semua jurnal sampai tanggal tersebut.
     * Asset (normal debit)     = sum debit - sum credit
     * Liability (normal credit) = sum credit - sum debit
     * Equity (normal credit)    = sum credit - sum debit
     *
     * Persamaan: Total Asset = Total Liability + Total Equity
     */
    public static function neraca(Carbon $asOf): array
    {
        $accounts = Account::with([
            'journalLines' => fn($q) =>
            $q->whereHas(
                'journalEntry',
                fn($j) =>
                $j->whereDate('date', '<=', $asOf)
            )
        ])
            ->where('status', 'active')
            ->get();

        $calcBalance = fn(Account $account): float =>
        $account->normal_balance === 'debit'
            ? (float) $account->journalLines->sum('debit') - (float) $account->journalLines->sum('credit')
            : (float) $account->journalLines->sum('credit') - (float) $account->journalLines->sum('debit');

        $groupAccounts = fn(string $type): Collection =>
        $accounts->where('type', $type)
            ->map(fn($a) => [
                'code'    => $a->code,
                'name'    => $a->name,
                'amount' => $calcBalance($a),
            ])
            ->filter(fn($a) => $a['amount'] != 0)
            ->values();

        $assets      = $groupAccounts('asset');
        $liabilities = $groupAccounts('liability');
        $equity      = $groupAccounts('equity');

        $totalAssets      = $assets->sum('amount');
        $totalLiabilities = $liabilities->sum('amount');
        $totalEquity      = $equity->sum('amount');

        $revenues         = $groupAccounts('revenue');
        $expenses         = $groupAccounts('expense');
        $currentNetIncome = $revenues->sum('amount') - $expenses->sum('amount');

        if (round($currentNetIncome, 2) !== 0.0) {
            $label = $currentNetIncome >= 0 ? 'Laba Berjalan' : 'Rugi Berjalan';
            $equity->push([
                'code'    => '-',
                'name'    => $label,
                'amount' => $currentNetIncome,
            ]);
            $totalEquity += $currentNetIncome;
        }

        return [
            'as_of' => $asOf->toDateString(),
            'assets' => [
                'total'  => $totalAssets,
                'detail' => $assets,
            ],
            'liabilities' => [
                'total'  => $totalLiabilities,
                'detail' => $liabilities,
            ],
            'equity' => [
                'total'  => $totalEquity,
                'detail' => $equity,
            ],
            'total_liabilities_and_equity' => $totalLiabilities + $totalEquity,
            'is_balanced' => round($totalAssets, 2) === round($totalLiabilities + $totalEquity, 2),
        ];
    }

    // ------------------------------------------------------------------------
    // CASH FLOW
    // ------------------------------------------------------------------------

    /**
     * Laporan Arus Kas untuk periode tertentu.
     *
     * Cash In  = semua debit pada akun cash & bank
     * Cash Out = semua credit pada akun cash & bank
     *
     * Dikelompokkan per bulan dan per reference_type untuk detail aktivitas.
     */
    public static function cashFlow(Carbon $from, Carbon $to): array
    {
        $lines = JournalEntryLine::with(['account', 'journalEntry'])
            ->whereHas('journalEntry', fn($q) => $q->whereBetween('date', [$from, $to]))
            ->whereHas('account', fn($q) => $q->whereIn('category', ['cash', 'bank']))
            ->get();

        $cashIn  = (float) $lines->sum('debit');
        $cashOut = (float) $lines->sum('credit');

        $cursor = $from->copy()->startOfMonth();
        $months = [];
        while ($cursor->lte($to)) {
            $months[$cursor->format('Y-m')] = [
                'period'   => $cursor->format('Y-m'),
                'label'    => $cursor->translatedFormat('F Y'),
                'cash_in'  => 0.0,
                'cash_out' => 0.0,
                'net'      => 0.0,
            ];
            $cursor->addMonth();
        }

        foreach ($lines as $line) {
            $period = Carbon::parse($line->journalEntry->date)->format('Y-m');
            if (! isset($months[$period])) continue;
            $months[$period]['cash_in']  += (float) $line->debit;
            $months[$period]['cash_out'] += (float) $line->credit;
        }

        foreach ($months as &$m) {
            $m['net'] = $m['cash_in'] - $m['cash_out'];
        }

        $activities = $lines
            ->groupBy(fn($l) => $l->journalEntry->reference_type)
            ->map(fn($group, $type) => [
                'type'     => $type,
                'label'    => self::referenceTypeLabel($type),
                'cash_in'  => (float) $group->sum('debit'),
                'cash_out' => (float) $group->sum('credit'),
                'net'      => (float) $group->sum('debit') - (float) $group->sum('credit'),
            ])
            ->values();

        return [
            'period' => [
                'from' => $from->toDateString(),
                'to'   => $to->toDateString(),
            ],
            'cash_in'      => $cashIn,
            'cash_out'     => $cashOut,
            'net_cashflow' => $cashIn - $cashOut,
            'monthly'      => array_values($months),
            'activities'   => $activities,
        ];
    }

    // ------------------------------------------------------------------------
    // PRIVATE HELPERS
    // ------------------------------------------------------------------------

    /**
     * Group journal lines by account, sum amount berdasarkan kolom yang ditentukan.
     */
    private static function groupByAccount(Collection $lines, string $column): Collection
    {
        return $lines
            ->groupBy('account_id')
            ->map(fn($group) => [
                'code'   => $group->first()->account->code,
                'name'   => $group->first()->account->name,
                'amount' => (float) $group->sum($column),
            ])
            ->filter(fn($item) => $item['amount'] > 0)
            ->values();
    }

    /**
     * Label human-readable untuk reference_type.
     */
    private static function referenceTypeLabel(string $type): string
    {
        return match ($type) {
            'invoice'          => 'Penagihan Invoice',
            'payment'          => 'Pembayaran dari Client',
            'expense'          => 'Pengeluaran',
            'opening_balance'  => 'Saldo Awal',
            'manual'           => 'Jurnal Manual',
            default            => ucfirst($type),
        };
    }
}
