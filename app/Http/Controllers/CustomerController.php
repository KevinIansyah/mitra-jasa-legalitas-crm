<?php

namespace App\Http\Controllers;

use App\Http\Requests\Customers\AttachCompanyRequest;
use App\Http\Requests\Customers\StoreRequest;
use App\Http\Requests\Customers\UpdateRequest;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /**
     * Display a listing of customers.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');
        $status = $request->get('status');
        $tier = $request->get('tier');
        $haveAccount = $request->get('have_account');

        $query = Customer::query()->with(['companies' => function ($query) {
            $query->withPivot('is_primary', 'position_at_company');
        }]);

        if ($search) {
            $query->search($search);
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($tier) {
            $query->where('tier', $tier);
        }

        if ($haveAccount === 'registered') {
            $query->haveAccount();
        } elseif ($haveAccount === 'unregistered') {
            $query->noAccount();
        }

        $customers = $query->latest()->paginate($perPage);

        return Inertia::render('contacts/customers/index', [
            'customers' => $customers,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
                'status' => $status,
                'tier' => $tier,
            ],
        ]);
    }

    /**
     * Store a newly created customer in storage.
     */
    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        Customer::create($validated);

        return back()->with('success', 'Customer berhasil ditambahkan.');
    }

    /**
     * Display the specified customer.
     */
    public function show(Customer $customer)
    {
        $customer->load(['companies' => function ($query) {
            $query->withPivot('is_primary', 'position_at_company');
        }, 'user']);

        return Inertia::render('contacts/customers/show', [
            'customer' => $customer,
        ]);
    }

    /**
     * Return customer data for editing modal/sheet.
     */
    public function edit(Customer $customer)
    {
        return response()->json([
            'customer' => $customer,
        ]);
    }

    /**
     * Update the specified customer in storage.
     */
    public function update(UpdateRequest $request, Customer $customer)
    {
        $validated = $request->validated();

        $customer->update($validated);

        return back()->with('success', 'Customer berhasil diperbarui.');
    }

    /**
     * Remove the specified customer from storage.
     */
    public function destroy(Customer $customer)
    {
        if ($customer->user_id) {
            return back()->with('error', 'Tidak dapat menghapus customer yang memiliki akun user. Hapus akun user terlebih dahulu.');
        }

        $customer->delete();

        return back()->with('success', 'Customer berhasil dihapus.');
    }

    /**
     * Attach company to customer
     */
    public function attachCompany(AttachCompanyRequest $request, Customer $customer)
    {
        $validated = $request->validated();

        if ($customer->companies()->where('company_id', $validated['company_id'])->exists()) {
            return back()->with('error', 'Perusahaan sudah terhubung dengan customer ini.');
        }

        $customer->companies()->attach($validated['company_id'], [
            'is_primary' => $validated['is_primary'] ?? false,
            'position_at_company' => $validated['position_at_company'] ?? null,
        ]);

        return back()->with('success', 'Perusahaan berhasil ditambahkan ke customer.');
    }

    /**
     * Detach company from customer
     */
    public function detachCompany(Customer $customer, $companyId)
    {
        $customer->companies()->detach($companyId);

        return back()->with('success', 'Perusahaan berhasil dihapus dari customer.');
    }

    /**
     * Update pivot data for company
     */
    public function updateCompanyPivot(Request $request, Customer $customer, $companyId)
    {
        $validated = $request->validate([
            'is_primary' => 'boolean',
            'position_at_company' => 'nullable|string|max:255',
        ]);

        $customer->companies()->updateExistingPivot($companyId, $validated);

        return back()->with('success', 'Data perusahaan berhasil diperbarui.');
    }
}
