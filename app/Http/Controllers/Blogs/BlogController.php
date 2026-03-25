<?php

namespace App\Http\Controllers\Blogs;

use App\Helpers\FileHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Blogs\StoreRequest;
use App\Http\Requests\Blogs\UpdateBasicInformationRequest;
use App\Http\Requests\Blogs\UpdateContentRequest;
use App\Http\Requests\Blogs\UpdateSeoRequest;
use App\Jobs\SendNewBlogPostNotification;
use App\Models\Blog;
use App\Models\BlogCategory;
use App\Models\BlogSeo;
use App\Models\BlogTag;
use App\Models\Service;
use App\Services\BlogSchemaBuilderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BlogController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');
        $category = $request->get('category');
        $tag = $request->get('tag');
        $isPublished = $request->get('is_published');

        $blogs = Blog::query()
            ->with(['category', 'author', 'tags'])
            ->when($search, fn ($q) => $q->where('title', 'like', "%{$search}%"))
            ->when($category, fn ($q) => $q->where('blog_category_id', $category))
            ->when($tag, fn ($q) => $q->whereHas('tags', fn ($q) => $q->where('blog_tags.id', $tag)))
            ->when($isPublished === 'published', fn ($q) => $q->where('is_published', true))
            ->when($isPublished === 'unpublished', fn ($q) => $q->where('is_published', false))
            ->latest()
            ->paginate($perPage);

        $categories = BlogCategory::orderBy('name')->get(['id', 'name']);
        $tags = BlogTag::active()->orderBy('name')->get(['id', 'name']);

        $summary = [
            'total' => Blog::count(),
            'published' => Blog::where('is_published', true)->count(),
            'featured' => Blog::where('is_featured', true)->count(),
            'draft' => Blog::where('is_published', false)->count(),
        ];

        return Inertia::render('blogs/index', [
            'blogs' => $blogs,
            'summary' => $summary,
            'categories' => $categories,
            'tags' => $tags,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
                'category' => $category,
                'tag' => $tag,
                'is_published' => $isPublished,
            ],
        ]);
    }

    public function create()
    {
        $categories = BlogCategory::orderBy('name')->get(['id', 'name']);
        $tags = BlogTag::active()->orderBy('name')->get(['id', 'name']);
        $services = Service::select('id', 'name', 'slug')->where('status', 'active')->where('is_published', true)->orderBy('name')->get();

        return Inertia::render('blogs/create/index', [
            'categories' => $categories,
            'tags' => $tags,
            'services' => $services,
        ]);
    }

    /**
     * Store a newly created blog with SEO.
     *
     * This operation creates:
     * - Blog (with slug generation and image upload)
     * - Blog Tag pivot records
     * - Blog SEO record
     *
     * All operations are wrapped in a database transaction to ensure
     * atomicity and prevent partial data persistence on errors.
     *
     * Slug Generation:
     * - Uses provided slug or auto-generates from blog title
     * - Ensures uniqueness by appending counter if needed
     */
    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request) {
            $slug = $validated['slug']
                ? Str::slug($validated['slug'])
                : Str::slug($validated['title']);

            $originalSlug = $slug;
            $counter = 1;
            while (Blog::where('slug', $slug)->exists()) {
                $slug = "{$originalSlug}-{$counter}";
                $counter++;
            }

            $featuredImagePath = null;
            if ($request->hasFile('featured_image')) {
                $fileData = FileHelper::uploadToR2Public(
                    $request->file('featured_image'),
                    'blogs/images',
                );
                $featuredImagePath = $fileData['path'];
            }

            // $isPublished = $validated['is_published'] ?? false;
            $isPublished = false;

            $blog = Blog::create([
                'blog_category_id' => $validated['blog_category_id'],
                'author_id' => Auth::id(),
                'title' => $validated['title'],
                'slug' => $slug,
                'short_description' => $validated['short_description'] ?? null,
                'content' => $validated['content'] ?? null,
                'featured_image' => $featuredImagePath,
                'is_published' => $isPublished,
                'is_featured' => $validated['is_featured'] ?? false,
                'published_at' => $isPublished ? now() : null,
            ]);

            if (! empty($validated['tag_ids'])) {
                $blog->tags()->sync($validated['tag_ids']);
            }
            if (! empty($validated['service_ids'])) {
                $blog->services()->sync($validated['service_ids']);
            }

            if (! empty($validated['seo'])) {
                $seo = $validated['seo'];

                $ogImagePath = null;
                if ($request->hasFile('seo.og_image')) {
                    $file = FileHelper::uploadToR2Public($request->file('seo.og_image'), 'blogs/seo');
                    $ogImagePath = $file['path'];
                }

                $twitterImagePath = null;
                if ($request->hasFile('seo.twitter_image')) {
                    $file = FileHelper::uploadToR2Public($request->file('seo.twitter_image'), 'blogs/seo');
                    $twitterImagePath = $file['path'];
                }

                BlogSeo::create([
                    'blog_id' => $blog->id,
                    'meta_title' => $seo['meta_title'] ?? null,
                    'meta_description' => $seo['meta_description'] ?? null,
                    'canonical_url' => $seo['canonical_url'] ?? null,
                    'focus_keyword' => $seo['focus_keyword'] ?? null,
                    'secondary_keywords' => $seo['secondary_keywords'] ?? [],
                    'og_title' => $seo['og_title'] ?? null,
                    'og_description' => $seo['og_description'] ?? null,
                    'og_image' => $ogImagePath,
                    'twitter_card' => $seo['twitter_card'] ?? 'summary_large_image',
                    'twitter_title' => $seo['twitter_title'] ?? null,
                    'twitter_description' => $seo['twitter_description'] ?? null,
                    'twitter_image' => $twitterImagePath,
                    'robots' => $seo['robots'] ?? 'index,follow',
                    'in_sitemap' => $seo['in_sitemap'] ?? true,
                    'sitemap_priority' => $seo['sitemap_priority'] ?? '0.7',
                    'sitemap_changefreq' => $seo['sitemap_changefreq'] ?? 'weekly',
                ]);
            }

            $blog->load(['category', 'author', 'tags']);
            $seo = $blog->getSeoOrCreate();
            $seo->update([
                'schema_markup' => BlogSchemaBuilderService::build($blog->setRelation('seo', $seo)),
            ]);
        });

        return to_route('blogs.index')->with('success', 'Blog berhasil ditambahkan.');
    }

    public function edit(Blog $blog)
    {
        $blog->load(['category', 'author', 'tags', 'seo', 'services']);

        $categories = BlogCategory::orderBy('name')->get(['id', 'name']);
        $tags = BlogTag::active()->orderBy('name')->get(['id', 'name']);
        $services = Service::select('id', 'name', 'slug')->where('status', 'active')->where('is_published', true)->orderBy('name')->get();

        return Inertia::render('blogs/edit/index', [
            'blog' => $blog,
            'categories' => $categories,
            'tags' => $tags,
            'services' => $services,
        ]);
    }

    /**
     * Update basic information tab.
     *
     * Handles:
     * - Blog title, category, and short description
     * - Slug regeneration with uniqueness check (excluding current blog)
     * - Featured image upload/replacement/removal
     * - Publication state management
     * - Tag synchronization
     *
     * Business Rules:
     * - Publishing sets published_at timestamp to current time (only on first publish)
     * - Unpublishing keeps the published_at timestamp for historical reference
     * - Old images are deleted when replaced or removed
     */
    public function updateBasicInformation(UpdateBasicInformationRequest $request, Blog $blog)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request, $blog) {
            $featuredImagePath = $blog->featured_image;

            if ($request->boolean('remove_image') && $blog->featured_image) {
                FileHelper::deleteFromR2($blog->featured_image, isPublic: true);
                $featuredImagePath = null;
            }

            if ($request->hasFile('featured_image')) {
                if ($blog->featured_image) {
                    FileHelper::deleteFromR2($blog->featured_image, isPublic: true);
                }

                $fileData = FileHelper::uploadToR2Public(
                    $request->file('featured_image'),
                    'blogs/images',
                );

                $featuredImagePath = $fileData['path'];
            }

            $isPublished = $validated['is_published'] ?? $blog->is_published;
            $publishedAt = $blog->published_at;

            if ($isPublished && ! $blog->is_published) {
                $publishedAt = now();
            }

            $blog->update([
                'blog_category_id' => $validated['blog_category_id'],
                'title' => $validated['title'],
                'short_description' => $validated['short_description'] ?? null,
                'featured_image' => $featuredImagePath,
                'is_published' => $isPublished,
                'is_featured' => $validated['is_featured'] ?? $blog->is_featured,
                'published_at' => $publishedAt,
            ]);

            $blog->tags()->sync($validated['tag_ids'] ?? []);
        });

        if ($blog->wasChanged('is_published') && $blog->is_published) {
            SendNewBlogPostNotification::dispatch($blog)->delay(now()->addMinutes(5));
        }

        return back()->with('success', 'Informasi dasar berhasil diperbarui.');
    }

    public function updateContent(UpdateContentRequest $request, Blog $blog)
    {
        $validated = $request->validated();

        $blog->update([
            'content' => $validated['content'],
        ]);

        return back()->with('success', 'Konten blog berhasil diperbarui.');
    }

    /**
     * Update blog SEO.
     *
     * Updates or creates SEO record for the blog.
     * Also rebuilds schema markup after update.
     */
    public function updateSeo(UpdateSeoRequest $request, Blog $blog)
    {
        $validated = $request->validated();

        unset($validated['og_image'], $validated['twitter_image'], $validated['remove_og_image'], $validated['remove_twitter_image']);

        $seo = $blog->getSeoOrCreate();

        if (empty($validated['og_title']) && ! empty($validated['meta_title'])) {
            $validated['og_title'] = $validated['meta_title'];
        }

        if (empty($validated['twitter_title']) && ! empty($validated['meta_title'])) {
            $validated['twitter_title'] = $validated['meta_title'];
        }

        if ($request->boolean('remove_og_image') && $seo->og_image) {
            FileHelper::deleteFromR2($seo->og_image, isPublic: true);
            $validated['og_image'] = null;
        }

        if ($request->hasFile('seo.og_image')) {
            if ($seo->og_image) {
                FileHelper::deleteFromR2($seo->og_image, isPublic: true);
            }
            $validated['og_image'] = FileHelper::uploadToR2Public($request->file('seo.og_image'), 'blogs/seo')['path'];
        }

        if ($request->boolean('remove_twitter_image') && $seo->twitter_image) {
            FileHelper::deleteFromR2($seo->twitter_image, isPublic: true);
            $validated['twitter_image'] = null;
        }

        if ($request->hasFile('seo.twitter_image')) {
            if ($seo->twitter_image) {
                FileHelper::deleteFromR2($seo->twitter_image, isPublic: true);
            }
            $validated['twitter_image'] = FileHelper::uploadToR2Public($request->file('seo.twitter_image'), 'blogs/seo')['path'];
        }

        $seo->update($validated);

        $blog->load(['seo', 'category', 'author', 'tags']);
        $seo->update([
            'schema_markup' => BlogSchemaBuilderService::build($blog),
        ]);

        return back()->with('success', 'SEO blog berhasil diperbarui.');
    }

    /**
     * Delete a blog and its related data.
     *
     * This operation:
     * - Removes featured image from storage
     * - Deletes blog record
     * - Relies on database CASCADE rules for SEO and pivot tables
     */
    public function destroy(Blog $blog)
    {
        DB::transaction(function () use ($blog) {
            if ($blog->featured_image) {
                FileHelper::deleteFromR2($blog->featured_image, isPublic: true);
            }

            $blog->delete();
        });

        return back()->with('success', 'Blog berhasil dihapus.');
    }
}
