<?php

namespace App\Http\Controllers\Finances;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finances\OpeningBalance\StoreRequest;
use App\Models\Account;
use App\Models\JournalEntry;
use App\Services\JournalService;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OpeningBalanceController extends Controller
{
  public function index()
  {
    $entry = JournalEntry::where('reference_type', 'opening_balance')
      ->with(['lines.account'])
      ->first();

    $accounts = Account::active()
      ->whereIn('type', ['asset', 'liability', 'equity'])
      ->orderBy('code')
      ->get(['id', 'code', 'name', 'type', 'category', 'normal_balance']);

    $existing = null;
    if ($entry) {
      $existing = [
        'date'     => $entry->date->toDateString(),
        'balances' => $entry->lines->map(fn($line) => [
          'account_id'     => $line->account_id,
          'account_code'   => $line->account->code,
          'account_name'   => $line->account->name,
          'account_type'   => $line->account->type,
          'normal_balance' => $line->account->normal_balance,
          'balance'        => $line->account->normal_balance === 'debit'
            ? (float) $line->debit
            : (float) $line->credit,
        ]),
      ];
    }

    return Inertia::render('finances/opening-balance/index', [
      'accounts' => $accounts,
      'existing' => $existing,
      'isSet'    => (bool) $entry,
    ]);
  }

  public function store(StoreRequest $request)
  {
    if (JournalEntry::where('reference_type', 'opening_balance')->exists()) {
      return back()->withErrors([
        'error' => 'Saldo awal sudah pernah diisi dan tidak dapat dibuat ulang.'
      ]);
    }

    $validated = $request->validated();

    DB::transaction(function () use ($validated) {
      JournalService::createOpeningBalance(
        date: $validated['date'],
        balances: $validated['balances'],
      );
    });

    return back()->with('success', 'Saldo awal berhasil disimpan.');
  }

  public function update(StoreRequest $request)
  {
    $entry = JournalEntry::where('reference_type', 'opening_balance')->first();

    if (! $entry) {
      return back()->withErrors([
        'error' => 'Saldo awal belum pernah diisi.'
      ]);
    }

    $hasTransactions = JournalEntry::whereIn('reference_type', ['invoice', 'payment', 'expense', 'manual'])
      ->exists();

    if ($hasTransactions) {
      return back()->withErrors([
        'error' => 'Saldo awal tidak dapat diubah karena sudah ada transaksi yang tercatat.'
      ]);
    }

    $validated = $request->validated();

    DB::transaction(function () use ($entry, $validated) {
      $entry->delete();

      JournalService::createOpeningBalance(
        date: $validated['date'],
        balances: $validated['balances'],
      );
    });

    return back()->with('success', 'Saldo awal berhasil diperbarui.');
  }
}
