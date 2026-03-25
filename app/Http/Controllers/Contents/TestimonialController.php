<?php

namespace App\Http\Controllers\Contents;

use App\Helpers\FileHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Content\Testimonials\StoreRequest;
use App\Http\Requests\Content\Testimonials\UpdateRequest;
use App\Models\Service;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TestimonialController extends Controller
{
    public function index(Request $request)
    {
        $perPage = in_array($request->get('per_page', 20), [20, 30, 40, 50])
            ? $request->get('per_page', 20) : 20;

        $search = $request->get('search');
        $published = $request->get('published');
        $serviceId = $request->get('service_id');

        $testimonials = Testimonial::query()
            ->with('service:id,name')
            ->when($search, function ($q, $s) {
                $q->where(function ($q2) use ($s) {
                    $q2->where('client_name', 'like', "%{$s}%")
                        ->orWhere('client_company', 'like', "%{$s}%");
                });
            })
            ->when($published === '1', fn ($q) => $q->where('is_published', true))
            ->when($published === '0', fn ($q) => $q->where('is_published', false))
            ->when($serviceId, fn ($q, $id) => $q->where('service_id', $id))
            ->ordered()
            ->paginate($perPage);

        $summaryRow = Testimonial::query()
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

        return Inertia::render('contents/testimonials/index', [
            'testimonials' => $testimonials,
            'services' => Service::active()->orderBy('name')->get(['id', 'name']),
            'summary' => $summary,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
                'published' => $published,
                'service_id' => $serviceId,
            ],
        ]);
    }

    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        if ($request->hasFile('client_avatar')) {
            $fileData = FileHelper::uploadToR2Public(
                $request->file('client_avatar'),
                'content/testimonials',
            );
            $validated['client_avatar'] = $fileData['path'];
        }

        Testimonial::create($validated);

        return back()->with('success', 'Testimoni berhasil ditambahkan.');
    }

    public function update(UpdateRequest $request, Testimonial $testimonial)
    {
        $validated = $request->validated();

        if ($request->boolean('remove_client_avatar') && $testimonial->client_avatar) {
            FileHelper::deleteFromR2($testimonial->client_avatar);
            $validated['client_avatar'] = null;
        }

        if ($request->hasFile('client_avatar')) {
            if ($testimonial->client_avatar) {
                FileHelper::deleteFromR2($testimonial->client_avatar);
            }
            $fileData = FileHelper::uploadToR2Public(
                $request->file('client_avatar'),
                'content/testimonials',
            );
            $validated['client_avatar'] = $fileData['path'];
        }

        $testimonial->update($validated);

        return back()->with('success', 'Testimoni berhasil diperbarui.');
    }

    public function destroy(Testimonial $testimonial)
    {
        if ($testimonial->client_avatar) {
            FileHelper::deleteFromR2($testimonial->client_avatar);
        }

        $testimonial->delete();

        return back()->with('success', 'Testimoni berhasil dihapus.');
    }
}
