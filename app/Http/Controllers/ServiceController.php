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

/**
 * ServiceController
 *
 * Handles complete lifecycle management of services including CRUD operations,
 * tab-based partial updates, and nested relational data management.
 *
 * Features:
 * - Multi-step service creation with nested relationships
 * - Tab-based editing for better UX (Basic Info, Content, Packages, FAQs, etc.)
 * - Atomic database transactions for data integrity
 * - Slug uniqueness enforcement
 * - Featured image management
 * - Status and publication state management
 *
 * Domain: Service Management
 * Architecture: Uses Inertia.js for frontend rendering
 *
 * @package App\Http\Controllers
 */
class ServiceController extends Controller
{
    /**
     * Display paginated listing of services with filters.
     *
     * Supports filtering by:
     * - Search keyword (matches service name)
     * - Status (active/inactive)
     * - Category
     * - Per-page limit (20, 30, 40, 50)
     *
     * Eager loads category relationship for performance optimization.
     *
     * @param Request $request
     * @return \Inertia\Response
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
                'status' => $status,
                'category' => $category,
            ],
        ]);
    }

    /**
     * Show the form for creating a new service.
     *
     * Loads active categories for dropdown selection.
     *
     * @return \Inertia\Response
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
     * Store a newly created service with all related entities.
     *
     * This operation creates:
     * - Service (with slug generation and image upload)
     * - Service Packages & their Features
     * - FAQs
     * - Legal Bases
     * - Requirement Categories & Requirements
     * - Process Steps
     *
     * All operations are wrapped in a database transaction to ensure
     * atomicity and prevent partial data persistence on errors.
     *
     * Slug Generation:
     * - Uses provided slug or auto-generates from service name
     * - Ensures uniqueness by appending counter if needed
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            // Basic Information
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
            'legal_bases'                   => 'nullable|array',
            'legal_bases.*.document_type'   => 'required|string|max:255',
            'legal_bases.*.document_number' => 'required|string|max:255',
            'legal_bases.*.title'           => 'required|string|max:255',
            'legal_bases.*.issued_date'     => 'nullable|date',
            'legal_bases.*.url'             => 'nullable|url|max:255',
            'legal_bases.*.description'     => 'nullable|string',
            'legal_bases.*.sort_order'      => 'nullable|integer|min:0',

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
            // Generate unique slug
            $slug = $validated['slug']
                ? Str::slug($validated['slug'])
                : Str::slug($validated['name']);

            $originalSlug = $slug;
            $counter = 1;
            while (Service::where('slug', $slug)->exists()) {
                $slug = "{$originalSlug}-{$counter}";
                $counter++;
            }

            // Handle featured image upload
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

            // Create packages and features
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

            // Create legal bases
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

            // Create requirement categories and requirements
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

            // Create process steps
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

        return to_route('services.index')->with('success', 'Layanan berhasil ditambahkan.');
    }

    /**
     * Show the form for editing the specified service.
     *
     * Eager loads all related entities for edit form population.
     *
     * @param Service $service
     * @return \Inertia\Response
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
            'faqs' => fn($query) => $query->orderBy('sort_order'),
            'legalBases' => fn($query) => $query->orderBy('sort_order'),
            'requirementCategories' => function ($query) {
                $query->orderBy('sort_order')->with([
                    'requirements' => fn($q) => $q->orderBy('sort_order'),
                ]);
            },
            'processSteps' => fn($query) => $query->orderBy('sort_order'),
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
     * Update basic information tab.
     *
     * Handles:
     * - Service name, category, and description
     * - Slug regeneration with uniqueness check
     * - Featured image upload/replacement/removal
     * - Publication state management
     * - Status synchronization
     *
     * Business Rules:
     * - Publishing sets published_at timestamp to current time
     * - Unpublishing changes status to inactive but keeps timestamp
     * - Slug must remain unique (excluding current service)
     * - Old images are deleted when replaced or removed
     *
     * @param Request $request
     * @param Service $service
     * @return \Illuminate\Http\RedirectResponse
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
            'status'              => 'string|in:active,inactive',
        ]);

        DB::transaction(function () use ($validated, $request, $service) {
            // Generate and ensure unique slug
            $slug = $validated['slug']
                ? Str::slug($validated['slug'])
                : Str::slug($validated['name']);

            if ($slug !== $service->slug) {
                $originalSlug = $slug;
                $counter = 1;
                while (Service::where('slug', $slug)->where('id', '!=', $service->id)->exists()) {
                    $slug = "{$originalSlug}-{$counter}";
                    $counter++;
                }
            }

            // Handle featured image
            $featuredImagePath = $service->featured_image;

            if ($request->boolean('remove_image') && $service->featured_image) {
                Storage::disk('public')->delete($service->featured_image);
                $featuredImagePath = null;
            }

            if ($request->hasFile('featured_image')) {
                if ($service->featured_image) {
                    Storage::disk('public')->delete($service->featured_image);
                }
                $featuredImagePath = $request->file('featured_image')
                    ->store('services/images', 'public');
            }

            // Manage publication state
            $isPublished = $validated['is_published'] ?? $service->is_published;
            $publishedAt = $service->published_at;
            $status = $service->status;

            if ($isPublished && !$service->is_published) {
                $publishedAt = now();
                $status = 'active';
            } elseif (!$isPublished && $service->is_published) {
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
     * Update content tab (introduction and main content).
     *
     * @param Request $request
     * @param Service $service
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateContent(Request $request, Service $service)
    {
        $validated = $request->validate([
            'introduction' => 'nullable|string',
            'content'      => 'nullable|string',
        ]);

        $service->update([
            'introduction' => $validated['introduction'],
            'content'      => $validated['content'],
        ]);

        return back()->with('success', 'Konten layanan berhasil diperbarui.');
    }

    /**
     * Update pricing packages and their nested features.
     *
     * Synchronization Strategy:
     * 1. Identify packages to delete (exist in DB but not in submission)
     * 2. Update existing packages or create new ones
     * 3. For each package, apply same logic to features
     *
     * This maintains referential integrity and prevents orphaned records.
     * Wrapped in transaction to ensure atomicity.
     *
     * @param Request $request
     * @param Service $service
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updatePackages(Request $request, Service $service)
    {
        $validated = $request->validate([
            'packages'                           => 'required|array|min:1',
            'packages.*.id'                      => 'nullable|exists:service_packages,id',
            'packages.*.name'                    => 'required|string|max:255',
            'packages.*.price'                   => 'required|numeric|min:0',
            'packages.*.original_price'          => 'nullable|numeric|min:0',
            'packages.*.duration'                => 'required|string|max:255',
            'packages.*.duration_days'           => 'nullable|integer|min:0',
            'packages.*.short_description'       => 'nullable|string',
            'packages.*.is_highlighted'          => 'boolean',
            'packages.*.badge'                   => 'nullable|string|max:255',
            'packages.*.sort_order'              => 'nullable|integer|min:0',
            'packages.*.status'                  => 'string|in:active,inactive',
            'packages.*.features'                => 'nullable|array',
            'packages.*.features.*.id'           => 'nullable|exists:service_package_features,id',
            'packages.*.features.*.feature_name' => 'required|string|max:255',
            'packages.*.features.*.description'  => 'nullable|string',
            'packages.*.features.*.is_included'  => 'boolean',
            'packages.*.features.*.sort_order'   => 'nullable|integer|min:0',
        ]);

        DB::transaction(function () use ($validated, $service) {
            // Identify packages to delete
            $existingPackageIds = $service->packages()->pluck('id')->toArray();
            $submittedPackageIds = collect($validated['packages'])
                ->pluck('id')
                ->filter()
                ->toArray();

            $packagesToDelete = array_diff($existingPackageIds, $submittedPackageIds);
            if (!empty($packagesToDelete)) {
                ServicePackage::whereIn('id', $packagesToDelete)->delete();
            }

            // Create or update packages
            foreach ($validated['packages'] as $pkgIndex => $pkgData) {
                if (!empty($pkgData['id'])) {
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
                        'status'            => $pkgData['status'] ?? 'active',
                    ]);
                } else {
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

                // Handle features synchronization
                if (isset($pkgData['features'])) {
                    $existingFeatureIds = $package->features()->pluck('id')->toArray();
                    $submittedFeatureIds = collect($pkgData['features'])
                        ->pluck('id')
                        ->filter()
                        ->toArray();

                    $featuresToDelete = array_diff($existingFeatureIds, $submittedFeatureIds);
                    if (!empty($featuresToDelete)) {
                        ServicePackageFeature::whereIn('id', $featuresToDelete)->delete();
                    }

                    foreach ($pkgData['features'] as $featIndex => $featData) {
                        if (!empty($featData['id'])) {
                            $feature = ServicePackageFeature::findOrFail($featData['id']);
                            $feature->update([
                                'feature_name' => $featData['feature_name'],
                                'description'  => $featData['description'] ?? null,
                                'is_included'  => $featData['is_included'] ?? true,
                                'sort_order'   => $featData['sort_order'] ?? $featIndex,
                            ]);
                        } else {
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
     * Update service FAQs.
     *
     * Synchronizes FAQ list:
     * - Deletes FAQs not in submission
     * - Updates existing FAQs
     * - Creates new FAQs
     *
     * @param Request $request
     * @param Service $service
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateFaqs(Request $request, Service $service)
    {
        $validated = $request->validate([
            'faqs'              => 'nullable|array',
            'faqs.*.id'         => 'nullable|exists:service_faqs,id',
            'faqs.*.question'   => 'required|string',
            'faqs.*.answer'     => 'required|string',
            'faqs.*.sort_order' => 'nullable|integer|min:0',
            'faqs.*.status'     => 'nullable|string|in:active,inactive',
        ]);

        DB::transaction(function () use ($validated, $service) {
            // Identify FAQs to delete
            $existingFaqIds = $service->faqs()->pluck('id')->toArray();
            $submittedFaqIds = collect($validated['faqs'] ?? [])
                ->pluck('id')
                ->filter()
                ->toArray();

            $faqsToDelete = array_diff($existingFaqIds, $submittedFaqIds);
            if (!empty($faqsToDelete)) {
                ServiceFaq::whereIn('id', $faqsToDelete)->delete();
            }

            // Create or update FAQs
            foreach (($validated['faqs'] ?? []) as $faqIndex => $faqData) {
                if (!empty($faqData['id'])) {
                    $faq = ServiceFaq::findOrFail($faqData['id']);
                    $faq->update([
                        'question'   => $faqData['question'],
                        'answer'     => $faqData['answer'],
                        'sort_order' => $faqData['sort_order'] ?? $faqIndex,
                        'status'     => $faqData['status'] ?? 'active',
                    ]);
                } else {
                    ServiceFaq::create([
                        'service_id' => $service->id,
                        'question'   => $faqData['question'],
                        'answer'     => $faqData['answer'],
                        'sort_order' => $faqData['sort_order'] ?? $faqIndex,
                        'status'     => 'active',
                    ]);
                }
            }
        });

        return back()->with('success', 'FAQ berhasil diperbarui.');
    }

    /**
     * Update service legal bases.
     *
     * Synchronizes legal basis documents:
     * - Deletes legal bases not in submission
     * - Updates existing legal bases
     * - Creates new legal bases
     *
     * @param Request $request
     * @param Service $service
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateLegalBases(Request $request, Service $service)
    {
        $validated = $request->validate([
            'legal_bases'                   => 'nullable|array',
            'legal_bases.*.id'              => 'nullable|exists:service_legal_bases,id',
            'legal_bases.*.document_type'   => 'required|string|max:255',
            'legal_bases.*.document_number' => 'required|string|max:255',
            'legal_bases.*.title'           => 'required|string|max:255',
            'legal_bases.*.issued_date'     => 'nullable|date',
            'legal_bases.*.url'             => 'nullable|url|max:255',
            'legal_bases.*.description'     => 'nullable|string',
            'legal_bases.*.sort_order'      => 'nullable|integer|min:0',
            'legal_bases.*.status'          => 'nullable|string|in:active,inactive',
        ]);

        DB::transaction(function () use ($validated, $service) {
            // Identify legal bases to delete
            $existingLegalIds = $service->legalBases()->pluck('id')->toArray();
            $submittedLegalIds = collect($validated['legal_bases'] ?? [])
                ->pluck('id')
                ->filter()
                ->toArray();

            $legalToDelete = array_diff($existingLegalIds, $submittedLegalIds);
            if (!empty($legalToDelete)) {
                ServiceLegalBasis::whereIn('id', $legalToDelete)->delete();
            }

            // Create or update legal bases
            foreach (($validated['legal_bases'] ?? []) as $legalIndex => $legalData) {
                if (!empty($legalData['id'])) {
                    $legal = ServiceLegalBasis::findOrFail($legalData['id']);
                    $legal->update([
                        'document_type'   => $legalData['document_type'],
                        'document_number' => $legalData['document_number'],
                        'title'           => $legalData['title'],
                        'issued_date'     => $legalData['issued_date'] ?? null,
                        'url'             => $legalData['url'] ?? null,
                        'description'     => $legalData['description'] ?? null,
                        'sort_order'      => $legalData['sort_order'] ?? $legalIndex,
                        'status'          => $legalData['status'] ?? 'active',
                    ]);
                } else {
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
            }
        });

        return back()->with('success', 'Dasar hukum berhasil diperbarui.');
    }

    /**
     * Update service requirements and requirement categories.
     *
     * Synchronizes nested structure:
     * - Requirement Categories
     *   - Requirements (nested under each category)
     *
     * Applies same synchronization logic as packages/features.
     *
     * @param Request $request
     * @param Service $service
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateRequirements(Request $request, Service $service)
    {
        $validated = $request->validate([
            'requirement_categories'                              => 'nullable|array',
            'requirement_categories.*.id'                         => 'nullable|exists:service_requirement_categories,id',
            'requirement_categories.*.name'                       => 'required|string|max:255',
            'requirement_categories.*.description'                => 'nullable|string',
            'requirement_categories.*.sort_order'                 => 'nullable|integer|min:0',
            'requirement_categories.*.status'                     => 'nullable|string|in:active,inactive',
            'requirement_categories.*.requirements'               => 'nullable|array',
            'requirement_categories.*.requirements.*.id'          => 'nullable|exists:service_requirements,id',
            'requirement_categories.*.requirements.*.name'        => 'required|string|max:255',
            'requirement_categories.*.requirements.*.description' => 'nullable|string',
            'requirement_categories.*.requirements.*.is_required' => 'boolean',
            'requirement_categories.*.requirements.*.document_format' => 'nullable|string|max:255',
            'requirement_categories.*.requirements.*.notes'       => 'nullable|string',
            'requirement_categories.*.requirements.*.sort_order'  => 'nullable|integer|min:0',
        ]);

        DB::transaction(function () use ($validated, $service) {
            // Identify requirement categories to delete
            $existingCategoryIds = $service->requirementCategories()->pluck('id')->toArray();
            $submittedCategoryIds = collect($validated['requirement_categories'] ?? [])
                ->pluck('id')
                ->filter()
                ->toArray();

            $categoriesToDelete = array_diff($existingCategoryIds, $submittedCategoryIds);
            if (!empty($categoriesToDelete)) {
                ServiceRequirementCategory::whereIn('id', $categoriesToDelete)->delete();
            }

            // Create or update requirement categories
            foreach (($validated['requirement_categories'] ?? []) as $catIndex => $catData) {
                if (!empty($catData['id'])) {
                    $category = ServiceRequirementCategory::findOrFail($catData['id']);
                    $category->update([
                        'name'        => $catData['name'],
                        'description' => $catData['description'] ?? null,
                        'sort_order'  => $catData['sort_order'] ?? $catIndex,
                        'status'      => $catData['status'] ?? 'active',
                    ]);
                } else {
                    $category = ServiceRequirementCategory::create([
                        'service_id'  => $service->id,
                        'name'        => $catData['name'],
                        'description' => $catData['description'] ?? null,
                        'sort_order'  => $catData['sort_order'] ?? $catIndex,
                        'status'      => 'active',
                    ]);
                }

                // Handle requirements synchronization
                if (isset($catData['requirements'])) {
                    $existingRequirementIds = $category->requirements()->pluck('id')->toArray();
                    $submittedRequirementIds = collect($catData['requirements'])
                        ->pluck('id')
                        ->filter()
                        ->toArray();

                    $requirementsToDelete = array_diff($existingRequirementIds, $submittedRequirementIds);
                    if (!empty($requirementsToDelete)) {
                        ServiceRequirement::whereIn('id', $requirementsToDelete)->delete();
                    }

                    foreach ($catData['requirements'] as $reqIndex => $reqData) {
                        if (!empty($reqData['id'])) {
                            $requirement = ServiceRequirement::findOrFail($reqData['id']);
                            $requirement->update([
                                'name'            => $reqData['name'],
                                'description'     => $reqData['description'] ?? null,
                                'is_required'     => $reqData['is_required'] ?? true,
                                'document_format' => $reqData['document_format'] ?? null,
                                'notes'           => $reqData['notes'] ?? null,
                                'sort_order'      => $reqData['sort_order'] ?? $reqIndex,
                            ]);
                        } else {
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
                }
            }
        });

        return back()->with('success', 'Persyaratan berhasil diperbarui.');
    }

    /**
     * Update service process steps.
     *
     * Synchronizes process step list:
     * - Deletes steps not in submission
     * - Updates existing steps
     * - Creates new steps
     *
     * @param Request $request
     * @param Service $service
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateProcessSteps(Request $request, Service $service)
    {
        $validated = $request->validate([
            'process_steps'                        => 'nullable|array',
            'process_steps.*.id'                   => 'nullable|exists:service_process_steps,id',
            'process_steps.*.title'                => 'required|string|max:255',
            'process_steps.*.description'          => 'nullable|string',
            'process_steps.*.duration'             => 'nullable|string|max:255',
            'process_steps.*.duration_days'        => 'nullable|integer|min:0',
            'process_steps.*.required_documents'   => 'nullable|array',
            'process_steps.*.required_documents.*' => 'string|max:255',
            'process_steps.*.notes'                => 'nullable|string',
            'process_steps.*.icon'                 => 'nullable|string|max:255',
            'process_steps.*.sort_order'           => 'nullable|integer|min:0',
            'process_steps.*.status'               => 'nullable|string|in:active,inactive',
        ]);

        DB::transaction(function () use ($validated, $service) {
            // Identify process steps to delete
            $existingStepIds = $service->processSteps()->pluck('id')->toArray();
            $submittedStepIds = collect($validated['process_steps'] ?? [])
                ->pluck('id')
                ->filter()
                ->toArray();

            $stepsToDelete = array_diff($existingStepIds, $submittedStepIds);
            if (!empty($stepsToDelete)) {
                ServiceProcessStep::whereIn('id', $stepsToDelete)->delete();
            }

            // Create or update process steps
            foreach (($validated['process_steps'] ?? []) as $stepIndex => $stepData) {
                if (!empty($stepData['id'])) {
                    $step = ServiceProcessStep::findOrFail($stepData['id']);
                    $step->update([
                        'title'              => $stepData['title'],
                        'description'        => $stepData['description'] ?? null,
                        'duration'           => $stepData['duration'] ?? null,
                        'duration_days'      => $stepData['duration_days'] ?? null,
                        'required_documents' => $stepData['required_documents'] ?? null,
                        'notes'              => $stepData['notes'] ?? null,
                        'icon'               => $stepData['icon'] ?? null,
                        'sort_order'         => $stepData['sort_order'] ?? $stepIndex,
                        'status'             => $stepData['status'] ?? 'active',
                    ]);
                } else {
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
            }
        });

        return back()->with('success', 'Alur proses berhasil diperbarui.');
    }

    /**
     * Delete a service and all related data.
     *
     * This operation:
     * - Removes featured image from storage
     * - Deletes service record
     * - Relies on database CASCADE rules for related entities
     *
     * Note: Ensure foreign keys have ON DELETE CASCADE configured
     * in migrations for proper cleanup of related records.
     *
     * Wrapped in transaction for consistency.
     *
     * @param Service $service
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Service $service)
    {
        DB::transaction(function () use ($service) {
            // Delete featured image from storage
            if ($service->featured_image) {
                Storage::disk('public')->delete($service->featured_image);
            }

            // Delete service (cascade deletes related records)
            $service->delete();
        });

        return redirect()->back()->with('success', 'Layanan berhasil dihapus.');
    }
}
