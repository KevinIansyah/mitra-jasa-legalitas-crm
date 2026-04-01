<?php

namespace App\Http\Controllers\Blogs;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\SiteSetting;
use App\Services\AI\AiContentService;
use App\Services\AI\AiImagenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Throwable;

class BlogAiGenerateController extends Controller
{
    public function __construct(
        private readonly AiContentService $aiContentService,
    ) {}

    private function buildContext(Blog $blog, Request $request): array
    {
        $settings = SiteSetting::get();

        $tags = $blog->relationLoaded('tags')
            ? $blog->tags->pluck('name')->toArray()
            : $blog->tags->pluck('name')->toArray();

        return [
            'title'             => $blog->title,
            'category'          => $blog->relationLoaded('category')
                ? $blog->category?->name
                : $blog->category?->name,
            'short_description' => $blog->short_description ?? '',
            'focus_keyword'     => $blog->seo?->focus_keyword ?? '',
            'tags'              => $tags,
            'company_name'      => $settings->company_name ?? 'CV. Mitra Jasa Legalitas',
            'count'             => $request->integer('count', 0) ?: null,
        ];
    }


    public function content(Request $request, Blog $blog): JsonResponse
    {
        $blog->load(['category', 'tags', 'seo']);

        return $this->run(
            fn() => $this->aiContentService->generateBlogContent(Auth::user(), $this->buildContext($blog, $request))
        );
    }

    public function seo(Request $request, Blog $blog): JsonResponse
    {
        $blog->load(['category', 'tags', 'seo']);

        return $this->run(
            fn() => $this->aiContentService->generateBlogSeo(Auth::user(), $this->buildContext($blog, $request))
        );
    }

    public function image(Request $request, Blog $blog): JsonResponse
    {
        $request->validate([
            'count' => 'nullable|integer|min:1|max:4',
        ]);

        $blog->load(['category', 'seo']);

        $ctx = [
            'title'    => $blog->title,
            'keyword'  => $blog->seo?->focus_keyword ?? $blog->title,
            'category' => $blog->category?->name ?? '',
        ];

        return $this->run(
            fn() => $this->aiContentService->generateImage(
                Auth::user(),
                $ctx,
                $request->integer('count', 1),
                'blog',
            )
        );
    }

    private function run(callable $fn): JsonResponse
    {
        try {
            $result = $fn();

            return response()->json([
                'success'     => true,
                'data'        => $result,
                'tokens_used' => $result['tokens_used'] ?? 0,
            ]);
        } catch (Throwable $e) {
            $status = match (true) {
                str_contains($e->getMessage(), 'Kuota token')    => 429,
                str_contains($e->getMessage(), 'Staff profile')  => 403,
                default                                          => 500,
            };

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $status);
        }
    }
}
