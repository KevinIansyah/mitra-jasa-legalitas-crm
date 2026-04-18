<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\City;
use App\Models\Service;
use App\Models\ServiceCityPage;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class PublicSitemapController extends Controller
{
    // ========================================================================
    // GET /sitemap
    // ========================================================================

    public function index(): JsonResponse
    {
        $site = SiteSetting::get();
        $siteUpdatedAt = $this->toIsoString($site?->updated_at);

        $latestServiceAt = $this->toIsoString(
            Service::query()->published()->max('updated_at')
        );

        $latestBlogAt = $this->toIsoString(
            Blog::query()->published()->max('updated_at')
        );

        $latestCityPageAt = $this->toIsoString(
            ServiceCityPage::query()
                ->where('is_published', true)
                ->max('updated_at')
        );

        $homeLastmod = $this->maxDate([
            $siteUpdatedAt,
            $latestServiceAt,
            $latestBlogAt,
            $latestCityPageAt,
        ]);

        $staticPages = [
            [
                'path'        => '/',
                'lastmod'     => $homeLastmod,
                'changefreq'  => 'weekly',
                'priority'    => 1.0,
            ],
            [
                'path'        => '/layanan',
                'lastmod'     => $latestServiceAt,
                'changefreq'  => 'weekly',
                'priority'    => 0.95,
            ],
            [
                'path'        => '/blog',
                'lastmod'     => $latestBlogAt,
                'changefreq'  => 'weekly',
                'priority'    => 0.9,
            ],
            [
                'path'        => '/kontak',
                'lastmod'     => $siteUpdatedAt,
                'changefreq'  => 'monthly',
                'priority'    => 0.85,
            ],
            [
                'path'        => '/tentang',
                'lastmod'     => $siteUpdatedAt,
                'changefreq'  => 'monthly',
                'priority'    => 0.85,
            ],
            [
                'path'        => '/kebijakan-privasi',
                'lastmod'     => $siteUpdatedAt,
                'changefreq'  => 'yearly',
                'priority'    => 0.3,
            ],
            [
                'path'        => '/syarat-ketentuan-layanan',
                'lastmod'     => $siteUpdatedAt,
                'changefreq'  => 'yearly',
                'priority'    => 0.3,
            ],
        ];

        $services = Service::query()
            ->published()
            ->orderBy('name')
            ->get(['slug', 'updated_at'])
            ->map(fn (Service $s) => [
                'slug'       => $s->slug,
                'lastmod'    => $this->toIsoString($s->updated_at),
                'changefreq' => 'weekly',
                'priority'   => 0.85,
            ])
            ->values();

        $cities = City::query()
            ->active()
            ->whereHas('serviceCityPages', function ($q) {
                $q->where('is_published', true)
                    ->whereHas('service', fn ($q) => $q->published());
            })
            ->withMax([
                'serviceCityPages as latest_city_page_updated_at' => fn ($q) => $q
                    ->where('is_published', true)
                    ->whereHas('service', fn ($q) => $q->published()),
            ], 'updated_at')
            ->orderBy('name')
            ->get(['id', 'slug', 'name', 'updated_at'])
            ->map(fn (City $c) => [
                'slug'       => $c->slug,
                'lastmod'    => $this->maxDate([
                    $this->toIsoString($c->updated_at),
                    $this->toIsoString($c->latest_city_page_updated_at ?? null),
                ]),
                'changefreq' => 'weekly',
                'priority'   => 0.8,
            ])
            ->values();

        $serviceCityPages = ServiceCityPage::query()
            ->where('is_published', true)
            ->where('in_sitemap', true)
            ->where('robots', 'not like', 'noindex%')
            ->whereHas('service', fn ($q) => $q->published())
            ->whereHas('city', fn ($q) => $q->active())
            ->with([
                'service:id,slug',
                'city:id,slug',
            ])
            ->orderBy('id')
            ->get(['id', 'service_id', 'city_id', 'sitemap_priority', 'updated_at'])
            ->map(fn (ServiceCityPage $p) => [
                'service_slug' => $p->service->slug,
                'city_slug'    => $p->city->slug,
                'lastmod'      => $this->toIsoString($p->updated_at),
                'changefreq'   => 'weekly',
                'priority'     => (float) ($p->sitemap_priority ?? 0.7),
            ])
            ->values();

        $blogs = Blog::query()
            ->published()
            ->orderByDesc('published_at')
            ->get(['slug', 'updated_at', 'published_at'])
            ->map(fn (Blog $b) => [
                'slug'       => $b->slug,
                'lastmod'    => $this->toIsoString($b->updated_at ?? $b->published_at),
                'changefreq' => 'weekly',
                'priority'   => 0.7,
            ])
            ->values();

        return ApiResponse::success([
            'generated_at'       => now()->toIso8601String(),
            'static_pages'       => $staticPages,
            'services'           => $services,
            'cities'             => $cities,
            'service_city_pages' => $serviceCityPages,
            'blogs'              => $blogs,
        ]);
    }

    // ========================================================================
    // HELPERS
    // ========================================================================

    private function toIsoString($value): ?string
    {
        if ($value === null) {
            return null;
        }

        if ($value instanceof Carbon) {
            return $value->toIso8601String();
        }

        try {
            return Carbon::parse($value)->toIso8601String();
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function maxDate(array $dates): ?string
    {
        $filtered = array_values(array_filter($dates, fn ($v) => $v !== null && $v !== ''));

        if (empty($filtered)) {
            return null;
        }

        $max = null;
        foreach ($filtered as $d) {
            $carbon = Carbon::parse($d);
            if ($max === null || $carbon->greaterThan($max)) {
                $max = $carbon;
            }
        }

        return $max?->toIso8601String();
    }
}
