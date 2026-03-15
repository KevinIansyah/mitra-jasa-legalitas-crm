<?php

namespace App\Http\Controllers\Blogs;

use App\Http\Controllers\Controller;
use App\Models\BlogTag;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BlogTagController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');

        $tags = BlogTag::query()
            ->when($search, fn($q) => $q->where('name', 'like', "%{$search}%"))
            ->latest()
            ->paginate($perPage);

        return Inertia::render('blogs/tags/index', [
            'tags' => $tags,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'   => 'required|string|max:255|unique:blog_tags,name',
            'status' => 'nullable|in:active,inactive',
        ], [
            'name.required' => 'Nama tag wajib diisi.',
            'name.max'      => 'Nama tag maksimal 255 karakter.',
            'name.unique'   => 'Nama tag sudah digunakan.',
            'status.in'     => 'Status tidak valid.',
        ]);

        $validated['slug']   = Str::slug($validated['name']);
        $validated['status'] = $validated['status'] ?? 'active';

        BlogTag::create($validated);

        return back()->with('success', 'Tag blog berhasil ditambahkan.');
    }

    public function update(Request $request, BlogTag $tag)
    {
        $validated = $request->validate([
            'name'   => 'required|string|max:255|unique:blog_tags,name,' . $tag->id,
            'status' => 'nullable|in:active,inactive',
        ], [
            'name.required' => 'Nama tag wajib diisi.',
            'name.max'      => 'Nama tag maksimal 255 karakter.',
            'name.unique'   => 'Nama tag sudah digunakan.',
            'status.in'     => 'Status tidak valid.',
        ]);

        $validated['slug']   = Str::slug($validated['name']);
        $validated['status'] = $validated['status'] ?? $tag->status;

        $tag->update($validated);

        return back()->with('success', 'Tag blog berhasil diperbarui.');
    }

    public function destroy(BlogTag $tag)
    {
        if ($tag->blogs()->exists()) {
            return back()->withErrors(['error' => 'Tag tidak dapat dihapus karena masih digunakan oleh blog.']);
        }

        $tag->delete();

        return back()->with('success', 'Tag blog berhasil dihapus.');
    }
}
