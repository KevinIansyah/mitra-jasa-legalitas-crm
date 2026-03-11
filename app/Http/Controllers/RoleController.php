<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');

        $roles = Role::query()
            ->when($search, fn($q) => $q->where('name', 'like', "%{$search}%"))
            ->latest()
            ->paginate($perPage);

        return Inertia::render('roles/index', [
            'roles' => $roles,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255|unique:roles,name',
            'guard_name' => 'nullable|string',
        ], [
            'name.required' => 'Nama role wajib diisi.',
            'name.max'      => 'Nama role maksimal 255 karakter.',
            'name.unique'   => 'Nama role sudah digunakan.',
        ]);

        Role::create($validated);

        return back()->with('success', 'Role berhasil ditambahkan.');
    }

    public function edit(Role $role)
    {
        return response()->json([
            'role' => $role,
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255|unique:roles,name,' . $role->id,
            'guard_name' => 'nullable|string',
        ], [
            'name.required' => 'Nama role wajib diisi.',
            'name.max'      => 'Nama role maksimal 255 karakter.',
            'name.unique'   => 'Nama role sudah digunakan.',
        ]);

        $role->update($validated);

        return back()->with('success', 'Role berhasil diperbarui.');
    }

    public function destroy(Role $role)
    {
        if ($role->users()->count() > 0) {
            return back()->with('error', 'Role tidak dapat dihapus karena masih digunakan oleh pengguna.');
        }

        $role->delete();

        return back()->with('success', 'Role berhasil dihapus.');
    }

    public function editPermission(Role $role)
    {
        $role->load('permissions');
        $allPermissions = Permission::all();

        return Inertia::render('roles/permissions/index', [
            'role' => $role,
            'allPermissions' => $allPermissions,
        ]);
    }

    public function updatePermission(Request $request, Role $role)
    {
        $validated = $request->validate([
            'permissions'   => 'required|array',
            'permissions.*' => 'exists:permissions,name',
        ], [
            'permissions.required' => 'Minimal satu hak akses wajib dipilih.',
            'permissions.array'    => 'Format hak akses tidak valid.',
            'permissions.*.exists' => 'Hak akses yang dipilih tidak valid.',
        ]);

        $role->syncPermissions($validated['permissions']);

        return back()->with('success', 'Hak akses berhasil diperbarui.');
    }
}
