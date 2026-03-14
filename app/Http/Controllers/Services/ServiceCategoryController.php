<?php

namespace App\Http\Controllers\Services;

use App\Http\Controllers\Controller;
use App\Models\ServiceCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ServiceCategoryController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');

        $categories = ServiceCategory::query()
            ->when($search, fn($q) => $q->where('name', 'like', "%{$search}%"))
            ->latest()
            ->paginate($perPage);

        return Inertia::render('services/categories/index', [
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:service_categories,name',
        ], [
            'name.required' => 'Nama kategori wajib diisi.',
            'name.max'      => 'Nama kategori maksimal 255 karakter.',
            'name.unique'   => 'Nama kategori sudah digunakan.',
        ]);

        ServiceCategory::create($validated);

        return back()->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function edit(ServiceCategory $category)
    {
        return response()->json([
            'category' => $category,
        ]);
    }

    public function update(Request $request, ServiceCategory $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:service_categories,name,' . $category->id,
        ], [
            'name.required' => 'Nama kategori wajib diisi.',
            'name.max'      => 'Nama kategori maksimal 255 karakter.',
            'name.unique'   => 'Nama kategori sudah digunakan.',
        ]);

        $category->update($validated);

        return back()->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy(ServiceCategory $category)
    {
        if ($category->services()->exists()) {
            return back()->with('error', 'Kategori tidak dapat dihapus karena masih digunakan oleh layanan.');
        }

        $category->delete();

        return back()->with('success', 'Kategori berhasil dihapus.');
    }
}
