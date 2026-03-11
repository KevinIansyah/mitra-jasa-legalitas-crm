<?php

namespace App\Http\Controllers\Finances;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finances\JournalEntries\StoreRequest;
use App\Http\Requests\Finances\JournalEntries\UpdateRequest;
use App\Models\Account;
use App\Models\JournalEntry;
use App\Services\JournalService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ManualJournalController extends Controller
{
    public function index(Request $request)
    {

        $search         = $request->get('search');
        $from           = $request->get('from');
        $to             = $request->get('to');
        $referenceType  = $request->get('reference_type');

        $entries = JournalEntry::with(['lines.account'])
            ->when($search,        fn($q) => $q->where('description', 'like', "%{$search}%"))
            ->when($from,          fn($q) => $q->whereDate('date', '>=', $from))
            ->when($to,            fn($q) => $q->whereDate('date', '<=', $to))
            ->when($referenceType, fn($q) => $q->where('reference_type', $referenceType))
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString();

        $accounts = Account::active()
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'type', 'normal_balance']);

        $now = Carbon::now();
        $summary = [
            'total'        => JournalEntry::count(),
            'this_month'   => JournalEntry::whereYear('date', $now->year)
                ->whereMonth('date', $now->month)
                ->count(),
            'manual_count' => JournalEntry::where('reference_type', 'manual')->count(),
        ];

        return Inertia::render('finances/journal-entries/index', [
            'entries'  => $entries,
            'accounts' => $accounts,
            'summary'  => $summary,
            'filters'  => [
                'search'         => $search,
                'from'           => $from,
                'to'             => $to,
                'reference_type' => $referenceType,
            ],
        ]);
    }

    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated) {
            JournalService::createManual(
                date: $validated['date'],
                description: $validated['description'],
                lines: $validated['lines'],
            );
        });

        return back()->with('success', 'Jurnal berhasil disimpan.');
    }

    public function update(UpdateRequest $request, JournalEntry $journalEntry)
    {
        if ($journalEntry->reference_type !== 'manual') {
            return back()->withErrors(['error' => 'Hanya jurnal manual yang dapat diedit.']);
        }

        $validated = $request->validated();

        DB::transaction(function () use ($journalEntry, $validated) {
            $journalEntry->update([
                'date'        => $validated['date'],
                'description' => $validated['description'],
            ]);

            $journalEntry->lines()->delete();

            foreach ($validated['lines'] as $line) {
                $journalEntry->lines()->create([
                    'account_id' => $line['account_id'],
                    'debit'      => $line['debit']  ?? 0,
                    'credit'     => $line['credit'] ?? 0,
                    'notes'      => $line['notes']  ?? null,
                ]);
            }
        });

        return back()->with('success', 'Jurnal berhasil diperbarui.');
    }

    public function destroy(JournalEntry $journalEntry)
    {
        if ($journalEntry->reference_type !== 'manual') {
            return back()->withErrors(['error' => 'Hanya jurnal manual yang dapat dihapus.']);
        }

        $journalEntry->delete();

        return back()->with('success', 'Jurnal berhasil dihapus.');
    }
}
