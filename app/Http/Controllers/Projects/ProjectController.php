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
use App\Models\Quote;
use App\Models\Service;
use App\Notifications\Client\NewProjectNotification;
use App\Notifications\Client\ProjectCompletedNotification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search     = $request->get('search');
        $status     = $request->get('status');
        $customerId = $request->get('customer_id');
        $companyId  = $request->get('company_id');
        $serviceId  = $request->get('service_id');

        $projects = Project::query()
            ->with(
                'customer:id,name,tier',
                'company:id,name',
                'service:id,name',
                'servicePackage:id,name',
                'projectLeaders:id,name'
            )
            ->when($search, fn($q) => $q->search($search))
            ->when($status, fn($q) => $q->where('status', $status))
            ->when($customerId, fn($q) => $q->where('customer_id', $customerId))
            ->when($companyId, fn($q) => $q->where('company_id', $companyId))
            ->when($serviceId, fn($q) => $q->where('service_id', $serviceId))
            ->latest()
            ->paginate($perPage)
            ->through(fn($project) => $project->append([
                'progress_percentage',
                'project_leader'
            ]));

        $customers = Customer::select('id', 'name')->get();
        $companies = Company::select('id', 'name')->get();
        $services  = Service::select('id', 'name')->get();

        $statusCounts = Project::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $summary = [
            'total'       => Project::count(),
            'planning'    => (int) ($statusCounts['planning'] ?? 0),
            'in_progress' => (int) ($statusCounts['in_progress'] ?? 0),
            'on_hold'     => (int) ($statusCounts['on_hold'] ?? 0),
            'completed'   => (int) ($statusCounts['completed'] ?? 0),
            'cancelled'   => (int) ($statusCounts['cancelled'] ?? 0),
        ];

        return Inertia::render('projects/index', [
            'projects'  => $projects,
            'summary'   => $summary,
            'customers' => $customers,
            'companies' => $companies,
            'services'  => $services,
            'filters' => [
                'search'      => $search,
                'per_page'    => $perPage,
                'status'      => $status,
                'customer_id' => $customerId,
                'company_id'  => $companyId,
                'service_id'  => $serviceId,
            ],
        ]);
    }

    public function create()
    {
        $services = Service::where('status', 'active')
            ->where('is_published', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('projects/create/index', [
            'services' => $services,
        ]);
    }

    /**
     * Store a newly created project.
     *
     * Uses StoreRequest for validation and wraps the entire
     * creation process in a database transaction to ensure data consistency.
     *
     * Workflow:
     * 1. If no customer_id is provided (usually from the quote conversion flow),
     *    a new customer will be created inline using the provided customer data.
     *    The related quote will also be updated with the new customer.
     *
     * 2. Resolves the company based on the selected company_mode:
     *    - 'search' : attaches an existing company
     *    - 'create' : creates a new company record
     *    - 'none'   : no company will be attached
     *
     * 3. If a company exists, the customer will be attached to the company
     *    (if not already attached) and marked as the primary customer.
     *
     * 4. Creates the project record using the validated data.
     *
     * 5. If a project_template_id is provided:
     *    - Copies milestones from the template
     *    - Copies required documents from the template
     *    - Automatically calculates milestone start and end dates
     *
     * 6. If the project is created from a quote conversion flow,
     *    the quote will be marked as converted.
     */
    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        $project = DB::transaction(function () use ($validated) {

            $quote = !empty($validated['quote_id'])
                ? Quote::find($validated['quote_id'])
                : null;

            // 1. Create customer if not exists
            if (empty($validated['customer_id'])) {

                $customer = Customer::create([
                    'user_id' => $quote?->user_id,
                    'name'    => $validated['customer_name'],
                    'email'   => $validated['customer_email'],
                    'phone'   => $validated['customer_phone'],
                    'tier'    => $validated['customer_tier'] ?? 'bronze',
                    'status'  => 'active',
                    'notes'   => $validated['customer_notes'] ?? null,
                ]);

                $validated['customer_id'] = $customer->id;

                if ($quote) {
                    $quote->update([
                        'customer_id' => $customer->id
                    ]);
                }
            }

            // 2. Resolve company
            $company = null;
            $companyMode = $validated['company_mode'] ?? 'none';

            if (!empty($validated['company_id'])) {
                $company = Company::find($validated['company_id']);
            }

            if ($companyMode === 'create') {
                $company = Company::create([
                    'name'              => $validated['company_name'],
                    'phone'             => $validated['company_phone'] ?? null,
                    'email'             => $validated['company_email'] ?? null,
                    'website'           => $validated['company_website'] ?? null,
                    'address'           => $validated['company_address'] ?? null,
                    'city'              => $validated['company_city'] ?? null,
                    'province'          => $validated['company_province'] ?? null,
                    'postal_code'       => $validated['company_postal_code'] ?? null,
                    'npwp'              => $validated['company_npwp'] ?? null,
                    'status_legal'      => $validated['company_status_legal'],
                    'category_business' => $validated['company_category_business'],
                    'notes'             => $validated['company_notes'] ?? null,
                ]);
            }

            // 3. Attach customer to company
            if ($company && !$company->customers()->where('customer_id', $validated['customer_id'])->exists()) {
                $company->customers()->attach($validated['customer_id'], ['is_primary' => true]);
            }

            // 4. Create project
            $project = Project::create([
                'customer_id'        => $validated['customer_id'],
                'company_id'         => $company?->id,
                'service_id'         => $validated['service_id'] ?? null,
                'service_package_id' => $validated['service_package_id'] ?? null,
                'name'               => $validated['name'],
                'description'        => $validated['description'] ?? null,
                'budget'             => $validated['budget'],
                'start_date'         => $validated['start_date'],
                'planned_end_date'   => $validated['planned_end_date'],
                'status'             => $validated['status'] ?? 'planning',
            ]);

            // 5. Copy template
            if (!empty($validated['project_template_id'])) {
                $template = ProjectTemplate::find($validated['project_template_id']);
                if ($template) {
                    $this->copyTemplateToProject($project, $template);
                }
            }

            // 6. Mark quote converted
            if ($quote && $quote->is_convertible) {
                $quote->markAsConverted($project->id);
            }

            return $project;
        });

        $project->loadMissing(['customer.user']);

        if ($project->customer?->user) {
            $project->customer->user->notify(new NewProjectNotification($project));
        }

        if (!empty($validated['quote_id'])) {
            return to_route('projects.show', $project)
                ->with('success', 'Quote berhasil dikonversi menjadi project.');
        }

        return to_route('projects.index')
            ->with('success', 'Project berhasil ditambahkan.');
    }

    public function show(Project $project)
    {
        $project->load(['customer.companies', 'customer.user', 'company', 'service.category',  'servicePackage']);

        $services = Service::where('status', 'active')
            ->where('is_published', true)
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

    public function update(UpdateRequest $request, Project $project)
    {
        $validated =  $request->validated();

        $project->update($validated);

        return back()->with('success', 'Project berhasil diperbarui.');
    }

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

        if ($status === 'completed') {
            $project->loadMissing(['customer.user']);
            
            if ($project->customer?->user) {
                $project->customer->user->notify(new ProjectCompletedNotification($project));
            }
        }


        return back()->with('success', 'Status project berhasil diperbarui.');
    }

    public function destroy(Project $project)
    {
        $project->delete();

        if ($project->invoices()->exists()) {
            return back()->withErrors([
                'error' => 'Project tidak dapat dihapus karena sudah memiliki invoice.'
            ]);
        }

        return back()->with('success', 'Project berhasil dihapus.');
    }

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
