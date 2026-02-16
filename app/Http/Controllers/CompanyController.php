<?php

namespace App\Http\Controllers;

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
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($statusLegal) {
            $query->where('status_legal', $statusLegal);
        }

        if ($categoryBusiness) {
            $query->where('category_business', $categoryBusiness);
        }

        $companies = $query->latest()->paginate($perPage);

        return Inertia::render('contacts/companies/index', [
            'companies' => $companies,
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
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:companies,email',
            'website' => 'nullable|url|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'npwp' => 'nullable|string|max:255',
            'status_legal' => 'required|string|max:255',
            'category_business' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

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
    public function update(Request $request, Company $company)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:companies,email,' . $company->id,
            'website' => 'nullable|url|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'npwp' => 'nullable|string|max:255',
            'status_legal' => 'required|string|max:255',
            'category_business' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $company->update($validated);

        return back()->with('success', 'Perusahaan berhasil diperbarui.');
    }

    /**
     * Remove the specified company from storage.
     */
    public function destroy(Company $company)
    {
        // Check if company has customers
        if ($company->customers()->exists()) {
            return back()->with('error', 'Tidak dapat menghapus perusahaan yang masih memiliki pelanggan (PIC).');
        }

        $company->delete();

        return back()->with('success', 'Perusahaan berhasil dihapus.');
    }

    /**
     * Attach customer to company
     */
    public function attachCustomer(Request $request, Company $company)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'is_primary' => 'boolean',
            'position_at_company' => 'nullable|string|max:255',
        ]);

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
            'is_primary' => 'boolean',
            'position_at_company' => 'nullable|string|max:255',
        ]);

        $company->customers()->updateExistingPivot($customerId, $validated);

        return back()->with('success', 'Data pelanggan (PIC) berhasil diperbarui.');
    }

    /**
     * Search customer
     */
    public function searchCustomer(Request $request)
    {
        $search = $request->get('search', '');
        $companyId = $request->get('company_id');

        $query = Customer::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($companyId) {
            $query->whereDoesntHave('companies', function ($q) use ($companyId) {
                $q->where('company_id', $companyId);
            });
        }

        $customers = $query->select('id', 'name', 'email', 'phone', 'tier')
            ->limit(10)
            ->get();

        return response()->json([
            'customers' => $customers,
        ]);
    }
}
