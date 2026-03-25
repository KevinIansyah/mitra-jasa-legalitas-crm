<?php

namespace App\Http\Controllers\Contents;

use App\Helpers\FileHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Content\ClientSuccessStories\StoreRequest;
use App\Http\Requests\Content\ClientSuccessStories\UpdateRequest;
use App\Models\ClientSuccessStory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientSuccessStoryController extends Controller
{
    public function index(Request $request)
    {
        $perPage = in_array($request->get('per_page', 20), [20, 30, 40, 50])
            ? $request->get('per_page', 20) : 20;

        $search = $request->get('search');
        $published = $request->get('published');
        $industry = $request->get('industry');

        $stories = ClientSuccessStory::query()
            ->when($search, function ($q, $s) {
                $q->where(function ($q2) use ($s) {
                    $q2->where('client_name', 'like', "%{$s}%")
                        ->orWhere('metric_label', 'like', "%{$s}%");
                });
            })
            ->when($published === '1', fn ($q) => $q->where('is_published', true))
            ->when($published === '0', fn ($q) => $q->where('is_published', false))
            ->when($industry, fn ($q, $i) => $q->where('industry', $i))
            ->ordered()
            ->paginate($perPage);

        $summaryRow = ClientSuccessStory::query()
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

        return Inertia::render('contents/client-success-stories/index', [
            'stories' => $stories,
            'summary' => $summary,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
                'published' => $published,
                'industry' => $industry,
            ],
        ]);
    }

    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        if ($request->hasFile('client_logo')) {
            $fileData = FileHelper::uploadToR2Public(
                $request->file('client_logo'),
                'content/client-success-stories',
            );
            $validated['client_logo'] = $fileData['path'];
        }

        ClientSuccessStory::create($validated);

        return back()->with('success', 'Kisah sukses berhasil ditambahkan.');
    }

    public function update(UpdateRequest $request, ClientSuccessStory $clientSuccessStory)
    {
        $validated = $request->validated();

        if ($request->boolean('remove_client_logo') && $clientSuccessStory->client_logo) {
            FileHelper::deleteFromR2($clientSuccessStory->client_logo);
            $validated['client_logo'] = null;
        }

        if ($request->hasFile('client_logo')) {
            if ($clientSuccessStory->client_logo) {
                FileHelper::deleteFromR2($clientSuccessStory->client_logo);
            }

            $fileData = FileHelper::uploadToR2Public(
                $request->file('client_logo'),
                'content/client-success-stories',
            );

            $validated['client_logo'] = $fileData['path'];
        }

        $clientSuccessStory->update($validated);

        return back()->with('success', 'Kisah sukses berhasil diperbarui.');
    }

    public function destroy(ClientSuccessStory $clientSuccessStory)
    {
        if ($clientSuccessStory->client_logo) {
            FileHelper::deleteFromR2($clientSuccessStory->client_logo);
        }

        $clientSuccessStory->delete();

        return back()->with('success', 'Kisah sukses berhasil dihapus.');
    }
}
