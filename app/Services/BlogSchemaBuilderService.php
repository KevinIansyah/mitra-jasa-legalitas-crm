<?php

namespace App\Services;

use App\Models\Blog;
use App\Models\SiteSetting;

class BlogSchemaBuilderService
{
    public static function build(Blog $blog): array
    {
        $settings = SiteSetting::get();

        return [
            'article' => self::buildArticle($blog, $settings),
            'breadcrumb' => self::buildBreadcrumb($blog, $settings),
        ];
    }

    public static function toJsonLd(Blog $blog): string
    {
        $schemas = $blog->seo?->schema_markup ?? self::build($blog);
        $output = '';

        foreach ($schemas as $schema) {
            if (empty($schema)) {
                continue;
            }

            $output .= '<script type="application/ld+json">'
              .json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)
              .'</script>'.PHP_EOL;
        }

        return $output;
    }

    private static function buildArticle(Blog $blog, SiteSetting $settings): array
    {
        $seo = $blog->seo;
        $baseUrl = rtrim($settings->company_website ?? config('app.url'), '/');
        $url = "{$baseUrl}/blog/{$blog->slug}";
        $r2Url = rtrim(config('filesystems.disks.r2_public.url', ''), '/');

        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'Article',
            'headline' => $blog->title,
            'url' => $url,
            'datePublished' => $blog->published_at?->toIso8601String(),
            'dateModified' => $blog->updated_at->toIso8601String(),
        ];

        if ($blog->short_description) {
            $schema['description'] = $blog->short_description;
        }

        if ($seo?->meta_description) {
            $schema['description'] = $seo->meta_description;
        }

        if ($blog->featured_image) {
            $schema['image'] = "{$r2Url}/{$blog->featured_image}";
        }

        $author = $blog->relationLoaded('author') ? $blog->author : $blog->author;
        if ($author) {
            $schema['author'] = [
                '@type' => 'Person',
                'name' => $author->name,
            ];
        }

        $schema['publisher'] = [
            '@type' => $settings->org_type ?? 'Organization',
            'name' => $settings->org_name ?? $settings->company_name ?? 'CV. Mitra Jasa Legalitas',
            'url' => $settings->org_url ?? $settings->company_website ?? config('app.url'),
        ];

        $tags = $blog->relationLoaded('tags') ? $blog->tags : $blog->tags;
        if ($tags && $tags->isNotEmpty()) {
            $schema['keywords'] = $tags->pluck('name')->implode(', ');
        }

        if ($seo?->focus_keyword) {
            $schema['keywords'] = $seo->focus_keyword
              .($schema['keywords'] ? ', '.$schema['keywords'] : '');
        }

        return $schema;
    }

    private static function buildBreadcrumb(Blog $blog, SiteSetting $settings): array
    {
        $baseUrl = rtrim($settings->company_website ?? config('app.url'), '/');
        $category = $blog->relationLoaded('category') ? $blog->category : $blog->category;

        $items = [
            [
                '@type' => 'ListItem',
                'position' => 1,
                'name' => 'Beranda',
                'item' => $baseUrl,
            ],
            [
                '@type' => 'ListItem',
                'position' => 2,
                'name' => 'Blog',
                'item' => "{$baseUrl}/blog",
            ],
            [
                '@type' => 'ListItem',
                'position' => 3,
                'name' => $blog->title,
                'item' => "{$baseUrl}/blog/{$blog->slug}",
            ],
        ];

        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => $items,
        ];
    }
}
