<?php

namespace App\Http\Controllers\Services;

use App\Http\Controllers\Controller;
use App\Http\Requests\Services\CityPages\StoreRequest;
use App\Http\Requests\Services\CityPages\UpdateContentRequest;
use App\Http\Requests\Services\CityPages\UpdateSeoRequest;
use App\Models\City;
use App\Models\Service;
use App\Models\ServiceCityPage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ServiceCityPageController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search        = $request->get('search');
        $serviceId     = $request->get('service_id');
        $cityId        = $request->get('city_id');
        $contentStatus = $request->get('content_status');
        $isPublished   = $request->get('is_published');

        $cityPages = ServiceCityPage::query()
            ->with(['service', 'city'])
            ->when($search, fn($q) => $q->whereHas('service', fn($q) => $q->where('name', 'like', "%{$search}%"))
                ->orWhereHas('city', fn($q) => $q->where('name', 'like', "%{$search}%")))
            ->when($serviceId, fn($q) => $q->where('service_id', $serviceId))
            ->when($cityId, fn($q) => $q->where('city_id', $cityId))
            ->when($contentStatus, fn($q) => $q->where('content_status', $contentStatus))
            ->when($isPublished === 'published', fn($q) => $q->where('is_published', true))
            ->when($isPublished === 'unpublished', fn($q) => $q->where('is_published', false))
            ->latest()
            ->paginate($perPage);

        $summary = [
            'total'        => ServiceCityPage::count(),
            'published'    => ServiceCityPage::where('is_published', true)->count(),
            'ai_generated' => ServiceCityPage::where('content_status', 'ai_generated')->count(),
            'draft'        => ServiceCityPage::where('content_status', 'draft')->count(),
        ];

        $services = Service::where('status', 'active')->orderBy('name')->get(['id', 'name']);
        $cities   = City::where('status', 'active')->orderBy('sort_order')->get(['id', 'name']);

        return Inertia::render('services/city-pages/index', [
            'cityPages' => $cityPages,
            'summary'   => $summary,
            'services'  => $services,
            'cities'    => $cities,
            'filters'   => [
                'search'         => $search,
                'per_page'       => $perPage,
                'service_id'     => $serviceId,
                'city_id'        => $cityId,
                'content_status' => $contentStatus,
                'is_published'   => $isPublished,
            ],
        ]);
    }

    public function create()
    {
        $services = Service::where('status', 'active')
            ->whereHas('seo', fn($q) => $q->whereNotNull('meta_title'))
            ->orderBy('name')
            ->get(['id', 'name']);

        $cities = City::where('status', 'active')
            ->orderBy('sort_order')
            ->get(['id', 'name', 'province']);

        return Inertia::render('services/city-pages/create', [
            'services' => $services,
            'cities'   => $cities,
        ]);
    }

    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        $service = Service::findOrFail($validated['service_id']);

        if (!$service->hasSeo()) {
            return back()->withErrors([
                'service_id' => 'Lengkapi SEO halaman utama layanan ini terlebih dahulu.'
            ]);
        }

        $city    = City::findOrFail($validated['city_id']);
        $slug    = Str::slug("{$service->name}-di-{$city->name}");
        $original = $slug;
        $counter  = 1;
        while (ServiceCityPage::where('slug', $slug)->exists()) {
            $slug = "{$original}-{$counter}";
            $counter++;
        }

        ServiceCityPage::create([
            'service_id'     => $validated['service_id'],
            'city_id'        => $validated['city_id'],
            'slug'           => $slug,
            'content_status' => 'draft',
        ]);

        return to_route('services.city-pages.index')
            ->with('success', 'Halaman kota berhasil ditambahkan.');
    }

    public function edit(ServiceCityPage $cityPage)
    {
        $cityPage->load(['service.seo', 'city']);

        return Inertia::render('services/city-pages/edit', [
            'cityPage' => $cityPage,
        ]);
    }

    public function updateContent(UpdateContentRequest $request, ServiceCityPage $cityPage)
    {
        $validated = $request->validated();

        $cityPage->update([
            ...$validated,
            'is_manually_edited' => true,
            'content_status'     => $cityPage->content_status === 'draft' ? 'reviewed' : $cityPage->content_status,
        ]);

        return back()->with('success', 'Konten halaman kota berhasil diperbarui.');
    }

    public function updateSeo(UpdateSeoRequest $request, ServiceCityPage $cityPage)
    {
        $cityPage->update($request->validated());

        return back()->with('success', 'SEO halaman kota berhasil diperbarui.');
    }

    public function publish(ServiceCityPage $cityPage)
    {
        if (!$cityPage->isReadyToPublish()) {
            return back()->withErrors([
                'publish' => 'Pastikan konten dan meta title sudah terisi sebelum publish.'
            ]);
        }

        $cityPage->markAsPublished();

        return back()->with('success', 'Halaman kota berhasil dipublish.');
    }

    public function destroy(ServiceCityPage $cityPage)
    {
        $cityPage->delete();

        return back()->with('success', 'Halaman kota berhasil dihapus.');
    }
}
