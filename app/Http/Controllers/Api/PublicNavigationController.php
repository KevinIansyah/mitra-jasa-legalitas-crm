<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;

class PublicNavigationController extends Controller
{
    private const FEATURED_SERVICES_LIMIT = 6;

    // ========================================================================
    // GET /navigation
    // ========================================================================

    public function index(): JsonResponse
    {
        $site = SiteSetting::get();
        $r2Url = rtrim(config('filesystems.disks.r2_public.url', ''), '/');

        $serviceCategories = ServiceCategory::query()
            ->active()
            ->with([
                'services' => fn($q) => $q
                    ->published()
                    ->select(['id', 'service_category_id', 'name', 'slug', 'short_description', 'is_featured', 'is_popular']),
            ])
            ->get(['id', 'name', 'slug'])
            ->map(fn(ServiceCategory $cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
                'services' => $cat->services->map(fn(Service $service) => [
                    'id' => $service->id,
                    'name' => $service->name,
                    'slug' => $service->slug,
                    'short_description' => $service->short_description,
                    'is_featured' => $service->is_featured,
                    'is_popular' => $service->is_popular,
                ]),
            ])
            ->filter(fn($cat) => $cat['services']->isNotEmpty())
            ->values();

        $featuredServices = Service::query()
            ->published()
            ->featured()
            ->limit(self::FEATURED_SERVICES_LIMIT)
            ->get(['id', 'service_category_id', 'name', 'slug', 'short_description', 'featured_image', 'is_popular'])
            ->map(fn(Service $service) => [
                'id' => $service->id,
                'name' => $service->name,
                'slug' => $service->slug,
                'short_description' => $service->short_description,
                'featured_image' => $this->publicAssetUrl($service->featured_image, $r2Url),
                'is_popular' => $service->is_popular,
            ]);

        return ApiResponse::success([
            'service_categories' => $serviceCategories,
            'featured_services' => $featuredServices,
            'whatsapp' => $this->buildWhatsapp($site),
            'social_media' => $this->buildSocialMedia($site),
            'company' => $this->buildCompany($site, $r2Url),
        ]);
    }

    // ========================================================================
    // PRIVATE BUILDERS
    // ========================================================================

    private function buildWhatsapp(SiteSetting $site): ?array
    {
        $raw = $site->company_whatsapp ?: $site->social_whatsapp ?: '';
        $digits = preg_replace('/\D/', '', (string) $raw);

        if ($digits === '') {
            return null;
        }

        $message = 'Halo, saya ingin mendapatkan informasi tentang layanan Anda.';

        return [
            'phone_display' => $raw,
            'wa_me' => 'https://wa.me/' . $digits,
            'wa_me_with_message' => 'https://wa.me/' . $digits . '?text=' . rawurlencode($message),
        ];
    }

    private function buildSocialMedia(SiteSetting $site): array
    {
        return array_filter([
            'facebook' => $site->social_facebook,
            'instagram' => $site->social_instagram,
            'whatsapp' => $site->social_whatsapp,
            'linkedin' => $site->social_linkedin,
            'tiktok' => $site->social_tiktok,
            'youtube' => $site->social_youtube,
            'twitter' => $site->social_twitter,
            'threads' => $site->social_threads,
        ]);
    }

    private function buildCompany(SiteSetting $site, string $r2Url): array
    {
        return array_filter([
            'name' => $site->company_name,
            'tagline' => $site->company_tagline,
            'logo' => $this->publicAssetUrl($site->company_logo, $r2Url),
            'email' => $site->company_email,
            'phone' => $site->company_phone,
            'address' => $site->getFullAddress(),
            'website' => $site->company_website,
        ]);
    }

    // ========================================================================
    // PRIVATE HELPERS
    // ========================================================================

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
}
