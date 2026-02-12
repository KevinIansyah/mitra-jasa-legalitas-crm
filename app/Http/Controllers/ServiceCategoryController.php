<?php

namespace App\Http\Controllers;

use App\Models\ServiceCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceCategoryController extends Controller
{
    /**
     * Display a listing of categories.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');

        $query = ServiceCategory::query();

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $categories = $query->latest()->paginate($perPage);

        return Inertia::render('services/categories/index', [
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:service_categories,name',
        ]);

        ServiceCategory::create($validated);

        return back()->with('success', 'Kategori berhasil dibuat.');
    }

    /**
     * Return category data for editing modal/sheet.
     */
    public function edit(ServiceCategory $category)
    {
        return response()->json([
            'category' => $category,
        ]);
    }

    /**
     * Update the specified category in storage.
     */
    public function update(Request $request, ServiceCategory $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:service_categories,name,' . $category->id,
        ]);

        $category->update($validated);

        return back()->with('success', 'Kategori berhasil diperbarui.');
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(ServiceCategory $category)
    {
        if ($category->services()->exists()) {
            return back()->with('error', 'Kategori tidak dapat dihapus karena masih digunakan oleh layanan.');
        }

        $category->delete();

        return back()->with('success', 'Kategori berhasil dihapus.');
    }
}
