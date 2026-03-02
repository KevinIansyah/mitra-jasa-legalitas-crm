<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Project;
use App\Models\ProjectTemplate;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Search customer
     */
    public function searchCustomer(Request $request)
    {
        $search = $request->get('search', '');
        $companyId = $request->get('company_id');

        $query = Customer::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($companyId) {
            $query->whereDoesntHave('companies', function ($q) use ($companyId) {
                $q->where('company_id', $companyId);
            });
        }

        $customers = $query->select('id', 'name', 'email', 'phone', 'tier')
            ->limit(10)
            ->get();

        return response()->json([
            'customers' => $customers,
        ]);
    }

    /**
     * Search company by customer id
     */
    public function searchCompanyByCustomerId(Customer $customer)
    {
        $companies = $customer->companies()
            ->select('companies.id', 'companies.name', 'companies.email', 'companies.phone')
            ->limit(10)
            ->get();

        return response()->json([
            'companies' => $companies,
        ]);
    }

    /**
     * Search packages by service id
     */
    public function searchPackagesByServiceId(Service $service)
    {
        $packages = $service->packages()
            ->select('service_packages.id', 'service_packages.name', 'service_packages.price')
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'packages' => $packages,
        ]);
    }

    /**
     * Search templates by service id
     */
    public function searchTemplatesByServiceId(Service $service)
    {
        $templates = ProjectTemplate::select('id', 'name')
            ->where('service_id', $service->id)
            ->where('status', 'active')
            ->orWhere('service_id', null)
            ->whereNull('deleted_at')
            ->orderBy('name')
            ->get();

        return response()->json([
            'templates' => $templates,
        ]);
    }

    /**
     * Search user staff
     */
    public function searchUserStaff(Request $request)
    {
        $search = $request->get('search', '');
        $projectId = $request->get('project_id');

        $query = User::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $query->whereDoesntHave('projects', function ($q) use ($projectId) {
            $q->where('project_id', $projectId);
        });

        $users = $query->select('id', 'name', 'email', 'role')
            ->limit(10)
            ->get();

        return response()->json([
            'users' => $users,
        ]);
    }

    /**
     * Search project
     */
    public function seachProject(Request $request)
    {
        $search = $request->get('search', '');

        $projects = Project::with('customer:id,name,tier')
            ->when($search, function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })
            ->limit(10)
            ->get();

        return response()->json([
            'projects' => $projects,
        ]);
    }
}
