<?php

namespace App\Http\Controllers;

use App\Models\ProjectTemplate;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/**
 * ProjectTemplateController
 *
 * Handles CRUD operations for project templates including:
 * - Creating custom templates or templates from services
 * - Managing template milestones and documents (stored as JSON)
 * - Soft delete functionality for archiving
 * - Service search for template creation
 *
 * Domain: Project Management
 * Architecture: Uses Inertia.js for frontend rendering
 *
 * @package App\Http\Controllers
 */
class ProjectTemplateController extends Controller
{
    /**
     * Display paginated listing of project templates with filters.
     *
     * Supports filtering by:
     * - Search keyword (matches template name)
     * - Service ID (service-based templates)
     * - Template type (service_based, custom, all)
     * - Active status
     * - Include archived templates
     * - Per-page limit (20, 30, 40, 50)
     *
     * @param Request $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');
        $serviceId = $request->get('service_id');
        $templateType = $request->get('template_type', 'all');
        $status = $request->get('status');
        $includeArchived = $request->boolean('include_archived');

        $query = ProjectTemplate::with('service:id,name');

        if ($includeArchived) {
            $query->withTrashed();
        }

        if ($search) {
            $query->search($search);
        }

        if ($serviceId) {
            $query->where('service_id', $serviceId);
        }

        if ($templateType === 'service_based') {
            $query->serviceBased();
        } elseif ($templateType === 'custom') {
            $query->custom();
        }

        if ($status) {
            $query->where('status', $status);
        }

        $templates = $query->latest()->paginate($perPage);

        $services = Service::where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('projects/templates/index', [
            'templates' => $templates,
            'services' => $services,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
                'service_id' => $serviceId,
                'template_type' => $templateType,
                'status' => $status,
                'include_archived' => $includeArchived,
            ],
        ]);
    }

    /**
     * Show the form for creating a new template.
     *
     * Loads active services for "from service" creation mode.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        $services = Service::where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('projects/templates/create/index', [
            'services' => $services,
        ]);
    }

    /**
     * Store a newly created template.
     *
     * Supports two creation modes:
     * 1. Custom: User manually fills all fields
     * 2. From Service: Auto-populate from service data
     *
     * Template data structure:
     * - Basic info (name, description, duration, notes)
     * - Milestones (JSON array)
     * - Documents (JSON array)
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_id' => 'nullable|exists:services,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'estimated_duration_days' => 'nullable|integer|min:1',
            'notes' => 'nullable|string',
            'status' => 'string|in:active,inactive',

            // Milestones validation
            'milestones' => 'required|array|min:1',
            'milestones.*.title' => 'required|string|max:255',
            'milestones.*.description' => 'nullable|string',
            'milestones.*.estimated_duration_days' => 'required|integer|min:1',
            'milestones.*.day_offset' => 'required|integer|min:0',
            'milestones.*.sort_order' => 'required|integer|min:1',

            // Documents validation
            'documents' => 'required|array|min:1',
            'documents.*.name' => 'required|string|max:255',
            'documents.*.description' => 'nullable|string',
            'documents.*.document_format' => 'nullable|string|max:255',
            'documents.*.is_required' => 'required|boolean',
            'documents.*.notes' => 'nullable|string',
            'documents.*.sort_order' => 'required|integer|min:1',
        ]);

        $template = ProjectTemplate::create([
            'service_id' => $validated['service_id'] ?? null,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'estimated_duration_days' => $validated['estimated_duration_days'] ?? null,
            'milestones' => $validated['milestones'],
            'documents' => $validated['documents'],
            'notes' => $validated['notes'] ?? null,
            'status' => $validated['status'] ?? 'active',
        ]);

        return to_route('projects.templates.index')
            ->with('success', 'Template project berhasil ditambahkan.');
    }

    /**
     * Show the form for editing the specified template.
     *
     * Loads template with service relationship.
     *
     * @param ProjectTemplate $template
     * @return \Inertia\Response
     */
    public function edit(ProjectTemplate $template)
    {
        $template->load('service:id,name');

        $services = Service::where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('projects/templates/edit/index', [
            'template' => $template,
            'services' => $services,
        ]);
    }

    /**
     * Update the specified template.
     *
     * Allows full update of template including:
     * - Basic information
     * - Milestones (full replacement)
     * - Documents (full replacement)
     *
     * @param Request $request
     * @param ProjectTemplate $template
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, ProjectTemplate $template)
    {
        $validated = $request->validate([
            'service_id' => 'nullable|exists:services,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'estimated_duration_days' => 'nullable|integer|min:1',
            'notes' => 'nullable|string',
            'status' => 'string|in:active,inactive',

            // Milestones validation
            'milestones' => 'required|array|min:1',
            'milestones.*.title' => 'required|string|max:255',
            'milestones.*.description' => 'nullable|string',
            'milestones.*.estimated_duration_days' => 'required|integer|min:1',
            'milestones.*.day_offset' => 'required|integer|min:0',
            'milestones.*.sort_order' => 'required|integer|min:1',

            // Documents validation
            'documents' => 'required|array|min:1',
            'documents.*.name' => 'required|string|max:255',
            'documents.*.description' => 'nullable|string',
            'documents.*.document_format' => 'nullable|string|max:255',
            'documents.*.is_required' => 'required|boolean',
            'documents.*.notes' => 'nullable|string',
            'documents.*.sort_order' => 'required|integer|min:1',
        ]);

        $template->update([
            'service_id' => $validated['service_id'] ?? null,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'estimated_duration_days' => $validated['estimated_duration_days'] ?? null,
            'milestones' => $validated['milestones'],
            'documents' => $validated['documents'],
            'notes' => $validated['notes'] ?? null,
            'status' => $validated['status'] ?? $template->status,
        ]);

        return to_route('projects.templates.index')
            ->with('success', 'Template project berhasil diperbarui.');
    }

    /**
     * Soft delete the specified template (archive).
     *
     * Uses soft delete to allow restoration if needed.
     * Archived templates can be viewed by enabling "include_archived" filter.
     *
     * @param ProjectTemplate $template
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(ProjectTemplate $template)
    {
        $template->delete();

        return back()->with('success', 'Template project berhasil diarsipkan.');
    }

    /**
     * Duplicate an existing template with smart naming.
     *
     * Creates a copy with incremented duplicate counter:
     * - Original: "Template A"
     * - First duplicate: "Template A (Duplicate)"
     * - Second duplicate: "Template A (Duplicate 2)"
     * - Third duplicate: "Template A (Duplicate 3)"
     * - etc.
     *
     * @param ProjectTemplate $template
     * @return \Illuminate\Http\RedirectResponse
     */
    public function duplicate(ProjectTemplate $template)
    {
        // Create a copy of the template
        $newTemplate = $template->replicate();

        // Generate unique name with counter
        $baseName = $template->name;
        $newName = $baseName . ' (Duplicate)';

        // Check if name already exists
        $counter = 2;
        while (ProjectTemplate::where('name', $newName)->exists()) {
            $newName = $baseName . ' (Duplicate ' . $counter . ')';
            $counter++;
        }

        $newTemplate->name = $newName;
        $newTemplate->status = 'active';
        $newTemplate->deleted_at = null;
        $newTemplate->save();

        return back()->with('success', 'Template berhasil diduplikasi.');
    }


    /**
     * Get template data generated from service.
     *
     * Returns pre-populated milestone and document data based on service
     * process steps and requirements. Used for AJAX call when user selects
     * "create from service" mode.
     *
     * @param Service $service
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTemplateFromService(Service $service)
    {
        // Build milestones from process steps
        $milestones = $service->processSteps()
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->get()
            ->map(function ($step, $index) use ($service) {
                // Calculate day_offset from previous steps
                $dayOffset = 0;
                if ($index > 0) {
                    $dayOffset = $service->processSteps()
                        ->where('status', 'active')
                        ->orderBy('sort_order')
                        ->take($index)
                        ->sum('duration_days') ?? 0;
                }

                return [
                    'title' => $step->title,
                    'description' => $step->description,
                    'estimated_duration_days' => $step->duration_days ?? 1,
                    'day_offset' => $dayOffset,
                    'sort_order' => $index,
                ];
            })->toArray();

        // Build documents from requirements
        $documents = [];
        $sortOrder = 0;

        $requirementCategories = $service->requirementCategories()
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->with(['requirements' => function ($query) {
                $query->where('status', 'active')->orderBy('sort_order');
            }])
            ->get();

        foreach ($requirementCategories as $category) {
            foreach ($category->requirements as $requirement) {
                $documents[] = [
                    'name' => $requirement->name,
                    'description' => $requirement->description,
                    'document_format' => $requirement->document_format,
                    'is_required' => $requirement->is_required,
                    'notes' => $requirement->notes,
                    'sort_order' => $sortOrder++,
                ];
            }
        }

        // Calculate total duration
        $estimatedDuration = $service->processSteps()
            ->where('status', 'active')
            ->sum('duration_days');

        return response()->json([
            'milestones' => $milestones,
            'documents' => $documents,
            'estimated_duration_days' => $estimatedDuration,
        ]);
    }
}
