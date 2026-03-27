<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\City;
use App\Models\ClientSuccessStory;
use App\Models\Faq;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\SiteSetting;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;

class PublicHomeController extends Controller
{
    private const FEATURED_SERVICES_LIMIT = 6;

    private const SERVICE_CATEGORIES_LIMIT = 24;

    private const TESTIMONIALS_LIMIT = 5;

    private const SUCCESS_STORIES_LIMIT = 5;

    private const FAQ_LIMIT = 10;

    private const LATEST_BLOGS_LIMIT = 4;

    // ========================================================================
    // GET /beranda
    // Halaman beranda publik: statistik, layanan unggulan, kategori, testimoni,
    // kisah sukses, blog terbaru, CTA WhatsApp, dan payload SEO.
    // ========================================================================

    public function index(): JsonResponse
    {
        $site = SiteSetting::get();
        $r2Url = rtrim(config('filesystems.disks.r2_public.url', ''), '/');

        $featuredServices = Service::query()
            ->published()
            ->featured()
            ->with([
                'category:id,name,slug,palette_color',
                'cheapestPackage' => function ($q) {
                    $q->with(['includedFeatures']);
                },
            ])
            ->limit(self::FEATURED_SERVICES_LIMIT)
            ->latest()
            ->get(['id', 'service_category_id', 'name', 'slug', 'short_description', 'featured_image', 'is_featured', 'is_popular'])
            ->map(fn(Service $service) => $this->formatServiceCard($service, $r2Url));

        $serviceCategories = ServiceCategory::query()
            ->active()
            ->withCount(['services' => fn($q) => $q->published()])
            ->limit(self::SERVICE_CATEGORIES_LIMIT)
            ->latest()
            ->get(['id', 'name', 'slug', 'palette_color'])
            ->map(fn(ServiceCategory $cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
                'published_services_count' => $cat->services_count,
                'palette_color' => $cat->palette_color,
            ]);

        $allServices = Service::query()
            ->published()
            ->get(['id', 'name', 'slug', 'icon'])
            ->map(fn(Service $s) => [
                'id' => $s->id,
                'name' => $s->name,
                'slug' => $s->slug,
                'icon' => $s->icon,
            ]);

        $totalServices = Service::query()
            ->published()
            ->count();

        $testimonials = Testimonial::query()
            ->published()
            ->with('service:id,name,slug')
            ->limit(self::TESTIMONIALS_LIMIT)
            ->latest()
            ->get()
            ->map(fn(Testimonial $t) => [
                'id' => $t->id,
                'client_name' => $t->client_name,
                'client_position' => $t->client_position,
                'client_company' => $t->client_company,
                'client_avatar' => $this->publicAssetUrl($t->client_avatar, $r2Url),
                'rating' => $t->rating,
                'content' => $t->content,
                'service' => $t->service ? [
                    'id' => $t->service->id,
                    'name' => $t->service->name,
                    'slug' => $t->service->slug,
                ] : null,
            ]);

        $faqs = Faq::query()
            ->published()
            ->limit(self::FAQ_LIMIT)
            ->latest()
            ->get()
            ->map(fn(Faq $f) => [
                'id' => $f->id,
                'question' => $f->question,
                'answer' => $f->answer,
            ]);

        $successStories = ClientSuccessStory::query()
            ->published()
            ->limit(self::SUCCESS_STORIES_LIMIT)
            ->latest()
            ->get()
            ->map(fn(ClientSuccessStory $s) => [
                'id' => $s->id,
                'client_name' => $s->client_name,
                'industry' => $s->industry,
                'client_logo' => $this->publicAssetUrl($s->client_logo, $r2Url),
                'metric_value' => $s->metric_value,
                'metric_label' => $s->metric_label,
                'challenge' => $s->challenge,
                'solution' => $s->solution,
                'stat_1' => $this->optionalStat($s->stat_1_value, $s->stat_1_label),
                'stat_2' => $this->optionalStat($s->stat_2_value, $s->stat_2_label),
                'stat_3' => $this->optionalStat($s->stat_3_value, $s->stat_3_label),
            ]);

        $latestBlogs = Blog::query()
            ->published()
            ->with([
                'category:id,name,slug',
                'author:id,name,avatar',
                'author.staffProfile:id,user_id,position,bio',
                'tags:id,name,slug',
            ])
            ->latest('published_at')
            ->limit(self::LATEST_BLOGS_LIMIT)
            ->get()
            ->map(fn(Blog $blog) => $this->formatBlogCard($blog, $r2Url));

        $activeCities = City::query()
            ->active()
            ->orderBy('name')
            ->pluck('name')
            ->toArray();

        return ApiResponse::success([
            'stats' => $this->buildStats($site, $totalServices),
            'featured_services' => $featuredServices,
            'all_services' => $allServices,
            'service_categories' => $serviceCategories,
            'testimonials' => $testimonials,
            'faqs' => $faqs,
            'client_success_stories' => $successStories,
            'latest_blogs' => $latestBlogs,
            'whatsapp_cta' => $this->buildWhatsappCta($site),
            'seo' => $this->buildSeo($site, $r2Url, $activeCities),
        ]);
    }

    // ========================================================================
    // PRIVATE BUILDERS
    // ========================================================================

    private function buildStats(SiteSetting $site, int $totalServices): array
    {
        return [
            'total_clients' => $site->stat_total_clients,
            'total_documents' => $site->stat_total_documents,
            'rating' => $site->stat_rating,
            'total_reviews' => $site->stat_total_reviews,
            'years_experience' => $site->stat_years_experience,
            'total_services' => $totalServices,
        ];
    }

    private function buildWhatsappCta(SiteSetting $site): array
    {
        $raw = $site->company_whatsapp ?: $site->social_whatsapp ?: '';
        $digits = preg_replace('/\D/', '', (string) $raw);
        $defaultMessage = 'Halo, saya ingin mendapatkan informasi tentang layanan Anda.';
        $waMe = $digits !== '' ? 'https://wa.me/' . $digits : null;
        $waMeWithMessage = $waMe ? $waMe . '?text=' . rawurlencode($defaultMessage) : null;

        return [
            'label' => 'Chat WhatsApp',
            'phone_display' => $raw,
            'wa_me' => $waMe,
            'default_message' => $defaultMessage,
            'wa_me_with_message' => $waMeWithMessage,
        ];
    }

    private function buildSeo(SiteSetting $site, string $r2Url, array $activeCities = []): array
    {
        $base = $this->canonicalBase($site);
        $pageLabel = 'Beranda';
        $metaTitle = $site->getPageTitle($pageLabel);
        $metaDescription = $site->default_meta_description;
        $keywords = $site->default_keywords;
        $ogImage = $this->publicAssetUrl($site->default_og_image, $r2Url)
            ?? $this->publicAssetUrl($site->company_logo, $r2Url);

        // ----------------------------------------------------------------
        // Organization schema - tanpa @context karena masuk ke @graph
        // ----------------------------------------------------------------
        $orgId = $base . '#organization';
        $organization = $site->toOrganizationSchema();
        unset($organization['@context']);
        $organization['@id'] = $orgId;

        if (! empty($organization['logo']) && ! str_starts_with((string) $organization['logo'], 'http')) {
            $organization['logo'] = $this->publicAssetUrl((string) $organization['logo'], $r2Url);
        }

        if (! empty($activeCities)) {
            $organization['areaServed'] = array_map(
                fn(string $city) => [
                    '@type' => 'City',
                    'name' => $city,
                ],
                $activeCities
            );
        }

        if ($site->stat_rating && $site->stat_total_reviews) {
            $organization['aggregateRating'] = [
                '@type' => 'AggregateRating',
                'ratingValue' => $site->stat_rating,
                'reviewCount' => $site->stat_total_reviews,
                'bestRating' => 5,
                'worstRating' => 1,
            ];
        }

        $openingHours = $this->buildOpeningHoursSpecification($site);
        if (! empty($openingHours)) {
            $organization['openingHoursSpecification'] = $openingHours;
        }

        // ----------------------------------------------------------------
        // WebSite schema - tanpa @context
        // ----------------------------------------------------------------
        $websiteId = $base . '#website';
        $websiteSchema = array_filter([
            '@type' => 'WebSite',
            '@id' => $websiteId,
            'name' => $site->org_name ?? $site->company_name,
            'url' => $base,
            'description' => $site->org_description ?? $metaDescription,
            'publisher' => ['@id' => $orgId],
            'inLanguage' => 'id-ID',
        ]);

        // ----------------------------------------------------------------
        // WebPage schema - tanpa @context
        // ----------------------------------------------------------------
        $webPageId = $base . '#webpage';
        $webPageSchema = array_filter([
            '@type' => 'WebPage',
            '@id' => $webPageId,
            'url' => $base,
            'name' => $metaTitle,
            'description' => $metaDescription,
            'isPartOf' => ['@id' => $websiteId],
            'about' => ['@id' => $orgId],
            'inLanguage' => 'id-ID',
        ]);

        // ----------------------------------------------------------------
        // @graph - @context hanya di root, tidak duplikat di tiap item
        // ----------------------------------------------------------------
        $jsonLd = [
            '@context' => 'https://schema.org',
            '@graph' => array_values(array_filter([
                $organization,
                $websiteSchema,
                $webPageSchema,
            ])),
        ];

        return [
            'meta_title' => $metaTitle,
            'meta_description' => $metaDescription,
            'keywords' => $keywords,
            'canonical_url' => $base,
            'robots' => 'index, follow',
            'in_sitemap' => true,
            'sitemap_priority' => '1.0',
            'hreflang' => [
                'id' => $base,
            ],
            'open_graph' => array_filter([
                'og:type' => 'website',
                'og:site_name' => $site->company_name,
                'og:title' => $metaTitle,
                'og:description' => $metaDescription,
                'og:url' => $base,
                'og:image' => $ogImage,
                'og:locale' => 'id_ID',
            ]),
            'twitter' => array_filter([
                'twitter:card' => 'summary_large_image',
                'twitter:title' => $metaTitle,
                'twitter:description' => $metaDescription,
                'twitter:image' => $ogImage,
            ]),
            'json_ld' => $jsonLd,
        ];
    }

    private function buildOpeningHoursSpecification(SiteSetting $site): array
    {
        $hours = $site->business_hours;

        if (empty($hours) || ! is_array($hours)) {
            return [];
        }

        $dayMap = [
            'mon' => 'Monday',
            'tue' => 'Tuesday',
            'wed' => 'Wednesday',
            'thu' => 'Thursday',
            'fri' => 'Friday',
            'sat' => 'Saturday',
            'sun' => 'Sunday',
        ];

        $specs = [];

        foreach ($dayMap as $key => $schemaDay) {
            $value = $hours[$key] ?? null;

            // Skip jika tidak ada atau ditandai tutup
            if (empty($value) || $value === 'closed') {
                continue;
            }

            // Parse "08:00-17:00" → opens & closes
            $parts = explode('-', $value);
            if (count($parts) !== 2) {
                continue;
            }

            $specs[] = [
                '@type' => 'OpeningHoursSpecification',
                'dayOfWeek' => 'https://schema.org/' . $schemaDay,
                'opens' => trim($parts[0]),
                'closes' => trim($parts[1]),
            ];
        }

        return $specs;
    }

    // ========================================================================
    // PRIVATE HELPERS
    // ========================================================================

    private function canonicalBase(SiteSetting $site): string
    {
        $base = $site->org_url ?? $site->company_website ?? config('app.url');

        return rtrim((string) $base, '/');
    }

    private function publicAssetUrl(?string $path, string $r2Url): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return "{$r2Url}/{$path}";
    }

    private function optionalStat(?string $value, ?string $label): ?array
    {
        if ($value === null && $label === null) {
            return null;
        }

        return [
            'value' => $value,
            'label' => $label,
        ];
    }

    // ========================================================================
    // PRIVATE FORMATTERS
    // ========================================================================

    private function formatServiceCard(Service $service, string $r2Url): array
    {
        return [
            'id' => $service->id,
            'name' => $service->name,
            'slug' => $service->slug,
            'short_description' => $service->short_description,
            'featured_image' => $this->publicAssetUrl($service->featured_image, $r2Url),
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
                'slug' => $service->cheapestPackage->slug,
                'price' => $service->cheapestPackage->price,
                'duration' => $service->cheapestPackage->duration,
                'duration_days' => $service->cheapestPackage->duration_days,
            ] : null,
            'included_features' => $service->cheapestPackage?->includedFeatures->map(fn($feature) => [
                'id' => $feature->id,
                'feature_name' => $feature->feature_name,
                'is_included' => $feature->is_included,
                'sort_order' => $feature->sort_order,
            ]),
        ];
    }

    private function formatBlogCard(Blog $blog, string $r2Url): array
    {
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
}
