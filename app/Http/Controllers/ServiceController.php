<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\ServiceFaq;
use App\Models\ServiceLegalBasis;
use App\Models\ServicePackage;
use App\Models\ServicePackageFeature;
use App\Models\ServiceProcessStep;
use App\Models\ServiceRequirement;
use App\Models\ServiceRequirementCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ServiceController extends Controller
{
    /**
     * Display a listing of services
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');
        $status = $request->get('status');
        $category = $request->get('category');

        $query = Service::with('category');

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($category) {
            $query->where('service_category_id', $category);
        }

        $services = $query->latest()->paginate($perPage);

        $categories = ServiceCategory::orderBy('sort_order')
            ->get(['id', 'name']);

        return Inertia::render('services/index', [
            'services' => $services,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = ServiceCategory::where('status', 'active')
            ->orderBy('sort_order')
            ->get(['id', 'name']);

        return Inertia::render('services/create/index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            // Service fields
            'service_category_id'  => 'required|exists:service_categories,id',
            'name'                 => 'required|string|max:255',
            'slug'                 => 'nullable|string|max:255|unique:services,slug',
            'short_description'    => 'nullable|string',
            'introduction'         => 'nullable|string',
            'content'              => 'nullable|string',
            'featured_image'       => 'nullable|image|mimes:jpg,jpeg,png,webp,gif,svg|max:1024',
            'is_published'         => 'boolean',
            'is_featured'          => 'boolean',
            'is_popular'           => 'boolean',

            // Packages
            'packages'                           => 'nullable|array',
            'packages.*.name'                    => 'required|string|max:255',
            'packages.*.price'                   => 'required|numeric|min:0',
            'packages.*.original_price'          => 'nullable|numeric|min:0',
            'packages.*.duration'                => 'required|string|max:255',
            'packages.*.duration_days'           => 'nullable|integer|min:0',
            'packages.*.short_description'       => 'nullable|string',
            'packages.*.is_highlighted'          => 'boolean',
            'packages.*.badge'                   => 'nullable|string|max:255',
            'packages.*.sort_order'              => 'nullable|integer|min:0',
            'packages.*.features'                => 'nullable|array',
            'packages.*.features.*.feature_name' => 'required|string|max:255',
            'packages.*.features.*.description'  => 'nullable|string',
            'packages.*.features.*.is_included'  => 'boolean',
            'packages.*.features.*.sort_order'   => 'nullable|integer|min:0',

            // FAQs
            'faqs'              => 'nullable|array',
            'faqs.*.question'   => 'required|string',
            'faqs.*.answer'     => 'required|string',
            'faqs.*.sort_order' => 'nullable|integer|min:0',

            // Legal Bases
            'legal_bases'                  => 'nullable|array',
            'legal_bases.*.document_type'  => 'required|string|max:255',
            'legal_bases.*.document_number' => 'required|string|max:255',
            'legal_bases.*.title'          => 'required|string|max:255',
            'legal_bases.*.issued_date'    => 'nullable|date',
            'legal_bases.*.url'            => 'nullable|url|max:255',
            'legal_bases.*.description'    => 'nullable|string',
            'legal_bases.*.sort_order'     => 'nullable|integer|min:0',

            // Requirement Categories
            'requirement_categories'                              => 'nullable|array',
            'requirement_categories.*.name'                       => 'required|string|max:255',
            'requirement_categories.*.description'                => 'nullable|string',
            'requirement_categories.*.sort_order'                 => 'nullable|integer|min:0',
            'requirement_categories.*.requirements'               => 'nullable|array',
            'requirement_categories.*.requirements.*.name'        => 'required|string|max:255',
            'requirement_categories.*.requirements.*.description' => 'nullable|string',
            'requirement_categories.*.requirements.*.is_required' => 'boolean',
            'requirement_categories.*.requirements.*.document_format' => 'nullable|string|max:255',
            'requirement_categories.*.requirements.*.notes'       => 'nullable|string',
            'requirement_categories.*.requirements.*.sort_order'  => 'nullable|integer|min:0',

            // Process Steps
            'process_steps'                        => 'nullable|array',
            'process_steps.*.title'                => 'required|string|max:255',
            'process_steps.*.description'          => 'nullable|string',
            'process_steps.*.duration'             => 'nullable|string|max:255',
            'process_steps.*.duration_days'        => 'nullable|integer|min:0',
            'process_steps.*.required_documents'   => 'nullable|array',
            'process_steps.*.required_documents.*' => 'string|max:255',
            'process_steps.*.notes'                => 'nullable|string',
            'process_steps.*.icon'                 => 'nullable|string|max:255',
            'process_steps.*.sort_order'           => 'nullable|integer|min:0',
        ]);

        DB::transaction(function () use ($validated, $request) {
            // Auto-generate slug
            $slug = $validated['slug']
                ? Str::slug($validated['slug'])
                : Str::slug($validated['name']);

            $originalSlug = $slug;
            $counter      = 1;
            while (Service::where('slug', $slug)->exists()) {
                $slug = "{$originalSlug}-{$counter}";
                $counter++;
            }

            // Upload featured image
            $featuredImagePath = null;
            if ($request->hasFile('featured_image')) {
                $featuredImagePath = $request->file('featured_image')
                    ->store('services/images', 'public');
            }

            // Create service
            $service = Service::create([
                'service_category_id' => $validated['service_category_id'],
                'name'                => $validated['name'],
                'slug'                => $slug,
                'short_description'   => $validated['short_description'] ?? null,
                'introduction'        => $validated['introduction'] ?? null,
                'content'             => $validated['content'] ?? null,
                'featured_image'      => $featuredImagePath,
                'is_published'        => $validated['is_published'] ?? false,
                'is_featured'         => $validated['is_featured'] ?? false,
                'is_popular'          => $validated['is_popular'] ?? false,
                'published_at'        => ($validated['is_published'] ?? false) ? now() : null,
                'status'              => ($validated['is_published'] ?? false) ? 'active' : 'inactive',
            ]);

            // Create packages
            foreach (($validated['packages'] ?? []) as $pkgIndex => $pkgData) {
                $package = ServicePackage::create([
                    'service_id'        => $service->id,
                    'name'              => $pkgData['name'],
                    'price'             => $pkgData['price'],
                    'original_price'    => $pkgData['original_price'] ?? null,
                    'duration'          => $pkgData['duration'],
                    'duration_days'     => $pkgData['duration_days'] ?? null,
                    'short_description' => $pkgData['short_description'] ?? null,
                    'is_highlighted'    => $pkgData['is_highlighted'] ?? false,
                    'badge'             => $pkgData['badge'] ?? null,
                    'sort_order'        => $pkgData['sort_order'] ?? $pkgIndex,
                    'status'            => 'active',
                ]);

                foreach (($pkgData['features'] ?? []) as $featIndex => $featData) {
                    ServicePackageFeature::create([
                        'service_package_id' => $package->id,
                        'feature_name'       => $featData['feature_name'],
                        'description'        => $featData['description'] ?? null,
                        'is_included'        => $featData['is_included'] ?? true,
                        'sort_order'         => $featData['sort_order'] ?? $featIndex,
                    ]);
                }
            }

            // Create FAQs
            foreach (($validated['faqs'] ?? []) as $faqIndex => $faqData) {
                ServiceFaq::create([
                    'service_id' => $service->id,
                    'question'   => $faqData['question'],
                    'answer'     => $faqData['answer'],
                    'sort_order' => $faqData['sort_order'] ?? $faqIndex,
                    'status'     => 'active',
                ]);
            }

            // Create Legal Bases
            foreach (($validated['legal_bases'] ?? []) as $legalIndex => $legalData) {
                ServiceLegalBasis::create([
                    'service_id'      => $service->id,
                    'document_type'   => $legalData['document_type'],
                    'document_number' => $legalData['document_number'],
                    'title'           => $legalData['title'],
                    'issued_date'     => $legalData['issued_date'] ?? null,
                    'url'             => $legalData['url'] ?? null,
                    'description'     => $legalData['description'] ?? null,
                    'sort_order'      => $legalData['sort_order'] ?? $legalIndex,
                    'status'          => 'active',
                ]);
            }

            // Create Requirement Categories & Requirements
            foreach (($validated['requirement_categories'] ?? []) as $catIndex => $catData) {
                $category = ServiceRequirementCategory::create([
                    'service_id'  => $service->id,
                    'name'        => $catData['name'],
                    'description' => $catData['description'] ?? null,
                    'sort_order'  => $catData['sort_order'] ?? $catIndex,
                    'status'      => 'active',
                ]);

                foreach (($catData['requirements'] ?? []) as $reqIndex => $reqData) {
                    ServiceRequirement::create([
                        'service_requirement_category_id' => $category->id,
                        'name'                            => $reqData['name'],
                        'description'                     => $reqData['description'] ?? null,
                        'is_required'                     => $reqData['is_required'] ?? true,
                        'document_format'                 => $reqData['document_format'] ?? null,
                        'notes'                           => $reqData['notes'] ?? null,
                        'sort_order'                      => $reqData['sort_order'] ?? $reqIndex,
                        'status'                          => 'active',
                    ]);
                }
            }

            // Create Process Steps
            foreach (($validated['process_steps'] ?? []) as $stepIndex => $stepData) {
                ServiceProcessStep::create([
                    'service_id'         => $service->id,
                    'title'              => $stepData['title'],
                    'description'        => $stepData['description'] ?? null,
                    'duration'           => $stepData['duration'] ?? null,
                    'duration_days'      => $stepData['duration_days'] ?? null,
                    'required_documents' => $stepData['required_documents'] ?? null,
                    'notes'              => $stepData['notes'] ?? null,
                    'icon'               => $stepData['icon'] ?? null,
                    'sort_order'         => $stepData['sort_order'] ?? $stepIndex,
                    'status'             => 'active',
                ]);
            }
        });

        return to_route('services.index')->with('success', 'Layanan berhasil dibuat.');
    }

    /**
     * Display the specified service.
     */
    public function show(Service $service)
    {
        // $service->load([
        //     'category',
        //     'packages' => function ($query) {
        //         $query->orderBy('sort_order')->with([
        //             'features' => fn($q) => $q->orderBy('sort_order'),
        //         ]);
        //     },
        // ]);

        // return Inertia::render('services/show', [
        //     'service' => $service,
        // ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Service $service)
    {
        $service->load([
            'category',
            'packages' => function ($query) {
                $query->orderBy('sort_order')->with([
                    'features' => fn($q) => $q->orderBy('sort_order'),
                ]);
            },
        ]);

        $categories = ServiceCategory::where('status', 'active')
            ->orderBy('sort_order')
            ->get(['id', 'name']);

        return Inertia::render('services/edit/index', [
            'service' => $service,
            'categories' => $categories,
        ]);
    }

    /**
     * Update Basic Information Tab
     */
    public function updateBasicInformation(Request $request, Service $service)
    {
        $validated = $request->validate([
            'service_category_id' => 'required|exists:service_categories,id',
            'name'                => 'required|string|max:255',
            'slug'                => 'nullable|string|max:255|unique:services,slug,' . $service->id,
            'short_description'   => 'nullable|string',
            'featured_image'      => 'nullable|image|mimes:jpg,jpeg,png,webp,gif,svg|max:1024',
            'remove_image'        => 'boolean',
            'is_published'        => 'boolean',
            'is_featured'         => 'boolean',
            'is_popular'          => 'boolean',
        ]);

        DB::transaction(function () use ($validated, $request, $service) {
            // Handle slug
            $slug = $validated['slug']
                ? Str::slug($validated['slug'])
                : Str::slug($validated['name']);

            // Check if slug already exists (excluding current service)
            if ($slug !== $service->slug) {
                $originalSlug = $slug;
                $counter      = 1;
                while (Service::where('slug', $slug)->where('id', '!=', $service->id)->exists()) {
                    $slug = "{$originalSlug}-{$counter}";
                    $counter++;
                }
            }

            // Handle featured image
            $featuredImagePath = $service->featured_image;

            // Remove existing image if requested
            if ($request->boolean('remove_image') && $service->featured_image) {
                Storage::disk('public')->delete($service->featured_image);
                $featuredImagePath = null;
            }

            // Upload new image
            if ($request->hasFile('featured_image')) {
                // Delete old image
                if ($service->featured_image) {
                    Storage::disk('public')->delete($service->featured_image);
                }
                $featuredImagePath = $request->file('featured_image')
                    ->store('services/images', 'public');
            }

            // Determine status and published_at
            $isPublished = $validated['is_published'] ?? $service->is_published;
            $publishedAt = $service->published_at;
            $status      = $service->status;

            if ($isPublished && !$service->is_published) {
                // Just published
                $publishedAt = now();
                $status      = 'active';
            } elseif (!$isPublished && $service->is_published) {
                // Unpublished
                $status = 'inactive';
            }

            // Update service
            $service->update([
                'service_category_id' => $validated['service_category_id'],
                'name'                => $validated['name'],
                'slug'                => $slug,
                'short_description'   => $validated['short_description'] ?? null,
                'featured_image'      => $featuredImagePath,
                'is_published'        => $isPublished,
                'is_featured'         => $validated['is_featured'] ?? $service->is_featured,
                'is_popular'          => $validated['is_popular'] ?? $service->is_popular,
                'published_at'        => $publishedAt,
                'status'              => $status,
            ]);
        });

        return back()->with('success', 'Informasi dasar berhasil diperbarui.');
    }

    /**
     * Update Content Tab
     */
    public function updateContent(Request $request, Service $service)
    {
        $validated = $request->validate([
            'introduction' => 'required|string',
            'content'      => 'required|string',
        ]);

        $service->update([
            'introduction' => $validated['introduction'],
            'content'      => $validated['content'],
        ]);

        return back()->with('success', 'Konten layanan berhasil diperbarui.');
    }

    /**
     * Update Packages Tab
     */
    public function updatePackages(Request $request, Service $service)
    {
        $validated = $request->validate([
            'packages'                           => 'required|array|min:1',
            'packages.*.id'                      => 'nullable|exists:service_packages,id',
            'packages.*.name'                    => 'required|string|max:255',
            'packages.*.price'                   => 'required|numeric|min:0',
            // 'packages.*.original_price'          => 'nullable|numeric|min:0',
            'packages.*.duration'                => 'required|string|max:255',
            'packages.*.duration_days'           => 'nullable|integer|min:0',
            'packages.*.short_description'       => 'nullable|string',
            'packages.*.is_highlighted'          => 'boolean',
            'packages.*.badge'                   => 'nullable|string|max:255',
            'packages.*.sort_order'              => 'nullable|integer|min:0',
            'packages.*.features'                => 'nullable|array',
            'packages.*.features.*.id'           => 'nullable|exists:service_package_features,id',
            'packages.*.features.*.feature_name' => 'required|string|max:255',
            'packages.*.features.*.description'  => 'nullable|string',
            'packages.*.features.*.is_included'  => 'boolean',
            'packages.*.features.*.sort_order'   => 'nullable|integer|min:0',
        ]);

        DB::transaction(function () use ($validated, $service) {
            // Get existing package IDs
            $existingPackageIds = $service->packages()->pluck('id')->toArray();
            $submittedPackageIds = collect($validated['packages'])
                ->pluck('id')
                ->filter()
                ->toArray();

            // Delete packages that are no longer in the submission
            $packagesToDelete = array_diff($existingPackageIds, $submittedPackageIds);
            if (!empty($packagesToDelete)) {
                ServicePackage::whereIn('id', $packagesToDelete)->delete();
            }

            // Create or update packages
            foreach ($validated['packages'] as $pkgIndex => $pkgData) {
                if (!empty($pkgData['id'])) {
                    // Update existing package
                    $package = ServicePackage::findOrFail($pkgData['id']);
                    $package->update([
                        'name'              => $pkgData['name'],
                        'price'             => $pkgData['price'],
                        'original_price'    => $pkgData['original_price'] ?? null,
                        'duration'          => $pkgData['duration'],
                        'duration_days'     => $pkgData['duration_days'] ?? null,
                        'short_description' => $pkgData['short_description'] ?? null,
                        'is_highlighted'    => $pkgData['is_highlighted'] ?? false,
                        'badge'             => $pkgData['badge'] ?? null,
                        'sort_order'        => $pkgData['sort_order'] ?? $pkgIndex,
                    ]);
                } else {
                    // Create new package
                    $package = ServicePackage::create([
                        'service_id'        => $service->id,
                        'name'              => $pkgData['name'],
                        'price'             => $pkgData['price'],
                        'original_price'    => $pkgData['original_price'] ?? null,
                        'duration'          => $pkgData['duration'],
                        'duration_days'     => $pkgData['duration_days'] ?? null,
                        'short_description' => $pkgData['short_description'] ?? null,
                        'is_highlighted'    => $pkgData['is_highlighted'] ?? false,
                        'badge'             => $pkgData['badge'] ?? null,
                        'sort_order'        => $pkgData['sort_order'] ?? $pkgIndex,
                        'status'            => 'active',
                    ]);
                }

                // Handle features
                if (isset($pkgData['features'])) {
                    // Get existing feature IDs for this package
                    $existingFeatureIds = $package->features()->pluck('id')->toArray();
                    $submittedFeatureIds = collect($pkgData['features'])
                        ->pluck('id')
                        ->filter()
                        ->toArray();

                    // Delete features that are no longer in the submission
                    $featuresToDelete = array_diff($existingFeatureIds, $submittedFeatureIds);
                    if (!empty($featuresToDelete)) {
                        ServicePackageFeature::whereIn('id', $featuresToDelete)->delete();
                    }

                    // Create or update features
                    foreach ($pkgData['features'] as $featIndex => $featData) {
                        if (!empty($featData['id'])) {
                            // Update existing feature
                            $feature = ServicePackageFeature::findOrFail($featData['id']);
                            $feature->update([
                                'feature_name' => $featData['feature_name'],
                                'description'  => $featData['description'] ?? null,
                                'is_included'  => $featData['is_included'] ?? true,
                                'sort_order'   => $featData['sort_order'] ?? $featIndex,
                            ]);
                        } else {
                            // Create new feature
                            ServicePackageFeature::create([
                                'service_package_id' => $package->id,
                                'feature_name'       => $featData['feature_name'],
                                'description'        => $featData['description'] ?? null,
                                'is_included'        => $featData['is_included'] ?? true,
                                'sort_order'         => $featData['sort_order'] ?? $featIndex,
                            ]);
                        }
                    }
                }
            }
        });

        return back()->with('success', 'Paket harga berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Service $service)
    {
        DB::transaction(function () use ($service) {
            // Delete featured image
            if ($service->featured_image) {
                Storage::disk('public')->delete($service->featured_image);
            }

            // Delete service (cascade will handle packages and features)
            $service->delete();
        });

        return redirect()->back()->with('success', 'Layanan berhasil dihapus.');
    }
}
