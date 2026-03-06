<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class VendorController extends Controller
{
    public function index(Request $request)
    {
        $perPage  = $request->get('per_page', 20);
        $perPage  = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;
        $search   = $request->get('search');
        $category = $request->get('category');
        $status = $request->get('status');

        $query = Vendor::withCount('expenses')
            ->with('primaryBankAccount', 'bankAccounts');

        if ($search) {
            $query->search($search);
        }

        if ($category) {
            $query->byCategory($category);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $vendors = $query->latest()->paginate($perPage);

        $summary = Vendor::query()
            ->selectRaw("
        COUNT(*) as total,
        COALESCE(SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END), 0) as active,
        COALESCE(SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END), 0) as inactive
    ")
            ->first();

        return Inertia::render('finances/vendors/index', [
            'vendors' => $vendors,
            'summary' => $summary,
            'filters' => [
                'search'    => $search,
                'per_page'  => $perPage,
                'category'  => $category,
                'status' => $status,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('finances/vendors/create/index');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'                          => 'required|string|max:255',
            'category'                      => 'nullable|string|max:100',
            'phone'                         => 'nullable|string|max:50',
            'email'                         => 'nullable|email|max:255',
            'address'                       => 'nullable|string',
            'npwp'                          => 'nullable|string|max:30',
            'notes'                         => 'nullable|string',
            'status'                        => 'nullable|string|in:active,inactive',
            'bank_accounts'                 => 'array',
            'bank_accounts.*.bank_name'     => 'required_with:bank_accounts|string|max:100',
            'bank_accounts.*.account_number' => 'required_with:bank_accounts|string|max:50',
            'bank_accounts.*.account_holder' => 'required_with:bank_accounts|string|max:255',
            'bank_accounts.*.is_primary'    => 'boolean',
        ]);

        DB::transaction(function () use ($validated) {
            $vendor = Vendor::create([
                'name'      => $validated['name'],
                'category'  => $validated['category'] ?? null,
                'phone'     => $validated['phone'] ?? null,
                'email'     => $validated['email'] ?? null,
                'address'   => $validated['address'] ?? null,
                'npwp'      => $validated['npwp'] ?? null,
                'notes'     => $validated['notes'] ?? null,
                'status'    => $validated['status'] ?? 'active',
            ]);

            $this->syncBankAccounts($vendor, $validated['bank_accounts'] ?? []);
        });

        return redirect()->route('finances.vendors.index')
            ->with('success', 'Vendor berhasil ditambahkan.');
    }

    public function edit(Vendor $vendor)
    {
        $vendor->load('bankAccounts');

        return Inertia::render('finances/vendors/edit/index', [
            'vendor' => $vendor,
            'isEdit' => true,
        ]);
    }

    public function update(Request $request, Vendor $vendor)
    {
        $validated = $request->validate([
            'name'                          => 'required|string|max:255',
            'category'                      => 'nullable|string|max:100',
            'phone'                         => 'nullable|string|max:50',
            'email'                         => 'nullable|email|max:255',
            'address'                       => 'nullable|string',
            'npwp'                          => 'nullable|string|max:30',
            'notes'                         => 'nullable|string',
            'status'                        => 'nullable|string|in:active,inactive',
            'bank_accounts'                 => 'array',
            'bank_accounts.*.bank_name'     => 'required_with:bank_accounts|string|max:100',
            'bank_accounts.*.account_number' => 'required_with:bank_accounts|string|max:50',
            'bank_accounts.*.account_holder' => 'required_with:bank_accounts|string|max:255',
            'bank_accounts.*.is_primary'    => 'boolean',
        ]);

        DB::transaction(function () use ($vendor, $validated) {
            $vendor->update([
                'name'      => $validated['name'],
                'category'  => $validated['category'] ?? null,
                'phone'     => $validated['phone'] ?? null,
                'email'     => $validated['email'] ?? null,
                'address'   => $validated['address'] ?? null,
                'npwp'      => $validated['npwp'] ?? null,
                'notes'     => $validated['notes'] ?? null,
                'status'    => $validated['status'] ?? 'active',
            ]);

            $this->syncBankAccounts($vendor, $validated['bank_accounts'] ?? []);
        });

        return redirect()->route('finances.vendors.index')
            ->with('success', 'Vendor berhasil diperbarui.');
    }

    public function destroy(Vendor $vendor)
    {
        $vendor->delete();
        return back()->with('success', 'Vendor berhasil dihapus.');
    }

    private function syncBankAccounts(Vendor $vendor, array $accounts): void
    {
        $vendor->bankAccounts()->delete();

        $hasPrimary = collect($accounts)->contains('is_primary', true);

        foreach ($accounts as $i => $account) {
            $vendor->bankAccounts()->create([
                'bank_name'      => $account['bank_name'],
                'account_number' => $account['account_number'],
                'account_holder' => $account['account_holder'],
                'is_primary'     => $hasPrimary ? ($account['is_primary'] ?? false) : ($i === 0),
            ]);
        }
    }
}
