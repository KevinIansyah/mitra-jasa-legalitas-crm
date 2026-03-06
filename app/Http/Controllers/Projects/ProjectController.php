<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Helpers\ActivityHelper;
use App\Http\Requests\Projects\StoreRequest;
use App\Http\Requests\Projects\UpdateRequest;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Expense;
use App\Models\Project;
use App\Models\ProjectDeliverable;
use App\Models\ProjectDocument;
use App\Models\ProjectInvoice;
use App\Models\ProjectMember;
use App\Models\ProjectMilestone;
use App\Models\ProjectTask;
use App\Models\ProjectTemplate;
use App\Models\Service;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class ProjectController extends Controller
{
    /**
     * Display a listing of the projects.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');
        $status = $request->get('status');
        $customerId = $request->get('customer_id');
        $companyId = $request->get('company_id');
        $serviceID = $request->get('service_id');

        $query = Project::with('customer:id,name,tier', 'company:id,name', 'service:id,name', 'servicePackage:id,name', 'projectLeaders:id,name');

        if ($search) {
            $query->search($search);
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($customerId) {
            $query->where('customer_id', $customerId);
        }

        if ($companyId) {
            $query->where('company_id', $companyId);
        }

        if ($serviceID) {
            $query->where('service_id', $serviceID);
        }

        $projects = $query->latest()->paginate($perPage);
        $projects->through(fn($project) => $project->append(['progress_percentage', 'project_leader']));
        $customers = Customer::select('id', 'name')->get();
        $companies = Company::select('id', 'name')->get();
        $services = Service::select('id', 'name')->get();

        return Inertia::render('projects/index', [
            'projects' => $projects,
            'customers' => $customers,
            'companies' => $companies,
            'services' => $services,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Show the form for creating a new project.
     */
    public function create()
    {
        $services = Service::where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('projects/create/index', [
            'services' => $services,
        ]);
    }

    /**
     * Store a newly created project.
     *
     * Uses StoreRequest for validation.
     * Wraps creation process in a database transaction.
     *
     * If a project_template_id is provided:
     * - Copies milestones from template
     * - Copies required documents from template
     * - Automatically calculates milestone start & end dates
     */
    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated) {
            $project = Project::create([
                'customer_id' => $validated['customer_id'],
                'company_id' => $validated['company_id'] ?? null,
                'service_id' => $validated['service_id'] ?? null,
                'service_package_id' => $validated['service_package_id'] ?? null,
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'budget' => $validated['budget'],
                'start_date' => $validated['start_date'],
                'planned_end_date' => $validated['planned_end_date'],
                'status' => $validated['status'] ?? 'planning',
            ]);

            if (!empty($validated['project_template_id'])) {
                $template = ProjectTemplate::find($validated['project_template_id']);

                if ($template) {
                    $this->copyTemplateToProject($project, $template);
                }
            }
        });

        return to_route('projects.index')
            ->with('success', 'Project berhasil ditambahkan.');
    }

    /**
     * Display the specified project.
     */
    public function show(Project $project)
    {
        $project->load(['customer.companies', 'customer.user', 'company', 'service.category',  'servicePackage']);

        $services = Service::where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('projects/detail/index', [
            'project' => $project,
            'services' => $services,
            'tab'     => 'overview',
        ]);
    }

    public function finance(Project $project)
    {
        $project->load([
            'invoices' => fn($q) => $q->latest(),
            'invoices.items',
            'invoices.payments.verifier',
            'expenses' => fn($q) => $q->latest(),
            'expenses.user',
            'customer',
        ]);

        $project->append([
            'total_expenses',
            'total_billable_expenses',

            'total_contract_invoiced',
            'total_contract_invoiced_with_tax',
            'total_contract_paid',
            'total_contract_paid_with_tax',

            'total_additional_invoiced',
            'total_additional_invoiced_with_tax',
            'total_additional_paid',
            'total_additional_paid_with_tax',

            'total_invoiced',
            'total_invoiced_with_tax',
            'total_paid',
            'total_paid_with_tax',

            'outstanding_amount',
            'remaining_bill',
            'contract_profit',
            'actual_profit',
        ]);

        return Inertia::render('projects/detail/index', [
            'project' => $project,
            'tab'     => 'finance',
        ]);
    }

    public function team(Project $project)
    {
        $project->load([
            'members' => fn($q) => $q->latest(),
            'members.user'
        ]);

        return Inertia::render('projects/detail/index', [
            'project' => $project,
            'tab'     => 'team',
        ]);
    }

    public function milestones(Project $project)
    {
        $project->load(['milestones' => function ($query) {
            $query->withCount('tasks');
        }]);

        $project->milestones->each->append('days_variance');

        return Inertia::render('projects/detail/index', [
            'project' => $project,
            'tab'     => 'milestones',
        ]);
    }

    public function activities(Project $project)
    {
        $activities = Activity::where(function ($query) use ($project) {
            $query->where('subject_type', Project::class)
                ->where('subject_id', $project->id);
        })
            ->orWhere(function ($query) use ($project) {
                $query->where('subject_type', ProjectMilestone::class)
                    ->whereIn('subject_id', $project->milestones()->withTrashed()->pluck('id'));
            })
            ->orWhere(function ($query) use ($project) {
                $query->where('subject_type', ProjectInvoice::class)
                    ->whereIn('subject_id', $project->invoices()->withTrashed()->pluck('id'));
            })
            ->orWhere(function ($query) use ($project) {
                $query->where('subject_type', Expense::class)
                    ->whereIn('subject_id', $project->expenses()->withTrashed()->pluck('id'));
            })
            ->orWhere(function ($query) use ($project) {
                $query->where('subject_type', ProjectMember::class)
                    ->whereIn('subject_id', $project->members()->pluck('id'));
            })
            ->orWhere(function ($query) use ($project) {
                $query->where('subject_type', ProjectTask::class)
                    ->whereIn('subject_id', $project->tasks()->withTrashed()->pluck('id'));
            })
            ->orWhere(function ($query) use ($project) {
                $query->where('subject_type', ProjectDocument::class)
                    ->whereIn('subject_id', $project->documents()->withTrashed()->pluck('id'));
            })
            ->orWhere(function ($query) use ($project) {
                $query->where('subject_type', ProjectDeliverable::class)
                    ->whereIn('subject_id', $project->deliverables()->withTrashed()->pluck('id'));
            })
            ->with(['causer', 'subject' => fn($q) => $q->withTrashed()])
            ->latest()
            ->paginate(20);

        $activities->through(fn($activity) => [
            'id'          => $activity->id,
            'event'       => $activity->event,
            'log_name'    => $activity->log_name,
            'description' => ActivityHelper::describe($activity),
            'properties'  => $activity->properties,
            'causer'      => $activity->causer?->only('id', 'name'),
            'created_at'  => $activity->created_at,
        ]);

        return Inertia::render('projects/detail/index', [
            'project'    => $project,
            'tab'        => 'activities',
            'activities' => $activities,
        ]);
    }

    public function documents(Project $project)
    {
        $project->load(['documents', 'documents.uploader', 'documents.verifier']);

        $canApproveDocuments = $project->members()
            ->where('user_id', Auth::id())
            ->where('can_approve_documents', true)
            ->exists();

        return Inertia::render('projects/detail/index', [
            'project' => $project,
            'tab'     => 'documents',
            'can_approve_documents' => $canApproveDocuments,
        ]);
    }

    public function deliverables(Project $project)
    {
        $project->load([
            'deliverables',
            'deliverables.uploader',
        ]);

        return Inertia::render('projects/detail/index', [
            'project' => $project,
            'tab'     => 'deliverables',
        ]);
    }

    public function discussions(Project $project)
    {
        $project->load([
            'comments' => fn($q) => $q
                ->whereNull('parent_id')
                ->with(['user', 'replies' => fn($q) => $q->with('user')->withTrashed()])
                ->withTrashed()
                ->latest(),
            'members.user',
        ]);

        return Inertia::render('projects/detail/index', [
            'project' => $project,
            'tab'     => 'discussions',
        ]);
    }

    public function tasks(Project $project)
    {
        $project->load([
            'tasks' => fn($q) => $q->with(['assignee', 'milestone'])->orderBy('sort_order'),
            'milestones',
            'members.user',
        ]);

        return Inertia::render('projects/detail/index', [
            'project' => $project,
            'tab'     => 'tasks',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRequest $request, Project $project)
    {
        $validated =  $request->validated();

        $project->update($validated);

        return back()->with('success', 'Project berhasil diperbarui.');
    }

    /**
     * Update the specified project status.
     */
    public function updateStatus(Project $project)
    {
        request()->validate([
            'status' => 'required|in:planning,in_progress,on_hold,completed,cancelled',
        ], [
            'status.required' => 'Status wajib dipilih.',
            'status.in' => 'Status yang dipilih tidak valid.',
        ]);

        $status = request('status');

        $data = ['status' => $status];

        match ($status) {
            'in_progress' => $data['actual_start_date'] = now()->toDateString(),
            'completed'   => $data['actual_end_date']   = now()->toDateString(),
            'planning' => $data = array_merge($data, [
                'actual_start_date' => null,
                'actual_end_date'   => null,
            ]),
            default => null,
        };

        $project->update($data);

        return back()->with('success', 'Status project berhasil diperbarui.');
    }

    /**
     * Remove the specified project.
     */
    public function destroy(Project $project)
    {
        $project->delete();

        return back()->with('success', 'Project berhasil dihapus.');
    }

    /**
     * Copy template milestones and documents to project.
     */
    private function copyTemplateToProject(Project $project, ProjectTemplate $template)
    {
        $startDate = Carbon::parse($project->start_date);

        // Copy Milestones
        if (is_array($template->milestones)) {
            foreach ($template->milestones as $milestoneData) {
                $dayOffset = (int) ($milestoneData['day_offset'] ?? 0);
                $estimatedDuration = (int) ($milestoneData['estimated_duration_days'] ?? 1);

                $milestoneStartDate = $startDate->copy()->addDays($dayOffset);
                $milestoneEndDate = $milestoneStartDate->copy()->addDays($estimatedDuration);

                $project->milestones()->create([
                    'title' => $milestoneData['title'],
                    'description' => $milestoneData['description'] ?? null,
                    'estimated_duration_days' => $estimatedDuration,
                    'start_date' => $milestoneStartDate,
                    'planned_end_date' => $milestoneEndDate,
                    'status' => 'not_started',
                    'sort_order' => $milestoneData['sort_order'] ?? 0,
                ]);
            }
        }

        // Copy Documents
        if (is_array($template->documents)) {
            foreach ($template->documents as $documentData) {
                $project->documents()->create([
                    'name' => $documentData['name'],
                    'description' => $documentData['description'] ?? null,
                    'document_format' => $documentData['document_format'] ?? null,
                    'is_required' => $documentData['is_required'] ?? true,
                    'notes' => $documentData['notes'] ?? null,
                    'status' => 'not_uploaded',
                    'sort_order' => $documentData['sort_order'] ?? 0,
                ]);
            }
        }
    }
}
