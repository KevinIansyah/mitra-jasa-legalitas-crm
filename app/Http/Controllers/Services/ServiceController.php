<?php

namespace App\Http\Controllers\Services;

use App\Http\Controllers\Controller;
use App\Helpers\FileHelper;
use App\Http\Requests\Services\StoreRequest;
use App\Http\Requests\Services\UpdateBasicInformationRequest;
use App\Http\Requests\Services\UpdateContentRequest;
use App\Http\Requests\Services\UpdateFaqsRequest;
use App\Http\Requests\Services\UpdateLegalBasesRequest;
use App\Http\Requests\Services\UpdatePackagesRequest;
use App\Http\Requests\Services\UpdateProcessStepsRequest;
use App\Http\Requests\Services\UpdateRequirementsRequest;
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
use Illuminate\Support\Str;
use Inertia\Inertia;

class ServiceController extends Controller
{
    /**
     * Display paginated listing of services with filters.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');
        $status = $request->get('status');
        $category = $request->get('category');
        $isPublished = $request->get('is_published');

        $query = Service::with('category');

        if ($search) {
            $query->search($search);
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($category) {
            $query->where('service_category_id', $category);
        }

        if ($isPublished === 'published') {
            $query->where('is_published', true);
        } elseif ($isPublished === 'unpublished') {
            $query->where('is_published', false);
        }

        $services = $query->latest()->paginate($perPage);

        $categories = ServiceCategory::orderBy('sort_order')
            ->get(['id', 'name']);

        $summary = [
            'total'     => Service::count(),
            'published' => Service::where('is_published', true)->count(),
            'featured'  => Service::where('is_featured', true)->count(),
            'popular'   => Service::where('is_popular', true)->count(),
        ];

        return Inertia::render('services/index', [
            'services'   => $services,
            'summary'    => $summary,
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
     */
    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

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
                $fileData = FileHelper::uploadToR2Public(
                    $request->file('featured_image'),
                    'services/images',
                );
                $featuredImagePath = $fileData['path'];
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
     */
    public function updateBasicInformation(UpdateBasicInformationRequest $request, Service $service)
    {
        $validated = $request->validated();

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
                FileHelper::deleteFromR2($service->featured_image, isPublic: true);
                $featuredImagePath = null;
            }

            if ($request->hasFile('featured_image')) {
                if ($service->featured_image) {
                    FileHelper::deleteFromR2($service->featured_image, isPublic: true);
                }

                $fileData = FileHelper::uploadToR2Public(
                    $request->file('featured_image'),
                    'services/images',
                );

                $featuredImagePath = $fileData['path'];
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
     */
    public function updateContent(UpdateContentRequest $request, Service $service)
    {
        $validated = $request->validated();

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
     */
    public function updatePackages(UpdatePackagesRequest $request, Service $service)
    {
        $validated = $request->validated();

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
     */
    public function updateFaqs(UpdateFaqsRequest $request, Service $service)
    {
        $validated = $request->validated();

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
     */
    public function updateLegalBases(UpdateLegalBasesRequest $request, Service $service)
    {
        $validated = $request->validated();

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
     */
    public function updateRequirements(UpdateRequirementsRequest $request, Service $service)
    {
        $validated = $request->validated();

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
     */
    public function updateProcessSteps(UpdateProcessStepsRequest $request, Service $service)
    {
        $validated = $request->validated();

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
     */
    public function destroy(Service $service)
    {
        DB::transaction(function () use ($service) {
            if ($service->featured_image) {
                FileHelper::deleteFromR2($service->featured_image, isPublic: true);
            }

            $service->delete();
        });

        return back()->with('success', 'Layanan berhasil dihapus.');
    }
}
