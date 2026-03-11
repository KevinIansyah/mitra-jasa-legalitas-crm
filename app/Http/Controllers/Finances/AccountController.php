<?php

namespace App\Http\Controllers\Finances;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finances\Accounts\StoreRequest;
use App\Http\Requests\Finances\Accounts\UpdateRequest;
use App\Models\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');
        $type   = $request->get('type');
        $status = $request->get('status');

        $accounts = Account::query()
            ->when($search, fn($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%"))
            ->when($type,   fn($q) => $q->where('type', $type))
            ->when($status, fn($q) => $q->where('status', $status))
            ->withCount('journalLines')
            ->orderBy('code')
            ->paginate(20);

        $summary = Account::query()
            ->selectRaw("
        COUNT(*) as total,
        COALESCE(SUM(CASE WHEN status = 'active'   THEN 1 ELSE 0 END),0) as active,
        COALESCE(SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END),0) as inactive,
        COALESCE(SUM(CASE WHEN type = 'asset'      THEN 1 ELSE 0 END),0) as asset,
        COALESCE(SUM(CASE WHEN type = 'liability'  THEN 1 ELSE 0 END),0) as liability,
        COALESCE(SUM(CASE WHEN type = 'equity'     THEN 1 ELSE 0 END),0) as equity,
        COALESCE(SUM(CASE WHEN type = 'revenue'    THEN 1 ELSE 0 END),0) as revenue,
        COALESCE(SUM(CASE WHEN type = 'expense'    THEN 1 ELSE 0 END),0) as expense
    ")
            ->first();

        return Inertia::render('finances/accounts/index', [
            'accounts' => $accounts,
            'summary'  => $summary,
            'filters'  => [
                'search' => $search,
                'type'   => $type,
                'status' => $status,
            ],
        ]);
    }

    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        Account::create($validated);

        return back()->with('success', 'Akun berhasil ditambahkan.');
    }

    public function update(UpdateRequest $request, Account $account)
    {
        $validated = $request->validated();

        // Akun sistem: hanya update nama
        if ($account->is_system) {
            $account->update(['name' => $validated['name']]);
        } else {
            $account->update($validated);
        }

        return back()->with('success', 'Akun berhasil diperbarui.');
    }

    public function toggleStatus(Request $request, Account $account)
    {
        if ($account->is_system) {
            return back()->withErrors([
                'error' => 'Akun sistem tidak dapat dinonaktifkan.'
            ]);
        }

        $account->update([
            'status' => $account->status === 'active' ? 'inactive' : 'active',
        ]);

        $label = $account->status === 'active' ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Akun berhasil {$label}.");
    }

    public function destroy(Account $account)
    {
        if ($account->is_system) {
            return back()->withErrors([
                'error' => 'Akun sistem tidak dapat dihapus.'
            ]);
        }

        if ($account->journalLines()->exists()) {
            return back()->withErrors([
                'error' => 'Akun yang sudah memiliki transaksi tidak dapat dihapus. Nonaktifkan akun jika tidak ingin digunakan.'
            ]);
        }

        $account->delete();

        return back()->with('success', 'Akun berhasil dihapus.');
    }
}
