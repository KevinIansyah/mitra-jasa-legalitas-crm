<?php

namespace App\Http\Controllers\Blogs;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BlogCategoryController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');

        $categories = BlogCategory::query()
            ->when($search, fn($q) => $q->where('name', 'like', "%{$search}%"))
            ->latest()
            ->paginate($perPage);

        return Inertia::render('blogs/categories/index', [
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
            'name' => 'required|string|max:255|unique:blog_categories,name',
            'status' => 'nullable|in:active,inactive',
        ], [
            'name.required' => 'Nama kategori wajib diisi.',
            'name.max'      => 'Nama kategori maksimal 255 karakter.',
            'name.unique'   => 'Nama kategori sudah digunakan.',
        ]);

        $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);

        BlogCategory::create($validated);

        return back()->with('success', 'Kategori blog berhasil ditambahkan.');
    }

    public function update(Request $request, BlogCategory $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:blog_categories,name,' . $category->id,
            'status' => 'nullable|in:active,inactive',
        ], [
            'name.required' => 'Nama kategori wajib diisi.',
            'name.max'      => 'Nama kategori maksimal 255 karakter.',
            'name.unique'   => 'Nama kategori sudah digunakan.',
            'status.in'     => 'Status tidak valid.',
        ]);

        $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);

        $category->update($validated);

        return back()->with('success', 'Kategori blog berhasil diperbarui.');
    }

    public function destroy(BlogCategory $category)
    {
        if ($category->blogs()->exists()) {
            return back()->withErrors(['error' => 'Kategori tidak dapat dihapus karena masih digunakan oleh blog.']);
        }

        $category->delete();

        return back()->with('success', 'Kategori blog berhasil dihapus.');
    }
}
