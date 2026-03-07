<?php

namespace App\Http\Controllers;

use App\Http\Requests\Companies\StoreRequest;
use App\Http\Requests\Companies\UpdateRequest;
use App\Http\Requests\Customers\AttachCompanyRequest;
use App\Models\Company;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanyController extends Controller
{
    /**
     * Display a listing of companies.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');
        $statusLegal = $request->get('status_legal');
        $categoryBusiness = $request->get('category_business');

        $query = Company::query()
            ->with(['customers' => function ($query) {
                $query->withPivot('is_primary', 'position_at_company');
            }])
            ->withCount('customers');

        if ($search) {
            $query->search($search);
        }

        if ($statusLegal) {
            $query->where('status_legal', $statusLegal);
        }

        if ($categoryBusiness) {
            $query->where('category_business', $categoryBusiness);
        }

        $companies = $query->latest()->paginate($perPage);

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

    /**
     * Store a newly created company in storage.
     */
    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        Company::create($validated);

        return back()->with('success', 'Perusahaan berhasil ditambahkan.');
    }

    /**
     * Display the specified company.
     */
    public function show(Company $company)
    {
        $company->load(['customers' => function ($query) {
            $query->withPivot('is_primary', 'position_at_company');
        }]);

        return Inertia::render('contacts/companies/show', [
            'company' => $company,
        ]);
    }

    /**
     * Return company data for editing modal/sheet.
     */
    public function edit(Company $company)
    {
        return response()->json([
            'company' => $company,
        ]);
    }

    /**
     * Update the specified company in storage.
     */
    public function update(UpdateRequest $request, Company $company)
    {
        $validated = $request->validated();

        $company->update($validated);

        return back()->with('success', 'Perusahaan berhasil diperbarui.');
    }

    /**
     * Remove the specified company from storage.
     */
    public function destroy(Company $company)
    {
        if ($company->customers()->exists()) {
            return back()->with('error', 'Tidak dapat menghapus perusahaan yang masih memiliki pelanggan (PIC).');
        }

        $company->delete();

        return back()->with('success', 'Perusahaan berhasil dihapus.');
    }

    /**
     * Attach customer to company
     */
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

    /**
     * Detach customer from company
     */
    public function detachCustomer(Company $company, $customerId)
    {
        $company->customers()->detach($customerId);

        return back()->with('success', 'Customer berhasil dihapus dari perusahaan.');
    }

    /**
     * Update pivot data for customer
     */
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
