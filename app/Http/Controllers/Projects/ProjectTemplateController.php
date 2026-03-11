<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Http\Requests\Projects\Templates\StoreRequest;
use App\Http\Requests\Projects\Templates\UpdateRequest;
use App\Models\ProjectTemplate;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectTemplateController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');
        $serviceId = $request->get('service_id');
        $templateType = $request->get('template_type', 'all');
        $status = $request->get('status');
        $includeArchived = $request->boolean('include_archived');

        $templates = ProjectTemplate::with('service:id,name')
            ->when($includeArchived, fn($q) => $q->withTrashed())
            ->when($search, fn($q, $search) => $q->search($search))
            ->when($serviceId, fn($q, $serviceId) => $q->where('service_id', $serviceId))
            ->when($templateType === 'service_based', fn($q) => $q->serviceBased())
            ->when($templateType === 'custom', fn($q) => $q->custom())
            ->when($status, fn($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate($perPage);

        $services = Service::where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);

        $summary = ProjectTemplate::selectRaw("
            COUNT(*) as total,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
            SUM(CASE WHEN service_id IS NOT NULL THEN 1 ELSE 0 END) as service_based,
            SUM(CASE WHEN service_id IS NULL THEN 1 ELSE 0 END) as custom,
            SUM(
                CASE 
                    WHEN (milestones IS NOT NULL AND milestones != '[]')
                    OR (documents IS NOT NULL AND documents != '[]')
                    THEN 1 ELSE 0 
                END
            ) as with_content
        ")->first();

        return Inertia::render('projects/templates/index', [
            'templates' => $templates,
            'summary'   => $summary,
            'services'  => $services,
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

    public function create()
    {
        $services = Service::where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('projects/templates/create/index', [
            'services' => $services,
        ]);
    }

    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        ProjectTemplate::create([
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

    public function update(UpdateRequest $request, ProjectTemplate $template)
    {
        $validated = $request->validated();

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
     */
    public function duplicate(ProjectTemplate $template)
    {
        $newTemplate = $template->replicate();
        $baseName = $template->name;
        $newName = $baseName . ' (Duplicate)';

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
     */
    public function getTemplateFromService(Service $service)
    {
        $steps = $service->processSteps()
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->get();

        $dayOffset = 0;
        $milestones = $steps->map(function ($step, $index) use (&$dayOffset) {
            $currentOffset = $dayOffset;
            $dayOffset += $step->duration_days ?? 0;

            return [
                'title' => $step->title,
                'description' => $step->description,
                'estimated_duration_days' => $step->duration_days ?? 1,
                'day_offset' => $currentOffset,
                'sort_order' => $index,
            ];
        })->toArray();

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

        $estimatedDuration = $steps->sum('duration_days');

        return response()->json([
            'milestones' => $milestones,
            'documents' => $documents,
            'estimated_duration_days' => $estimatedDuration,
        ]);
    }
}
