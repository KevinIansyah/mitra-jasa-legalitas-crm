<?php

namespace App\Http\Controllers;

use App\Http\Requests\Customers\AttachCompanyRequest;
use App\Http\Requests\Customers\StoreRequest;
use App\Http\Requests\Customers\UpdateRequest;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');
        $status = $request->get('status');
        $tier = $request->get('tier');
        $haveAccount = $request->get('have_account');

        $customers = Customer::query()
            ->with([
                'companies' => fn($q) =>
                $q->withPivot('is_primary', 'position_at_company')
            ])
            ->when($search, fn($q) => $q->search($search))
            ->when($status, fn($q) => $q->where('status', $status))
            ->when($tier, fn($q) => $q->where('tier', $tier))
            ->when($haveAccount === 'registered', fn($q) => $q->haveAccount())
            ->when($haveAccount === 'unregistered', fn($q) => $q->noAccount())
            ->latest()
            ->paginate($perPage);

        $summary = [
            'total'        => Customer::count(),
            'with_account' => Customer::whereNotNull('user_id')->count(),
            'with_company' => Customer::has('companies')->count(),
            'active'       => Customer::where('status', 'active')->count(),
        ];

        return Inertia::render('contacts/customers/index', [
            'customers' => $customers,
            'summary'   => $summary,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
                'status' => $status,
                'tier' => $tier,
                'have_account' => $haveAccount,
            ],
        ]);
    }

    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        Customer::create($validated);

        return back()->with('success', 'Customer berhasil ditambahkan.');
    }

    public function show(Customer $customer)
    {
        $customer->load(['companies' => function ($query) {
            $query->withPivot('is_primary', 'position_at_company');
        }, 'user']);

        return Inertia::render('contacts/customers/show', [
            'customer' => $customer,
        ]);
    }

    public function edit(Customer $customer)
    {
        return response()->json([
            'customer' => $customer,
        ]);
    }

    public function update(UpdateRequest $request, Customer $customer)
    {
        $validated = $request->validated();

        $customer->update($validated);

        return back()->with('success', 'Customer berhasil diperbarui.');
    }

    public function destroy(Customer $customer)
    {
        if ($customer->user_id) {
            return back()->with('error', 'Tidak dapat menghapus customer yang memiliki akun user. Hapus akun user terlebih dahulu.');
        }

        $customer->delete();

        return back()->with('success', 'Customer berhasil dihapus.');
    }

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

    public function detachCompany(Customer $customer, $companyId)
    {
        $customer->companies()->detach($companyId);

        return back()->with('success', 'Perusahaan berhasil dihapus dari customer.');
    }

    public function updateCompanyPivot(Request $request, Customer $customer, $companyId)
    {
        $validated = $request->validate([
            'is_primary' => 'boolean',
            'position_at_company' => 'nullable|string|max:255',
        ]);

        $customer->companies()->updateExistingPivot($companyId, $validated);

        return back()->with('success', 'Data perusahaan berhasil diperbarui.');
    }

    public function checkAccount(Customer $customer)
    {
        if (!$customer->email) {
            return response()->json([
                'status'  => 'no_email',
                'message' => 'Customer ini belum memiliki email.',
            ]);
        }

        $existingUser = User::where('email', $customer->email)->first();

        if ($existingUser) {
            $linkedCustomer = Customer::where('user_id', $existingUser->id)
                ->where('id', '!=', $customer->id)
                ->first();

            if ($linkedCustomer) {
                return response()->json([
                    'status'  => 'linked_elsewhere',
                    'message' => "Email ini sudah terhubung ke customer lain ({$linkedCustomer->name}).",
                ]);
            }

            return response()->json([
                'status' => 'exists',
                'user'   => [
                    'id'    => $existingUser->id,
                    'name'  => $existingUser->name,
                    'email' => $existingUser->email,
                ],
            ]);
        }

        return response()->json(['status' => 'not_found']);
    }

    public function createAccount(Customer $customer)
    {
        if ($customer->user_id) {
            return response()->json(['message' => 'Customer sudah memiliki akun.'], 422);
        }

        if (!$customer->email) {
            return response()->json(['message' => 'Customer belum memiliki email.'], 422);
        }

        if (User::where('email', $customer->email)->exists()) {
            return response()->json(['message' => 'Email sudah digunakan.'], 422);
        }

        $password = $this->generatePassword();

        $user = DB::transaction(function () use ($customer, $password) {
            $user = User::create([
                'name'     => $customer->name,
                'email'    => $customer->email,
                'password' => bcrypt($password),
            ]);

            $user->assignRole('user');
            $customer->update(['user_id' => $user->id]);

            return $user;
        });

        return response()->json([
            'message'  => 'Akun berhasil dibuat.',
            'email'    => $user->email,
            'password' => $password,
        ]);
    }

    public function linkAccount(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
        ]);

        $user = User::findOrFail($validated['user_id']);

        if (!$user->hasRole('user')) {
            return response()->json([
                'message' => 'Akun ini bukan role user dan tidak dapat dihubungkan ke customer.'
            ], 422);
        }


        $customer->update(['user_id' => $user->id]);

        return response()->json(['message' => 'Akun berhasil dihubungkan ke customer.']);
    }

    public function revokeAccount(Customer $customer)
    {
        if (!$customer->user_id) {
            return response()->json([
                'message' => 'Customer tidak memiliki akun.'
            ], 422);
        }

        DB::transaction(function () use ($customer) {
            $user = $customer->user;
            $customer->update(['user_id' => null]);

            if ($user) {
                $user->update(['status' => 'inactive']);
            }
        });

        return response()->json(['message' => 'Akun berhasil dicabut.']);
    }

    private function generatePassword(): string
    {
        $upper   = substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZ'), 0, 2);
        $lower   = substr(str_shuffle('abcdefghjkmnpqrstuvwxyz'), 0, 4);
        $numbers = substr(str_shuffle('23456789'), 0, 3);
        $special = substr(str_shuffle('!@#$%'), 0, 1);

        return str_shuffle($upper . $lower . $numbers . $special);
    }
}
