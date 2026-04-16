<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\City;
use App\Models\Service;
use App\Models\ServiceCityPage;
use App\Models\ServicePackage;
use App\Models\SiteSetting;
use App\Traits\BuildSeoSchema;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicServiceController extends Controller
{
    use BuildSeoSchema;

    // ========================================================================
    // GET /services/compact
    // ========================================================================

    public function compactList(): JsonResponse
    {
        $services = Service::query()
            ->where('is_published', true)
            ->where('status', 'active')
            ->with([
                'category:id,name,slug,palette_color',
            ])
            ->orderBy('name')
            ->get([
                'id',
                'service_category_id',
                'name',
                'slug',
                'short_description',
                'is_featured',
                'is_popular',
            ]);

        $mapped = $services->map(fn(Service $s) => [
            'id' => $s->id,
            'name' => $s->name,
            'slug' => $s->slug,
            'short_description' => $s->short_description,
            'is_featured' => $s->is_featured,
            'is_popular' => $s->is_popular,
            'category' => $s->category ? [
                'id' => $s->category->id,
                'name' => $s->category->name,
                'slug' => $s->category->slug,
                'palette_color' => $s->category->palette_color,
            ] : null,
        ]);

        return ApiResponse::success(['services' => $mapped]);
    }

    // ========================================================================
    // GET /services/{service}/packages  (service = numeric id)
    // ========================================================================

    /**
     * Paket aktif untuk satu layanan (by service id). Hanya layanan published + active.
     */
    public function packagesByService(Service $service): JsonResponse
    {
        if (! $service->is_published || $service->status !== 'active') {
            return ApiResponse::notFound('Layanan tidak ditemukan.');
        }

        $packages = $service->packages()
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->with(['features' => fn($q) => $q->orderBy('sort_order')])
            ->get();

        return ApiResponse::success([
            'service' => [
                'id' => $service->id,
                'name' => $service->name,
                'slug' => $service->slug,
            ],
            'packages' => $this->formatPackages($packages),
        ]);
    }

    // ========================================================================
    // GET /services
    // ========================================================================

    public function index(Request $request): JsonResponse
    {
        $categorySlugs = $request->input('category', []);
        $priceRanges = $request->input('price', []);
        $sort = $request->input('sort');

        if (is_string($categorySlugs)) {
            $categorySlugs = [$categorySlugs];
        }
        if (is_string($priceRanges)) {
            $priceRanges = [$priceRanges];
        }
        $priceRanges = array_filter($priceRanges, fn($v) => in_array((string) $v, ['1', '2', '3', '4', '5']));

        $services = Service::query()
            ->with([
                'category:id,name,slug,palette_color',
                'cheapestPackage.includedFeatures',
                'cityPages' => fn($q) => $q->where('is_published', true)->with([
                    'city' => fn($q) => $q->select('id', 'name'),
                ]),
            ])
            ->where('is_published', true)
            ->where('status', 'active')
            ->when(
                ! empty($categorySlugs),
                fn($q) => $q->whereHas('category', fn($q) => $q->whereIn('slug', $categorySlugs))
            )
            ->when(! empty($priceRanges), function ($q) use ($priceRanges) {
                $q->whereHas('cheapestPackage', function ($q) use ($priceRanges) {
                    $q->where(function ($q) use ($priceRanges) {
                        foreach ($priceRanges as $index => $range) {
                            $method = $index === 0 ? 'where' : 'orWhere';
                            match ((string) $range) {
                                '1' => $q->{$method}('price', '<', 1_000_000),
                                '2' => $q->{$method . 'Between'}('price', [1_000_000, 2_999_999]),
                                '3' => $q->{$method . 'Between'}('price', [3_000_000, 4_999_999]),
                                '4' => $q->{$method . 'Between'}('price', [5_000_000, 9_999_999]),
                                '5' => $q->{$method}('price', '>=', 10_000_000),
                                default => null,
                            };
                        }
                    });
                });
            });

        if ($sort === 'popular') {
            $services->orderByDesc('is_popular');
        } elseif ($sort === 'name_asc') {
            $services->orderBy('name', 'asc');
        } elseif ($sort === 'price_asc') {
            $services->orderBy(
                ServicePackage::select('price')
                    ->whereColumn('service_id', 'services.id')
                    ->where('status', 'active')
                    ->orderBy('price', 'asc')
                    ->limit(1)
            );
        } elseif ($sort === 'price_desc') {
            $services->orderByDesc(
                ServicePackage::select('price')
                    ->whereColumn('service_id', 'services.id')
                    ->where('status', 'active')
                    ->orderBy('price', 'asc')
                    ->limit(1)
            );
        } else {
            $services->latest();
        }

        $services = $services
            ->get(['id', 'service_category_id', 'name', 'slug', 'short_description', 'featured_image', 'is_featured', 'is_popular'])
            ->map(fn($service) => $this->formatServiceCard($service));

        return ApiResponse::success([
            'seo' => $this->buildSeoList($services->toArray()),
            'services' => $services,
        ]);
    }

    // ========================================================================
    // GET /services/categories/{categorySlug}
    // ========================================================================

    /**
     * Sama seperti GET /services?category[]=slug, tapi lewat path (SEO-friendly).
     */
    public function byCategory(Request $request, string $categorySlug): JsonResponse
    {
        $request->merge(['category' => [$categorySlug]]);

        return $this->index($request);
    }

    // ========================================================================
    // GET /services/cities/{citySlug}
    // ========================================================================

    public function byCity(Request $request, string $citySlug): JsonResponse
    {
        $city = City::where('slug', $citySlug)
            ->where('status', 'active')
            ->first();

        if (! $city) {
            return ApiResponse::notFound('Kota tidak ditemukan.');
        }

        $categorySlugs = $request->input('category', []);
        $priceRanges = $request->input('price', []);
        $sort = $request->input('sort');

        if (is_string($categorySlugs)) {
            $categorySlugs = [$categorySlugs];
        }
        if (is_string($priceRanges)) {
            $priceRanges = [$priceRanges];
        }

        $priceRanges = array_filter($priceRanges, fn($v) => in_array((string) $v, ['1', '2', '3', '4', '5']));

        $cityPages = ServiceCityPage::where('city_id', $city->id)
            ->where('service_city_pages.is_published', true)
            ->whereHas('service', function ($q) use ($categorySlugs, $priceRanges) {
                $q->where('services.is_published', true)
                    ->where('services.status', 'active')
                    ->when(
                        ! empty($categorySlugs),
                        fn($q) => $q->whereHas(
                            'category',
                            fn($q) => $q->whereIn('slug', $categorySlugs)
                        )
                    )
                    ->when(
                        ! empty($priceRanges),
                        function ($q) use ($priceRanges) {
                            $q->whereHas('cheapestPackage', function ($q) use ($priceRanges) {
                                $q->where(function ($q) use ($priceRanges) {
                                    foreach ($priceRanges as $index => $range) {
                                        $method = $index === 0 ? 'where' : 'orWhere';
                                        match ((string) $range) {
                                            '1' => $q->{$method}('price', '<', 1_000_000),
                                            '2' => $q->{$method . 'Between'}('price', [1_000_000, 2_999_999]),
                                            '3' => $q->{$method . 'Between'}('price', [3_000_000, 4_999_999]),
                                            '4' => $q->{$method . 'Between'}('price', [5_000_000, 9_999_999]),
                                            '5' => $q->{$method}('price', '>=', 10_000_000),
                                            default => null,
                                        };
                                    }
                                });
                            });
                        }
                    );
            })
            ->with([
                'service' => fn($query) => $query
                    ->where('is_published', true)
                    ->where('status', 'active')
                    ->with('category:id,name,slug,palette_color'),
            ]);

        if ($sort === 'popular') {
            $cityPages->join('services', 'services.id', '=', 'service_city_pages.service_id')
                ->orderByDesc('services.is_popular')
                ->select('service_city_pages.*');
        } elseif ($sort === 'name_asc') {
            $cityPages->join('services', 'services.id', '=', 'service_city_pages.service_id')
                ->orderBy('services.name', 'asc')
                ->select('service_city_pages.*');
        } elseif ($sort === 'price_asc') {
            $cityPages->orderBy(
                ServicePackage::select('price')
                    ->whereColumn('service_id', 'service_city_pages.service_id')
                    ->where('status', 'active')
                    ->orderBy('price', 'asc')
                    ->limit(1)
            );
        } elseif ($sort === 'price_desc') {
            $cityPages->orderByDesc(
                ServicePackage::select('price')
                    ->whereColumn('service_id', 'service_city_pages.service_id')
                    ->where('status', 'active')
                    ->orderBy('price', 'asc')
                    ->limit(1)
            );
        } else {
            $cityPages->latest('service_city_pages.created_at');
        }

        $cityPages = $cityPages
            ->get(['service_city_pages.*'])
            ->filter(fn($page) => $page->service !== null);

        $r2Url = rtrim(config('filesystems.disks.r2_public.url', ''), '/');

        $mappedServices = $cityPages->map(fn($page) => [
            'id' => $page->service->id,
            'name' => $page->service->name,
            'slug' => $page->service->slug,
            'short_description' => $page->service->short_description,
            'featured_image' => $page->service->featured_image
                ? "{$r2Url}/{$page->service->featured_image}"
                : null,
            'is_featured' => $page->service->is_featured,
            'is_popular' => $page->service->is_popular,
            'category' => $page->service->category ? [
                'id' => $page->service->category->id,
                'name' => $page->service->category->name,
                'slug' => $page->service->category->slug,
                'palette_color' => $page->service->category->palette_color,
            ] : null,
            'packages' => [
                'id' => $page->service->cheapestPackage->id,
                'name' => $page->service->cheapestPackage->name,
                'price' => $page->service->cheapestPackage->price,
                'duration' => $page->service->cheapestPackage->duration,
                'duration_days' => $page->service->cheapestPackage->duration_days,
                'short_description' => $page->service->cheapestPackage->short_description,
                'features' => $page->service->cheapestPackage->features->map(fn($feature) => [
                    'feature_name' => $feature->feature_name,
                    'description' => $feature->description,
                    'is_included' => $feature->is_included,
                    'sort_order' => $feature->sort_order,
                ]),
            ],
            'city_page' => [
                'heading' => $page->heading,
                'meta_description' => $page->meta_description,
            ],
        ])->values();

        return ApiResponse::success([
            'city' => [
                'id' => $city->id,
                'name' => $city->name,
                'slug' => $city->slug,
                'province' => $city->province,
            ],
            'seo' => $this->buildSeoListByCity($city, $mappedServices->toArray()),
            'services' => $mappedServices,
        ]);
    }

    // ========================================================================
    // GET /services/{serviceSlug}
    // ========================================================================

    public function show(string $serviceSlug): JsonResponse
    {
        $service = Service::where('slug', $serviceSlug)
            ->where('is_published', true)
            ->where('status', 'active')
            ->with([
                'category:id,name,slug,palette_color',
                'seo',
                'packages' => fn($query) => $query->where('status', 'active')->orderBy('sort_order')->with([
                    'features' => fn($query) => $query->orderBy('sort_order'),
                ]),
                'processSteps' => fn($query) => $query->where('status', 'active')->orderBy('sort_order'),
                'requirementCategories' => fn($query) => $query->where('status', 'active')->orderBy('sort_order')->with([
                    'requirements' => fn($query) => $query->where('status', 'active')->orderBy('sort_order'),
                ]),
                'legalBases' => fn($query) => $query->where('status', 'active')->orderBy('sort_order'),
                'faqs' => fn($query) => $query->where('status', 'active')->orderBy('sort_order'),
                'blogs' => fn($q) => $q->published()
                    ->orderByDesc('published_at')
                    ->with([
                        'category:id,name,slug',
                    ])
                    ->limit(6),
                'cityPages' => fn($q) => $q->where('is_published', true)->with([
                    'city' => fn($q) => $q->select('id', 'name', 'province', 'slug'),
                ]),
            ])
            ->first();

        if (! $service) {
            return ApiResponse::notFound('Layanan tidak ditemukan.');
        }

        $r2Url = rtrim(config('filesystems.disks.r2_public.url', ''), '/');

        return ApiResponse::success([
            'id' => $service->id,
            'name' => $service->name,
            'slug' => $service->slug,
            'short_description' => $service->short_description,
            'introduction' => $service->introduction,
            'content' => $service->content,
            'featured_image' => $service->featured_image ? "{$r2Url}/{$service->featured_image}" : null,
            'is_featured' => $service->is_featured,
            'is_popular' => $service->is_popular,
            'category' => $service->category ? [
                'id' => $service->category->id,
                'name' => $service->category->name,
                'slug' => $service->category->slug,
                'palette_color' => $service->category->palette_color,
            ] : null,
            'city_pages' => $service->cityPages->map(fn($cityPage) => [
                'id' => $cityPage->id,
                'name' => $cityPage->city->name,
                'slug' => $cityPage->city->slug,
                'province' => $cityPage->city->province,
            ]),
            'seo' => $service->seo ? [
                'meta_title' => $service->seo->meta_title,
                'meta_description' => $service->seo->meta_description,
                'focus_keyword' => $service->seo->focus_keyword,
                'og_title' => $service->seo->og_title,
                'og_description' => $service->seo->og_description,
                'og_image' => $service->seo->og_image ? "{$r2Url}/{$service->seo->og_image}" : "{$r2Url}/{$service->featured_image}",
                'twitter_card' => $service->seo->twitter_card,
                'twitter_image' => $service->seo->twitter_image ? "{$r2Url}/{$service->seo->twitter_image}" : "{$r2Url}/{$service->featured_image}",
                'robots' => $service->seo->robots,
                'in_sitemap' => $service->seo->in_sitemap,
                'sitemap_priority' => $service->seo->sitemap_priority,
                'schema_markup' => $service->seo->schema_markup,
            ] : null,
            'packages' => $this->formatPackages($service->packages),
            'process_steps' => $this->formatProcessSteps($service->processSteps),
            'requirement_categories' => $this->formatRequirementCategories($service->requirementCategories),
            'legal_bases' => $this->formatLegalBases($service->legalBases),
            'faqs' => $service->faqs->map(fn($faq) => [
                'question' => $faq->question,
                'answer' => $faq->answer,
                'sort_order' => $faq->sort_order,
            ]),
            'blogs' => $service->blogs->map(fn(Blog $blog) => $this->formatBlogCard($blog)),
        ]);
    }

    // ========================================================================
    // GET /services/{serviceSlug}/{citySlug}
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
                'processSteps' => fn($query) => $query->where('status', 'active')->orderBy('sort_order'),
                'requirementCategories' => fn($query) => $query->where('status', 'active')->orderBy('sort_order')->with([
                    'requirements' => fn($query) => $query->where('status', 'active')->orderBy('sort_order'),
                ]),
                'legalBases' => fn($query) => $query->where('status', 'active')->orderBy('sort_order'),
            ])
            ->first();

        if (! $service) {
            return ApiResponse::error('Layanan tidak ditemukan', 404);
        }

        $cityPage = ServiceCityPage::where('service_id', $service->id)
            ->where('is_published', true)
            ->whereHas('city', fn($query) => $query->where('slug', $citySlug))
            ->with('city:id,name,slug,province')
            ->first();

        if (! $cityPage) {
            return ApiResponse::error('Halaman kota tidak ditemukan', 404);
        }

        $r2Url = rtrim(config('filesystems.disks.r2_public.url', ''), '/');

        return ApiResponse::success([
            'heading' => $cityPage->heading,
            'introduction' => $cityPage->introduction,
            'content' => $cityPage->content,
            'faq' => $cityPage->faq ?? [],
            'seo' => [
                'meta_title' => $cityPage->meta_title,
                'meta_description' => $cityPage->meta_description,
                'focus_keyword' => $cityPage->focus_keyword,
                'schema_markup' => $cityPage->schema_markup,
                'robots' => $cityPage->robots,
                'in_sitemap' => $cityPage->in_sitemap,
                'sitemap_priority' => $cityPage->sitemap_priority,
            ],
            'service' => [
                'id' => $service->id,
                'name' => $service->name,
                'slug' => $service->slug,
                'short_description' => $service->short_description,
                'featured_image' => $service->featured_image ? "{$r2Url}/{$service->featured_image}" : null,
            ],
            'city' => [
                'id' => $cityPage->city->id,
                'name' => $cityPage->city->name,
                'slug' => $cityPage->city->slug,
                'province' => $cityPage->city->province,
            ],
            'packages' => $this->formatPackages($service->packages),
            'process_steps' => $this->formatProcessSteps($service->processSteps),
            'requirement_categories' => $this->formatRequirementCategories($service->requirementCategories),
            'legal_bases' => $this->formatLegalBases($service->legalBases),
        ]);
    }

    // ========================================================================
    // HELPERS
    // ========================================================================

    private function formatServiceCard(Service $service): array
    {
        $r2Url = rtrim(config('filesystems.disks.r2_public.url', ''), '/');

        return [
            'id' => $service->id,
            'name' => $service->name,
            'slug' => $service->slug,
            'short_description' => $service->short_description,
            'featured_image' => $service->featured_image ? "{$r2Url}/{$service->featured_image}" : null,
            'is_featured' => $service->is_featured,
            'is_popular' => $service->is_popular,
            'category' => $service->category ? [
                'id' => $service->category->id,
                'name' => $service->category->name,
                'slug' => $service->category->slug,
                'palette_color' => $service->category->palette_color,
            ] : null,
            'cheapest_package' => $service->cheapestPackage ? [
                'id' => $service->cheapestPackage->id,
                'name' => $service->cheapestPackage->name,
                'price' => $service->cheapestPackage->price,
                'duration' => $service->cheapestPackage->duration,
                'duration_days' => $service->cheapestPackage->duration_days,
                'short_description' => $service->cheapestPackage->short_description,
                'features' => $service->cheapestPackage->features->map(fn($feature) => [
                    'feature_name' => $feature->feature_name,
                    'description' => $feature->description,
                    'is_included' => $feature->is_included,
                    'sort_order' => $feature->sort_order,
                ]),
            ] : null,
            'city_pages' => $service->cityPages->map(fn($cityPage) => [
                'id' => $cityPage->id,
                'name' => $cityPage->city->name,
            ]),
        ];
    }

    /**
     * URL publik aset (sama pola dengan {@see PublicHomeController::publicAssetUrl()}).
     */
    private function publicAssetUrl(?string $path, string $r2Url): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        $path = ltrim($path, '/');

        return "{$r2Url}/{$path}";
    }

    /**
     * Sama struktur kartu blog dengan {@see PublicBlogController::formatBlogCard()}.
     */
    private function formatBlogCard(Blog $blog): array
    {
        $r2Url = rtrim(config('filesystems.disks.r2_public.url', ''), '/');

        return [
            'id' => $blog->id,
            'title' => $blog->title,
            'slug' => $blog->slug,
            'short_description' => $blog->short_description,
            'featured_image' => $this->publicAssetUrl($blog->featured_image, $r2Url),
            'is_featured' => $blog->is_featured,
            'views' => $blog->views,
            'reading_time' => $blog->reading_time,
            'published_at' => $blog->published_at,
            'category' => $blog->category ? [
                'id' => $blog->category->id,
                'name' => $blog->category->name,
                'slug' => $blog->category->slug,
            ] : null,
            'author' => $blog->author ? [
                'id' => $blog->author->id,
                'name' => $blog->author->name,
                'avatar' => $this->publicAssetUrl($blog->author->avatar, $r2Url),
                'position' => $blog->author->staffProfile?->position,
                'bio' => $blog->author->staffProfile?->bio,
            ] : null,
            'tags' => $blog->tags->map(fn($tag) => [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
            ]),
        ];
    }

    private function formatPackages($packages): array
    {
        return $packages->map(fn($package) => [
            'id' => $package->id,
            'name' => $package->name,
            'price' => $package->price,
            'original_price' => $package->original_price,
            'duration' => $package->duration,
            'duration_days' => $package->duration_days,
            'short_description' => $package->short_description,
            'is_highlighted' => $package->is_highlighted,
            'badge' => $package->badge,
            'sort_order' => $package->sort_order,
            'features' => $package->features->map(fn($feature) => [
                'feature_name' => $feature->feature_name,
                'description' => $feature->description,
                'is_included' => $feature->is_included,
                'sort_order' => $feature->sort_order,
            ]),
        ])->toArray();
    }

    private function formatProcessSteps($steps): array
    {
        return $steps->map(fn($step) => [
            'title' => $step->title,
            'description' => $step->description,
            'duration' => $step->duration,
            'duration_days' => $step->duration_days,
            'required_documents' => $step->required_documents,
            'notes' => $step->notes,
            'icon' => $step->icon,
            'sort_order' => $step->sort_order,
        ])->toArray();
    }

    private function formatRequirementCategories($categories): array
    {
        return $categories->map(fn($category) => [
            'name' => $category->name,
            'description' => $category->description,
            'sort_order' => $category->sort_order,
            'requirements' => $category->requirements->map(fn($requirement) => [
                'name' => $requirement->name,
                'description' => $requirement->description,
                'is_required' => $requirement->is_required,
                'document_format' => $requirement->document_format,
                'notes' => $requirement->notes,
                'sort_order' => $requirement->sort_order,
            ]),
        ])->toArray();
    }

    private function formatLegalBases($legalBases): array
    {
        return $legalBases->map(fn($legalBasis) => [
            'document_type' => $legalBasis->document_type,
            'document_number' => $legalBasis->document_number,
            'title' => $legalBasis->title,
            'issued_date' => $legalBasis->issued_date,
            'url' => $legalBasis->url,
            'description' => $legalBasis->description,
            'sort_order' => $legalBasis->sort_order,
        ])->toArray();
    }

    private function buildSeoList(array $services): array
    {
        $site = SiteSetting::get();
        $r2Url = rtrim(config('filesystems.disks.r2_public.url', ''), '/');
        $base = rtrim((string) ($site->org_url ?? $site->company_website ?? config('app.url')), '/');
        $pageUrl = $base . '/layanan';

        $metaTitle = $site->getPageTitle('Layanan');
        $metaDescription = 'Temukan berbagai layanan profesional yang kami tawarkan. Pilih sesuai kebutuhan bisnis Anda.';
        $ogImage = $site->default_og_image
            ? "{$r2Url}/{$site->default_og_image}"
            : ($site->company_logo ? "{$r2Url}/{$site->company_logo}" : null);

        $itemList = [
            '@type' => 'ItemList',
            'name' => 'Daftar Layanan',
            'url' => $pageUrl,
            'numberOfItems' => count($services),
            'itemListElement' => collect($services)->values()->map(fn($service, $i) => [
                '@type' => 'ListItem',
                'position' => $i + 1,
                'name' => $service['name'],
                'url' => $base . '/layanan/' . $service['slug'],
            ])->toArray(),
        ];

        $breadcrumb = [
            '@type' => 'BreadcrumbList',
            'itemListElement' => [
                ['@type' => 'ListItem', 'position' => 1, 'name' => 'Beranda', 'item' => $base],
                ['@type' => 'ListItem', 'position' => 2, 'name' => 'Layanan', 'item' => $pageUrl],
            ],
        ];

        $webPage = [
            '@type' => 'WebPage',
            '@id' => $pageUrl . '#webpage',
            'url' => $pageUrl,
            'name' => $metaTitle,
            'description' => $metaDescription,
            'inLanguage' => 'id-ID',
            'isPartOf' => ['@id' => $base . '#website'],
            'about' => ['@id' => $base . '#organization'],
        ];

        return [
            'meta_title' => $metaTitle,
            'meta_description' => $metaDescription,
            'canonical_url' => $pageUrl,
            'robots' => 'index, follow',
            'in_sitemap' => true,
            'sitemap_priority' => '0.8',
            'open_graph' => array_filter([
                'og:type' => 'website',
                'og:site_name' => $site->company_name,
                'og:title' => $metaTitle,
                'og:description' => $metaDescription,
                'og:url' => $pageUrl,
                'og:image' => $ogImage,
                'og:locale' => 'id_ID',
            ]),
            'twitter' => array_filter([
                'twitter:card' => 'summary_large_image',
                'twitter:title' => $metaTitle,
                'twitter:description' => $metaDescription,
                'twitter:image' => $ogImage,
            ]),
            'json_ld' => [
                '@context' => 'https://schema.org',
                '@graph' => [
                    $this->buildOrganizationSchema($site, $r2Url, $base),
                    $this->buildWebSiteSchema($site, $base),
                    $itemList,
                    $breadcrumb,
                    $webPage,
                ],
            ],
        ];
    }

    private function buildSeoListByCity(City $city, array $services): array
    {
        $site = SiteSetting::get();
        $r2Url = rtrim(config('filesystems.disks.r2_public.url', ''), '/');
        $base = rtrim((string) ($site->org_url ?? $site->company_website ?? config('app.url')), '/');
        $pageUrl = $base . '/layanan/kota/' . $city->slug;
        $listUrl = $base . '/layanan';

        $metaTitle = $site->getPageTitle('Layanan di ' . $city->name);
        $metaDescription = 'Temukan layanan profesional di ' . $city->name . ', ' . ($city->province ?? '') . '. Kami siap membantu kebutuhan bisnis Anda.';
        $ogImage = $site->default_og_image
            ? "{$r2Url}/{$site->default_og_image}"
            : ($site->company_logo ? "{$r2Url}/{$site->company_logo}" : null);

        $itemList = [
            '@type' => 'ItemList',
            'name' => 'Daftar Layanan di ' . $city->name,
            'url' => $pageUrl,
            'numberOfItems' => count($services),
            'itemListElement' => collect($services)->values()->map(fn($service, $i) => [
                '@type' => 'ListItem',
                'position' => $i + 1,
                'name' => $service['name'],
                'url' => $base . '/layanan/' . $service['slug'] . '/' . $city->slug,
            ])->toArray(),
        ];

        $breadcrumb = [
            '@type' => 'BreadcrumbList',
            'itemListElement' => [
                ['@type' => 'ListItem', 'position' => 1, 'name' => 'Beranda', 'item' => $base],
                ['@type' => 'ListItem', 'position' => 2, 'name' => 'Layanan', 'item' => $listUrl],
                ['@type' => 'ListItem', 'position' => 3, 'name' => $city->name, 'item' => $pageUrl],
            ],
        ];

        $webPage = [
            '@type' => 'WebPage',
            '@id' => $pageUrl . '#webpage',
            'url' => $pageUrl,
            'name' => $metaTitle,
            'description' => $metaDescription,
            'inLanguage' => 'id-ID',
            'isPartOf' => ['@id' => $base . '#website'],
            'about' => ['@id' => $base . '#organization'],
        ];

        return [
            'meta_title' => $metaTitle,
            'meta_description' => $metaDescription,
            'canonical_url' => $pageUrl,
            'robots' => 'index, follow',
            'in_sitemap' => true,
            'sitemap_priority' => '0.7',
            'open_graph' => array_filter([
                'og:type' => 'website',
                'og:site_name' => $site->company_name,
                'og:title' => $metaTitle,
                'og:description' => $metaDescription,
                'og:url' => $pageUrl,
                'og:image' => $ogImage,
                'og:locale' => 'id_ID',
            ]),
            'twitter' => array_filter([
                'twitter:card' => 'summary_large_image',
                'twitter:title' => $metaTitle,
                'twitter:description' => $metaDescription,
                'twitter:image' => $ogImage,
            ]),
            'json_ld' => [
                '@context' => 'https://schema.org',
                '@graph' => [
                    $this->buildOrganizationSchema($site, $r2Url, $base),
                    $this->buildWebSiteSchema($site, $base),
                    $itemList,
                    $breadcrumb,
                    $webPage,
                ],
            ],
        ];
    }
}
