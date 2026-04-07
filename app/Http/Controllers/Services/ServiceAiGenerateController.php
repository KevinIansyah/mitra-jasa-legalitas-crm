<?php

namespace App\Http\Controllers\Services;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\SiteSetting;
use App\Services\AI\AiContentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Throwable;

class ServiceAiGenerateController extends Controller
{
    public function __construct(
        private readonly AiContentService $aiContentService,
    ) {}

    private function buildContext(Service $service, Request $request): array
    {
        $settings = SiteSetting::get();

        return [
            'name' => $service->name,
            'category' => $service->relationLoaded('category')
                ? $service->category?->name
                : $service->category?->name,
            'short_description' => $service->short_description ?? '',
            'focus_keyword' => $service->seo?->focus_keyword ?? '',
            'company_name' => $settings->company_name ?? 'CV. Mitra Jasa Legalitas',
            'city' => $settings->company_city ?? 'Surabaya',
            'count' => $request->integer('count', 0) ?: null,
        ];
    }

    public function content(Request $request, Service $service): JsonResponse
    {
        $service->load(['category', 'seo']);

        return $this->run(
            fn () => $this->aiContentService->generateServiceContent(Auth::user(), $this->buildContext($service, $request))
        );
    }

    public function faq(Request $request, Service $service): JsonResponse
    {
        $request->validate(['count' => 'nullable|integer|min:3|max:15']);
        $service->load(['category', 'seo']);

        $ctx = $this->buildContext($service, $request);
        $ctx['count'] = $request->integer('count', 5);

        return $this->run(
            fn () => $this->aiContentService->generateServiceFaq(Auth::user(), $ctx)
        );
    }

    public function seo(Request $request, Service $service): JsonResponse
    {
        $service->load(['category', 'seo']);

        return $this->run(
            fn () => $this->aiContentService->generateServiceSeo(Auth::user(), $this->buildContext($service, $request))
        );
    }

    public function packages(Request $request, Service $service): JsonResponse
    {
        $request->validate(['count' => 'nullable|integer|min:2|max:5']);
        $service->load(['category', 'seo']);

        $ctx = $this->buildContext($service, $request);
        $ctx['count'] = $request->integer('count', 3);

        return $this->run(
            fn () => $this->aiContentService->generateServicePackages(Auth::user(), $ctx)
        );
    }

    public function processSteps(Request $request, Service $service): JsonResponse
    {
        $request->validate(['count' => 'nullable|integer|min:3|max:10']);
        $service->load(['category', 'seo']);

        $ctx = $this->buildContext($service, $request);
        $ctx['count'] = $request->integer('count', 5);

        return $this->run(
            fn () => $this->aiContentService->generateServiceProcessSteps(Auth::user(), $ctx)
        );
    }

    public function requirements(Request $request, Service $service): JsonResponse
    {
        $request->validate(['count' => 'nullable|integer|min:1|max:5']);
        $service->load(['category', 'seo']);

        $ctx = $this->buildContext($service, $request);
        $ctx['count'] = $request->integer('count', 2);

        return $this->run(
            fn () => $this->aiContentService->generateServiceRequirements(Auth::user(), $ctx)
        );
    }

    public function legalBases(Request $request, Service $service): JsonResponse
    {
        $request->validate(['count' => 'nullable|integer|min:1|max:7']);
        $service->load(['category', 'seo']);

        $ctx = $this->buildContext($service, $request);
        $ctx['count'] = $request->integer('count', 3);

        return $this->run(
            fn () => $this->aiContentService->generateServiceLegalBases(Auth::user(), $ctx)
        );
    }

    public function image(Request $request, Service $service): JsonResponse
    {
        $request->validate([
            'count' => 'nullable|integer|min:1|max:4',
        ]);

        $service->load(['category', 'seo']);

        $ctx = [
            'title' => $service->name,
            'keyword' => $service->seo?->focus_keyword ?? $service->name,
            'category' => $service->category?->slug ?? '',
        ];

        return $this->run(
            fn () => $this->aiContentService->generateImage(
                Auth::user(),
                $ctx,
                $request->integer('count', 1),
                'service',
            )
        );
    }

    private function run(callable $fn): JsonResponse
    {
        try {
            $result = $fn();

            return response()->json([
                'success' => true,
                'data' => $result,
                'tokens_used' => $result['tokens_used'] ?? 0,
            ]);
        } catch (Throwable $e) {
            $status = match (true) {
                str_contains($e->getMessage(), 'Kuota token') => 429,
                str_contains($e->getMessage(), 'Staff profile') => 403,
                default => 500,
            };

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $status);
        }
    }
}
