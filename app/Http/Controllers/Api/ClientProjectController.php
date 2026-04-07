<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClientProjectController extends Controller
{
    public function index(Request $request)
    {
        $customerId = Auth::user()->customer?->id;

        if (! $customerId) {
            return ApiResponse::success([]);
        }

        $projects = Project::query()
            ->where('customer_id', $customerId)
            ->with([
                'service:id,name,slug',
                'servicePackage:id,name',
                'company:id,name',
            ])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->latest()
            ->get();

        $projects->each(
            fn (Project $project) => $project->append([
                'progress_percentage',
            ])
        );

        return ApiResponse::success($projects);
    }

    public function show(Project $project)
    {
        $project->load([
            'service',
            'servicePackage',
            'company',
            'documents' => fn ($q) => $q->orderBy('sort_order'),
            'milestones' => fn ($q) => $q->orderBy('sort_order'),
            'deliverables',
        ]);

        $project->append([
            'progress_percentage',
        ]);

        return ApiResponse::success($project);
    }
}
