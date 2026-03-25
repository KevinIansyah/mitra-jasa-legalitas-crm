<?php

namespace App\Http\Controllers\Contents;

use App\Http\Controllers\Controller;
use App\Http\Requests\Content\Faqs\StoreRequest;
use App\Http\Requests\Content\Faqs\UpdateRequest;
use App\Models\Faq;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FaqController extends Controller
{
    public function index(Request $request)
    {
        $perPage = in_array($request->get('per_page', 20), [20, 30, 40, 50])
            ? $request->get('per_page', 20) : 20;

        $search = $request->get('search');
        $published = $request->get('published');

        $faqs = Faq::query()
            ->when($search, fn ($q, $s) => $q->where('question', 'like', "%{$s}%"))
            ->when($published === '1', fn ($q) => $q->where('is_published', true))
            ->when($published === '0', fn ($q) => $q->where('is_published', false))
            ->latest()
            ->paginate($perPage);

        $summaryRow = Faq::query()
            ->selectRaw('
                COUNT(*) as total,
                COALESCE(SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END), 0) as published,
                COALESCE(SUM(CASE WHEN is_published = 0 THEN 1 ELSE 0 END), 0) as draft
            ')
            ->first();

        $summary = [
            'total' => (int) $summaryRow->total,
            'published' => (int) $summaryRow->published,
            'draft' => (int) $summaryRow->draft,
        ];

        return Inertia::render('contents/faqs/index', [
            'faqs' => $faqs,
            'summary' => $summary,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
                'published' => $published,
            ],
        ]);
    }

    public function store(StoreRequest $request)
    {
        Faq::create($request->validated());

        return back()->with('success', 'FAQ berhasil ditambahkan.');
    }

    public function update(UpdateRequest $request, Faq $faq)
    {
        $faq->update($request->validated());

        return back()->with('success', 'FAQ berhasil diperbarui.');
    }

    public function destroy(Faq $faq)
    {
        $faq->delete();

        return back()->with('success', 'FAQ berhasil dihapus.');
    }
}
