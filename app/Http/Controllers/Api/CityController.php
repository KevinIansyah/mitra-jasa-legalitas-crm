<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\JsonResponse;

class CityController extends Controller
{
    public function index(): JsonResponse
    {
        $cities = City::where('status', 'active')->orderBy('name')->get();

        $mappedCities = $cities->map(fn($city) => [
            'id' => $city->id,
            'name' => $city->name,
            'slug' => $city->slug,
        ]);

        return ApiResponse::success($mappedCities);
    }
}
