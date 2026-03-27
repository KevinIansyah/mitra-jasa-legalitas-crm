<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicBlogController extends Controller
{
    // ========================================================================
    // GET /blogs
    // List all blogs
    // Query params:
    //   ?category[]=slug1&category[]=slug2   → multi category
    //   ?tag[]=slug1&tag[]=slug2             → multi tag
    // ========================================================================

    public function index(Request $request): JsonResponse
    {
        $categorySlugs = $request->input('category', []);
        $tagSlugs = $request->input('tag', []);

        if (is_string($categorySlugs)) {
            $categorySlugs = [$categorySlugs];
        }
        if (is_string($tagSlugs)) {
            $tagSlugs = [$tagSlugs];
        }

        $blogs = Blog::query()
            ->published()
            ->with([
                'category:id,name,slug',
                'author:id,name,avatar',
                'author.staffProfile:id,user_id,position,bio',
                'tags:id,name,slug',
            ])
            ->when(
                ! empty($categorySlugs),
                fn($q) => $q->whereHas(
                    'category',
                    fn($q) => $q->whereIn('slug', $categorySlugs)
                )
            )
            ->when(
                ! empty($tagSlugs),
                fn($q) => $q->whereHas(
                    'tags',
                    fn($q) => $q->whereIn('slug', $tagSlugs)
                )
            )
            ->latest('published_at')
            ->paginate(20);

        return ApiResponse::success([
            'seo' => $this->buildSeoListBlog(),
            'blogs' => $blogs->map(fn($blog) => $this->formatBlogCard($blog)),
            'meta' => [
                'current_page' => $blogs->currentPage(),
                'last_page' => $blogs->lastPage(),
                'per_page' => $blogs->perPage(),
                'total' => $blogs->total(),
            ],
        ]);
    }

    // ========================================================================
    // GET /blogs/{slug}
    // Detail blog + related blogs
    // ========================================================================

    public function show(string $slug): JsonResponse
    {
        $blog = Blog::published()
            ->where('slug', $slug)
            ->with([
                'category:id,name,slug',
                'author:id,name,avatar',
                'author.staffProfile:id,user_id,position,bio',
                'tags:id,name,slug',
                'seo',
            ])
            ->first();

        if (!$blog) {
            return ApiResponse::error('Artikel tidak ditemukan', 404);
        }

        $blog->increment('views');

        $r2Url = rtrim(config('filesystems.disks.r2_public.url', ''), '/');

        $tagIds = $blog->tags->pluck('id');

        $related = Blog::published()
            ->where('id', '!=', $blog->id)
            ->with([
                'category:id,name,slug',
                'author:id,name,avatar',
                'tags:id,name,slug',
            ])
            ->when(
                $tagIds->isNotEmpty(),
                fn($q) => $q->whereHas(
                    'tags',
                    fn($q) => $q->whereIn('blog_tags.id', $tagIds)
                ),
                fn($q) => $q->where('blog_category_id', $blog->blog_category_id)
            )
            ->latest('published_at')
            ->limit(4)
            ->get()
            ->map(fn($b) => $this->formatBlogCard($b));

        return ApiResponse::success([
            'id' => $blog->id,
            'title' => $blog->title,
            'slug' => $blog->slug,
            'short_description' => $blog->short_description,
            'content' => $blog->content,
            'featured_image' => $blog->featured_image ? "{$r2Url}/{$blog->featured_image}" : null,
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
                'avatar' => $blog->author->avatar ? "{$r2Url}/{$blog->author->avatar}" : null,
                'position' => $blog->author->staffProfile?->position,
                'bio' => $blog->author->staffProfile?->bio,
            ] : null,
            'tags' => $blog->tags->map(fn($tag) => [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
            ]),
            'seo' => $blog->seo ? [
                'meta_title' => $blog->seo->meta_title,
                'meta_description' => $blog->seo->meta_description,
                'canonical_url' => $blog->seo->canonical_url,
                'focus_keyword' => $blog->seo->focus_keyword,
                'secondary_keywords' => $blog->seo->secondary_keywords,
                'og_title' => $blog->seo->og_title,
                'og_description' => $blog->seo->og_description,
                'og_image' => $blog->seo->og_image ? "{$r2Url}/{$blog->seo->og_image}" : null,
                'twitter_card' => $blog->seo->twitter_card,
                'twitter_title' => $blog->seo->twitter_title,
                'twitter_description' => $blog->seo->twitter_description,
                'twitter_image' => $blog->seo->twitter_image ? "{$r2Url}/{$blog->seo->twitter_image}" : null,
                'robots' => $blog->seo->robots,
                'schema_markup' => $blog->seo->schema_markup,
                'in_sitemap' => $blog->seo->in_sitemap,
                'sitemap_priority' => $blog->seo->sitemap_priority,
                'sitemap_changefreq' => $blog->seo->sitemap_changefreq,
            ] : null,
            'related' => $related,
        ]);
    }

    // ========================================================================
    // HELPERS
    // ========================================================================

    private function formatBlogCard(Blog $blog): array
    {
        $r2Url = rtrim(config('filesystems.disks.r2_public.url', ''), '/');

        return [
            'id' => $blog->id,
            'title' => $blog->title,
            'slug' => $blog->slug,
            'short_description' => $blog->short_description,
            'featured_image' => $blog->featured_image ? "{$r2Url}/{$blog->featured_image}" : null,
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
                'avatar' => $blog->author->avatar ? "{$r2Url}/{$blog->author->avatar}" : null,
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

    private function buildSeoListBlog(): array
    {
        $site = SiteSetting::get();
        $r2Url = rtrim(config('filesystems.disks.r2_public.url', ''), '/');
        $base = rtrim((string) ($site->org_url ?? $site->company_website ?? config('app.url')), '/');
        $pageUrl = $base . '/blog';

        $metaTitle = 'Blog - ' . ($site->company_name ?? '');
        $metaDescription = 'Baca artikel dan tips terbaru seputar legalitas bisnis, perizinan, dan layanan perusahaan.';
        $ogImage = $site->default_og_image
            ? "{$r2Url}/{$site->default_og_image}"
            : ($site->company_logo ? "{$r2Url}/{$site->company_logo}" : null);

        $breadcrumb = [
            '@type' => 'BreadcrumbList',
            'itemListElement' => [
                ['@type' => 'ListItem', 'position' => 1, 'name' => 'Beranda', 'item' => $base],
                ['@type' => 'ListItem', 'position' => 2, 'name' => 'Blog', 'item' => $pageUrl],
            ],
        ];

        $webPage = [
            '@type' => 'WebPage',
            'url' => $pageUrl,
            'name' => $metaTitle,
            'description' => $metaDescription,
            'inLanguage' => 'id-ID',
            'isPartOf' => ['@id' => $base . '#website'],
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
                '@graph' => [$breadcrumb, $webPage],
            ],
        ];
    }
}
