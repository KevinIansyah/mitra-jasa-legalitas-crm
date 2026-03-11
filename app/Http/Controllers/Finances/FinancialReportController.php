<?php

namespace App\Http\Controllers\Finances;

use App\Http\Controllers\Controller;
use App\Services\FinancialReportService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;

class FinancialReportController extends Controller
{
    public function labaRugi(Request $request)
    {
        $request->validate([
            'from' => 'nullable|date',
            'to'   => 'nullable|date|after_or_equal:from',
        ]);

        $from = $request->filled('from')
            ? Carbon::parse($request->from)->startOfDay()
            : Carbon::now()->startOfMonth();

        $to = $request->filled('to')
            ? Carbon::parse($request->to)->endOfDay()
            : Carbon::now()->endOfMonth();

        $report = FinancialReportService::labaRugi($from, $to);

        return Inertia::render('finances/reports/profit-loss', [
            'report'  => $report,
            'filters' => [
                'from' => $from->toDateString(),
                'to'   => $to->toDateString(),
            ],
        ]);
    }

    public function neraca(Request $request)
    {
        $request->validate([
            'as_of' => 'nullable|date',
        ]);

        $asOf = $request->filled('as_of')
            ? Carbon::parse($request->as_of)->endOfDay()
            : Carbon::now()->endOfDay();

        $report = FinancialReportService::neraca($asOf);

        return Inertia::render('finances/reports/balance-sheet', [
            'report'  => $report,
            'filters' => [
                'as_of' => $asOf->toDateString(),
            ],
        ]);
    }

    public function cashFlow(Request $request)
    {
        $request->validate([
            'from' => 'nullable|date',
            'to'   => 'nullable|date|after_or_equal:from',
        ]);

        $from = $request->filled('from')
            ? Carbon::parse($request->from)->startOfDay()
            : Carbon::now()->startOfMonth();

        $to = $request->filled('to')
            ? Carbon::parse($request->to)->endOfDay()
            : Carbon::now()->endOfMonth();

        $report = FinancialReportService::cashFlow($from, $to);

        return Inertia::render('finances/reports/cash-flow', [
            'report'  => $report,
            'filters' => [
                'from' => $from->toDateString(),
                'to'   => $to->toDateString(),
            ],
        ]);
    }

    public function labaRugiPdf(Request $request)
    {
        $request->validate([
            'from' => 'nullable|date',
            'to'   => 'nullable|date|after_or_equal:from',
        ]);

        $from   = Carbon::parse($request->filled('from') ? $request->from : now()->startOfMonth())->startOfDay();
        $to     = Carbon::parse($request->filled('to')   ? $request->to   : now()->endOfMonth())->endOfDay();
        $report = FinancialReportService::labaRugi($from, $to);

        return Pdf::loadView('pdf.finances.reports.profit-loss', compact('report'))
            ->setPaper('a4', 'portrait')
            ->download('laba-rugi-' . $from->format('Ymd') . '-' . $to->format('Ymd') . '.pdf');
    }

    public function neracaPdf(Request $request)
    {
        $request->validate(['as_of' => 'nullable|date']);

        $asOf   = Carbon::parse($request->filled('as_of') ? $request->as_of : now())->endOfDay();
        $report = FinancialReportService::neraca($asOf);

        return Pdf::loadView('pdf.finances.reports.balance-sheet', compact('report'))
            ->setPaper('a4', 'portrait')
            ->download('neraca-' . $asOf->format('Ymd') . '.pdf');
    }

    public function cashFlowPdf(Request $request)
    {
        $request->validate([
            'from' => 'nullable|date',
            'to'   => 'nullable|date|after_or_equal:from',
        ]);

        $from   = Carbon::parse($request->filled('from') ? $request->from : now()->startOfMonth())->startOfDay();
        $to     = Carbon::parse($request->filled('to')   ? $request->to   : now()->endOfMonth())->endOfDay();
        $report = FinancialReportService::cashFlow($from, $to);

        return Pdf::loadView('finances.reports.cash-flow', compact('report'))
            ->setPaper('a4', 'portrait')
            ->download('arus-kas-' . $from->format('Ymd') . '-' . $to->format('Ymd') . '.pdf');
    }
}
