<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    /**
     * Display a listing of roles.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');

        $query = Role::query();

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $roles = $query->latest()->paginate($perPage);

        return Inertia::render('roles/index', [
            'roles' => $roles,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Store a newly created role in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'guard_name' => 'nullable|string',
        ]);

        Role::create($validated);

        return back()->with('success', 'Role berhasil ditambahkan.');
    }

    /**
     * Return role data for editing modal/sheet.
     */
    public function edit(Role $role)
    {
        return response()->json([
            'role' => $role,
        ]);
    }

    /**
     * Update the specified role in storage.
     */
    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'guard_name' => 'nullable|string',
        ]);

        $role->update($validated);

        return back()->with('success', 'Role berhasil diperbarui.');
    }

    /**
     * Remove the specified role from storage.
     */
    public function destroy(Role $role)
    {
        if ($role->users()->count() > 0) {
            return back()->with('error', 'Role tidak dapat dihapus karena masih digunakan oleh pengguna.');
        }

        $role->delete();

        return back()->with('success', 'Role berhasil dihapus.');
    }

    /**
     * Show the form for editing role permissions.
     */
    public function editPermission(Role $role)
    {
        $role->load('permissions');
        $allPermissions = Permission::all();

        return Inertia::render('roles/permissions/index', [
            'role' => $role,
            'allPermissions' => $allPermissions,
        ]);
    }

    /**
     * Update the permissions for the specified role.
     */
    public function updatePermission(Request $request, Role $role)
    {
        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role->syncPermissions($validated['permissions']);

        return back()->with('success', 'Hak akses berhasil diperbarui.');
    }
}
