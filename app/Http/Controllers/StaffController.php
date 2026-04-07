<?php

namespace App\Http\Controllers;

use App\Helpers\PhoneHelper;
use App\Http\Requests\Staff\StoreRequest;
use App\Http\Requests\Staff\UpdateRequest;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\ProjectTask;
use App\Models\StaffProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');
        $availability = $request->get('availability_status');
        $status = $request->get('status');

        $staffQuery = User::query()
            ->with('staffProfile')
            ->withCount([
                'projects as active_projects_count' => fn ($q) => $q->whereIn('status', ['planning', 'in_progress', 'on_hold']),
            ])
            ->whereHas('roles', fn ($q) => $q->where('name', '!=', 'user'));

        $staffList = $staffQuery
            ->when($search, fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            }))
            ->when($availability, fn ($q) => $q->whereHas('staffProfile', fn ($qp) => $qp->where('availability_status', $availability)))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->latest()
            ->paginate($perPage);

        $baseQuery = User::whereHas('roles', fn ($q) => $q->where('name', '!=', 'user'));

        $summary = [
            'total' => (clone $baseQuery)->count(),
            'available' => (clone $baseQuery)->whereHas('staffProfile', fn ($q) => $q->where('availability_status', 'available'))->count(),
            'busy' => (clone $baseQuery)->whereHas('staffProfile', fn ($q) => $q->where('availability_status', 'busy'))->count(),
            'on_leave' => (clone $baseQuery)->whereHas('staffProfile', fn ($q) => $q->where('availability_status', 'on_leave'))->count(),
        ];

        $roles = Role::query()
            ->where('name', '!=', 'user')
            ->latest()
            ->get();

        return Inertia::render('staff/index', [
            'staffList' => $staffList,
            'summary' => $summary,
            'roles' => $roles,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
                'availability_status' => $availability,
                'status' => $status,
            ],
        ]);
    }

    public function create()
    {
        return redirect()->route('staff.index');
    }

    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => PhoneHelper::format($validated['phone']),
                'role' => $validated['role'],
                'password' => Hash::make($validated['password']),
            ]);

            $user->assignRole($validated['role']);

            $skills = null;
            if (! empty($validated['skills'])) {
                $skills = array_values(array_filter(array_map('trim', explode(',', $validated['skills']))));
            }

            StaffProfile::create([
                'user_id' => $user->id,
                'position' => $validated['position'] ?? null,
                'bio' => $validated['bio'] ?? null,
                'max_concurrent_projects' => $validated['max_concurrent_projects'] ?? 5,
                'availability_status' => $validated['availability_status'] ?? 'available',
                'skills' => $skills,
                'leave_start_date' => $validated['leave_start_date'] ?? null,
                'leave_end_date' => $validated['leave_end_date'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'daily_token_limit' => $validated['daily_token_limit'] ?? 0,
            ]);
        });

        return back()->with('success', 'Staff berhasil ditambahkan.');
    }

    public function edit(User $staff)
    {
        return redirect()->route('staff.index');
    }

    public function update(UpdateRequest $request, User $staff)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $staff) {
            $userUpdate = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => PhoneHelper::format($validated['phone']),
                'role' => $validated['role'],
                'status' => $validated['status'] ?? 'active',
            ];

            if (! empty($validated['password'])) {
                $userUpdate['password'] = Hash::make($validated['password']);
            }

            $staff->update($userUpdate);

            if (! empty($validated['role'])) {
                $staff->syncRoles([$validated['role']]);
            }

            $skills = null;
            if (! empty($validated['skills'])) {
                $skills = array_values(array_filter(array_map('trim', explode(',', $validated['skills']))));
            }

            $staff->staffProfile()->updateOrCreate(
                ['user_id' => $staff->id],
                [
                    'position' => $validated['position'] ?? null,
                    'bio' => $validated['bio'] ?? null,
                    'max_concurrent_projects' => $validated['max_concurrent_projects'] ?? 5,
                    'availability_status' => $validated['availability_status'] ?? 'available',
                    'skills' => $skills,
                    'leave_start_date' => $validated['leave_start_date'] ?? null,
                    'leave_end_date' => $validated['leave_end_date'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                    'daily_token_limit' => $validated['daily_token_limit'] ?? 0,
                ]
            );
        });

        return back()->with('success', 'Data staff berhasil diperbarui.');
    }

    public function destroy(User $staff)
    {
        $staff->delete();

        return back()->with('success', 'Staff berhasil dihapus.');
    }

    public function myProjects(Request $request, User $staff)
    {
        if (Auth::id() !== $staff->id) {
            abort(403);
        }

        $projectIds = ProjectMember::where('user_id', $staff->id)->pluck('project_id');

        $myProjects = Project::whereIn('id', $projectIds)
            ->with(['customer:id,name', 'service:id,name'])
            ->withCount(['tasks', 'members'])
            ->latest()
            ->paginate(12)
            ->through(fn ($project) => $project->append([
                'progress_percentage',
            ]));

        return Inertia::render('staff/my-projects/index', [
            'staff' => $staff->only('id', 'name'),
            'myProjects' => $myProjects,
        ]);
    }

    public function myTasks(Request $request, User $staff)
    {
        if (Auth::id() !== $staff->id) {
            abort(403);
        }

        $tasks = ProjectTask::where('assigned_to', $staff->id)
            ->with([
                'project:id,name',
                'milestone:id,title',
                'assignee:id,name,avatar',
            ])
            ->orderByRaw("FIELD(status, 'in_progress', 'review', 'todo', 'completed', 'cancelled')")
            ->orderBy('due_date', 'asc')
            ->get();

        return Inertia::render('staff/my-tasks/index', [
            'staff' => $staff->only('id', 'name'),
            'tasks' => $tasks,
        ]);
    }
}
