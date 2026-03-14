<?php

namespace App\Http\Controllers;

use App\Http\Requests\Cities\StoreRequest;
use App\Http\Requests\Cities\UpdateRequest;
use App\Models\City;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CityController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search   = $request->get('search');
        $status   = $request->get('status');
        $province = $request->get('province');

        $cities = City::query()
            ->withCount('serviceCityPages')
            ->when($search, fn($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('province', 'like', "%{$search}%"))
            ->when($status, fn($q) => $q->where('status', $status))
            ->when($province, fn($q) => $q->where('province', $province))
            ->orderBy('sort_order')
            ->paginate($perPage);

        $provinces = City::distinct()->orderBy('province')
            ->pluck('province')
            ->filter()
            ->values();

        $summary = [
            'total'            => City::count(),
            'active'           => City::where('status', 'active')->count(),
            'inactive'         => City::where('status', 'inactive')->count(),
            'with_city_pages'  => City::has('serviceCityPages')->count(),
            'total_provinces'  => City::distinct('province')->whereNotNull('province')->count('province'),
        ];

        return Inertia::render('master-data/cities/index', [
            'cities'    => $cities,
            'provinces' => $provinces,
            'summary'   => $summary,
            'filters'   => [
                'search'   => $search,
                'per_page' => $perPage,
                'status'   => $status,
                'province' => $province,
            ],
        ]);
    }

    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        $slug     = Str::slug($validated['slug'] ?? $validated['name']);
        $original = $slug;
        $counter  = 1;
        while (City::where('slug', $slug)->exists()) {
            $slug = "{$original}-{$counter}";
            $counter++;
        }

        City::create([...$validated, 'slug' => $slug]);

        return back()->with('success', 'Kota berhasil ditambahkan.');
    }

    public function edit(City $city)
    {
        return Inertia::render('master-data/cities/edit', [
            'city' => $city,
        ]);
    }

    public function update(UpdateRequest $request, City $city)
    {
        $city->update($request->validated());

        return back()->with('success', 'Kota berhasil diperbarui.');
    }
    
    public function destroy(City $city)
    {
        if ($city->serviceCityPages()->exists()) {
            return back()->withErrors([
                'delete' => 'Kota tidak dapat dihapus karena masih memiliki halaman layanan aktif.'
            ]);
        }

        $city->delete();

        return back()->with('success', 'Kota berhasil dihapus.');
    }
}
