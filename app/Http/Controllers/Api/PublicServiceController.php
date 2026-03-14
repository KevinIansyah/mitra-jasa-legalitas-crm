<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\ServiceCityPage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicServiceController extends Controller
{
    // ========================================================================
    // GET /layanan
    // List all services
    // Query params: ?kategori=slug&kota=slug
    // ========================================================================

    public function index(Request $request): JsonResponse
    {
        $services = Service::query()
            ->with(['category:id,name,slug'])
            ->where('is_published', true)
            ->where('status', 'active')
            ->when(
                $request->kategori,
                fn($query) => $query->whereHas('category', fn($query) => $query->where('slug', $request->kategori))
            )
            ->when(
                $request->kota,
                fn($query) => $query->whereHas('cityPages', function ($query) use ($request) {
                    $query->where('is_published', true)
                        ->whereHas('city', fn($query) => $query->where('slug', $request->kota));
                })
            )
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'service_category_id', 'name', 'slug', 'short_description', 'featured_image', 'is_featured', 'is_popular'])
            ->map(fn($service) => $this->formatServiceCard($service));

        return ApiResponse::success($services);
    }

    // ========================================================================
    // GET /layanan/kategori/{categorySlug}
    // List services by category
    // ========================================================================

    public function byCategory(string $categorySlug): JsonResponse
    {
        $category = ServiceCategory::where('slug', $categorySlug)
            ->where('status', 'active')
            ->firstOrFail();

        $services = Service::with(['category:id,name,slug'])
            ->where('service_category_id', $category->id)
            ->where('is_published', true)
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'service_category_id', 'name', 'slug', 'short_description', 'featured_image', 'is_featured', 'is_popular'])
            ->map(fn($service) => $this->formatServiceCard($service));

        return ApiResponse::success([
            'category' => [
                'id'   => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
            ],
            'services' => $services,
        ]);
    }

    // ========================================================================
    // GET /layanan/kota/{citySlug}
    // List services by city
    // ========================================================================

    public function byCity(string $citySlug): JsonResponse
    {
        $city = City::where('slug', $citySlug)
            ->where('status', 'active')
            ->firstOrFail();

        $cityPages = ServiceCityPage::where('city_id', $city->id)
            ->where('is_published', true)
            ->with([
                'service' => fn($query) => $query
                    ->where('is_published', true)
                    ->where('status', 'active')
                    ->with('category:id,name,slug'),
            ])
            ->get()
            ->filter(fn($page) => $page->service !== null);

        $r2Url = rtrim(config('filesystems.disks.r2_public.url', ''), '/');

        return ApiResponse::success([
            'city' => [
                'id'       => $city->id,
                'name'     => $city->name,
                'slug'     => $city->slug,
                'province' => $city->province,
            ],
            'services' => $cityPages->map(fn($page) => [
                'id'                => $page->service->id,
                'name'              => $page->service->name,
                'slug'              => $page->service->slug,
                'short_description' => $page->service->short_description,
                'featured_image'    => $page->service->featured_image ? "{$r2Url}/{$page->service->featured_image}" : null,
                'is_featured'       => $page->service->is_featured,
                'is_popular'        => $page->service->is_popular,
                'category'          => $page->service->category ? [
                    'id'   => $page->service->category->id,
                    'name' => $page->service->category->name,
                    'slug' => $page->service->category->slug,
                ] : null,
                'city_page' => [
                    'heading'          => $page->heading,
                    'meta_description' => $page->meta_description,
                ],
            ])->values(),
        ]);
    }

    // ========================================================================
    // GET /layanan/{serviceSlug}
    // Detail service
    // ========================================================================

    public function show(string $serviceSlug): JsonResponse
    {
        $service = Service::where('slug', $serviceSlug)
            ->where('is_published', true)
            ->where('status', 'active')
            ->with([
                'category:id,name,slug',
                'seo',
                'packages' => fn($query) => $query->where('status', 'active')->orderBy('sort_order')->with([
                    'features' => fn($query) => $query->orderBy('sort_order'),
                ]),
                'processSteps'          => fn($query) => $query->where('status', 'active')->orderBy('sort_order'),
                'requirementCategories' => fn($query) => $query->where('status', 'active')->orderBy('sort_order')->with([
                    'requirements' => fn($query) => $query->where('status', 'active')->orderBy('sort_order'),
                ]),
                'legalBases' => fn($query) => $query->where('status', 'active')->orderBy('sort_order'),
                'faqs'       => fn($query) => $query->where('status', 'active')->orderBy('sort_order'),
            ])
            ->firstOrFail();

        $r2Url = rtrim(config('filesystems.disks.r2_public.url', ''), '/');

        return ApiResponse::success([
            'id'                => $service->id,
            'name'              => $service->name,
            'slug'              => $service->slug,
            'short_description' => $service->short_description,
            'introduction'      => $service->introduction,
            'content'           => $service->content,
            'featured_image'    => $service->featured_image ? "{$r2Url}/{$service->featured_image}" : null,
            'is_featured'       => $service->is_featured,
            'is_popular'        => $service->is_popular,
            'category'          => $service->category ? [
                'id'   => $service->category->id,
                'name' => $service->category->name,
                'slug' => $service->category->slug,
            ] : null,
            'seo' => $service->seo ? [
                'meta_title'       => $service->seo->meta_title,
                'meta_description' => $service->seo->meta_description,
                'focus_keyword'    => $service->seo->focus_keyword,
                'og_title'         => $service->seo->og_title,
                'og_description'   => $service->seo->og_description,
                'og_image'         => $service->seo->og_image ? "{$r2Url}/{$service->seo->og_image}" : null,
                'twitter_card'     => $service->seo->twitter_card,
                'twitter_image'    => $service->seo->twitter_image ? "{$r2Url}/{$service->seo->twitter_image}" : null,
                'robots'           => $service->seo->robots,
                'in_sitemap'       => $service->seo->in_sitemap,
                'sitemap_priority' => $service->seo->sitemap_priority,
                'schema_markup'    => $service->seo->schema_markup,
            ] : null,
            'packages'               => $this->formatPackages($service->packages),
            'process_steps'          => $this->formatProcessSteps($service->processSteps),
            'requirement_categories' => $this->formatRequirementCategories($service->requirementCategories),
            'legal_bases'            => $this->formatLegalBases($service->legalBases),
            'faqs'                   => $service->faqs->map(fn($faq) => [
                'question'   => $faq->question,
                'answer'     => $faq->answer,
                'sort_order' => $faq->sort_order,
            ]),
        ]);
    }

    // ========================================================================
    // GET /layanan/{serviceSlug}/{citySlug}
    // Detail service by city
    // ========================================================================

    public function showCityPage(string $serviceSlug, string $citySlug): JsonResponse
    {
        $service = Service::where('slug', $serviceSlug)
            ->where('is_published', true)
            ->where('status', 'active')
            ->with([
                'packages' => fn($query) => $query->where('status', 'active')->orderBy('sort_order')->with([
                    'features' => fn($query) => $query->orderBy('sort_order'),
                ]),
                'processSteps'          => fn($query) => $query->where('status', 'active')->orderBy('sort_order'),
                'requirementCategories' => fn($query) => $query->where('status', 'active')->orderBy('sort_order')->with([
                    'requirements' => fn($query) => $query->where('status', 'active')->orderBy('sort_order'),
                ]),
                'legalBases' => fn($query) => $query->where('status', 'active')->orderBy('sort_order'),
            ])
            ->firstOrFail();

        $cityPage = ServiceCityPage::where('service_id', $service->id)
            ->where('is_published', true)
            ->whereHas('city', fn($query) => $query->where('slug', $citySlug))
            ->with('city:id,name,slug,province')
            ->firstOrFail();

        $r2Url = rtrim(config('filesystems.disks.r2_public.url', ''), '/');

        return ApiResponse::success([
            'heading'          => $cityPage->heading,
            'introduction'     => $cityPage->introduction,
            'content'          => $cityPage->content,
            'faq'              => $cityPage->faq ?? [],
            'meta_title'       => $cityPage->meta_title,
            'meta_description' => $cityPage->meta_description,
            'focus_keyword'    => $cityPage->focus_keyword,
            'schema_markup'    => $cityPage->schema_markup,
            'robots'           => $cityPage->robots,
            'in_sitemap'       => $cityPage->in_sitemap,
            'sitemap_priority' => $cityPage->sitemap_priority,
            'service' => [
                'id'                => $service->id,
                'name'              => $service->name,
                'slug'              => $service->slug,
                'short_description' => $service->short_description,
                'featured_image'    => $service->featured_image ? "{$r2Url}/{$service->featured_image}" : null,
            ],
            'city' => [
                'id'       => $cityPage->city->id,
                'name'     => $cityPage->city->name,
                'slug'     => $cityPage->city->slug,
                'province' => $cityPage->city->province,
            ],
            'packages'               => $this->formatPackages($service->packages),
            'process_steps'          => $this->formatProcessSteps($service->processSteps),
            'requirement_categories' => $this->formatRequirementCategories($service->requirementCategories),
            'legal_bases'            => $this->formatLegalBases($service->legalBases),
        ]);
    }

    // ========================================================================
    // HELPERS
    // ========================================================================

    private function formatServiceCard(Service $service): array
    {
        $r2Url = rtrim(config('filesystems.disks.r2_public.url', ''), '/');

        return [
            'id'                => $service->id,
            'name'              => $service->name,
            'slug'              => $service->slug,
            'short_description' => $service->short_description,
            'featured_image'    => $service->featured_image ? "{$r2Url}/{$service->featured_image}" : null,
            'is_featured'       => $service->is_featured,
            'is_popular'        => $service->is_popular,
            'category'          => $service->category ? [
                'id'   => $service->category->id,
                'name' => $service->category->name,
                'slug' => $service->category->slug,
            ] : null,
        ];
    }

    private function formatPackages($packages): array
    {
        return $packages->map(fn($package) => [
            'name'              => $package->name,
            'price'             => $package->price,
            'original_price'    => $package->original_price,
            'duration'          => $package->duration,
            'duration_days'     => $package->duration_days,
            'short_description' => $package->short_description,
            'is_highlighted'    => $package->is_highlighted,
            'badge'             => $package->badge,
            'sort_order'        => $package->sort_order,
            'features'          => $package->features->map(fn($feature) => [
                'feature_name' => $feature->feature_name,
                'description'  => $feature->description,
                'is_included'  => $feature->is_included,
                'sort_order'   => $feature->sort_order,
            ]),
        ])->toArray();
    }

    private function formatProcessSteps($steps): array
    {
        return $steps->map(fn($step) => [
            'title'              => $step->title,
            'description'        => $step->description,
            'duration'           => $step->duration,
            'duration_days'      => $step->duration_days,
            'required_documents' => $step->required_documents,
            'notes'              => $step->notes,
            'icon'               => $step->icon,
            'sort_order'         => $step->sort_order,
        ])->toArray();
    }

    private function formatRequirementCategories($categories): array
    {
        return $categories->map(fn($category) => [
            'name'         => $category->name,
            'description'  => $category->description,
            'sort_order'   => $category->sort_order,
            'requirements' => $category->requirements->map(fn($requirement) => [
                'name'            => $requirement->name,
                'description'     => $requirement->description,
                'is_required'     => $requirement->is_required,
                'document_format' => $requirement->document_format,
                'notes'           => $requirement->notes,
                'sort_order'      => $requirement->sort_order,
            ]),
        ])->toArray();
    }

    private function formatLegalBases($legalBases): array
    {
        return $legalBases->map(fn($legalBasis) => [
            'document_type'   => $legalBasis->document_type,
            'document_number' => $legalBasis->document_number,
            'title'           => $legalBasis->title,
            'issued_date'     => $legalBasis->issued_date,
            'url'             => $legalBasis->url,
            'description'     => $legalBasis->description,
            'sort_order'      => $legalBasis->sort_order,
        ])->toArray();
    }
}
