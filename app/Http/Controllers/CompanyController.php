<?php

namespace App\Http\Controllers;

use App\Http\Requests\Companies\StoreRequest;
use App\Http\Requests\Companies\UpdateRequest;
use App\Http\Requests\Customers\AttachCompanyRequest;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');
        $statusLegal = $request->get('status_legal');
        $categoryBusiness = $request->get('category_business');

        $companies = Company::query()
            ->with([
                'customers' => fn($q) =>
                $q->withPivot('is_primary', 'position_at_company')
            ])
            ->withCount('customers')
            ->when($search, fn($q) => $q->search($search))
            ->when($statusLegal, fn($q) => $q->where('status_legal', $statusLegal))
            ->when($categoryBusiness, fn($q) => $q->where('category_business', $categoryBusiness))
            ->latest()
            ->paginate($perPage);

        $summary = [
            'total'             => Company::count(),
            'with_customers'    => Company::has('customers')->count(),
            'with_npwp'         => Company::whereNotNull('npwp')->count(),
            'with_legal_status' => Company::whereNotNull('status_legal')
                ->where('status_legal', '!=', 'belum_ada')
                ->count(),
        ];

        return Inertia::render('contacts/companies/index', [
            'companies' => $companies,
            'summary'   => $summary,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
                'status_legal' => $statusLegal,
                'category_business' => $categoryBusiness,
            ],
        ]);
    }

    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        Company::create($validated);

        return back()->with('success', 'Perusahaan berhasil ditambahkan.');
    }

    public function show(Company $company)
    {
        $company->load(['customers' => function ($query) {
            $query->withPivot('is_primary', 'position_at_company');
        }]);

        return Inertia::render('contacts/companies/show', [
            'company' => $company,
        ]);
    }

    public function edit(Company $company)
    {
        return response()->json([
            'company' => $company,
        ]);
    }

    public function update(UpdateRequest $request, Company $company)
    {
        $validated = $request->validated();

        $company->update($validated);

        return back()->with('success', 'Perusahaan berhasil diperbarui.');
    }

    public function destroy(Company $company)
    {
        if ($company->customers()->exists()) {
            return back()->with('error', 'Tidak dapat menghapus perusahaan yang masih memiliki pelanggan (PIC).');
        }

        $company->delete();

        return back()->with('success', 'Perusahaan berhasil dihapus.');
    }

    public function attachCustomer(AttachCompanyRequest $request, Company $company)
    {
        $validated = $request->validated();

        if ($company->customers()->where('customer_id', $validated['customer_id'])->exists()) {
            return back()->with('error', 'Pelanggan (PIC) sudah terhubung dengan perusahaan ini.');
        }

        $company->customers()->attach($validated['customer_id'], [
            'is_primary' => $validated['is_primary'] ?? false,
            'position_at_company' => $validated['position_at_company'] ?? null,
        ]);

        return back()->with('success', 'Pelanggan (PIC) berhasil ditambahkan ke perusahaan.');
    }

    public function detachCustomer(Company $company, $customerId)
    {
        $company->customers()->detach($customerId);

        return back()->with('success', 'Customer berhasil dihapus dari perusahaan.');
    }

    public function updateCustomerPivot(Request $request, Company $company, $customerId)
    {
        $validated = $request->validate([
            'is_primary'          => 'boolean',
            'position_at_company' => 'nullable|string|max:255',
        ], [
            'position_at_company.max' => 'Posisi maksimal 255 karakter.',
        ]);

        $company->customers()->updateExistingPivot($customerId, $validated);

        return back()->with('success', 'Data pelanggan (PIC) berhasil diperbarui.');
    }
}
