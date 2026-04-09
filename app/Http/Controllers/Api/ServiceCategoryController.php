<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\ServiceCategory;
use Illuminate\Http\JsonResponse;

class ServiceCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = ServiceCategory::where('status', 'active')->orderBy('name')->get();

        $mappedCategories = $categories->map(fn ($category) => [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
        ]);

        return ApiResponse::success($mappedCategories);
    }
}
