<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Customer;
use App\Models\Project;
use App\Models\ProjectTemplate;
use App\Models\Quote;
use App\Models\Service;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function searchCustomers(Request $request)
    {
        $search = $request->get('search', '');
        $companyId = $request->get('company_id');

        $query = Customer::with('user');

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

    public function searchCompanies(Request $request)
    {
        $search = $request->get('search', '');

        $query = Company::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $companies = $query->select('id', 'name', 'email', 'phone')
            ->limit(10)
            ->get();

        return response()->json([
            'companies' => $companies,
        ]);
    }

    public function searchCompaniesByCustomerId(Customer $customer)
    {
        $companies = $customer->companies()
            ->select('companies.id', 'companies.name', 'companies.email', 'companies.phone')
            ->limit(10)
            ->get();

        return response()->json([
            'companies' => $companies,
        ]);
    }

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

    public function searchUsersStaff(Request $request)
    {
        $search = $request->get('search', '');
        $projectId = $request->get('project_id');

        $query = User::where('role', '!=', 'user');

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

    public function seachProjects(Request $request)
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

    public function searchVendors(Request $request)
    {
        $search = $request->get('search', '');

        $vendors = Vendor::active()
            ->search($search)
            ->limit(10)
            ->get();

        return response()->json([
            'vendors' => $vendors
        ]);
    }

    public function searchQuotes(Request $request)
    {
        $search = $request->get('search', '');

        $quotes = Quote::with(['user:id,name', 'service:id,name'])
            ->when($search, fn($q) => $q->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                    ->orWhere('project_name', 'like', "%{$search}%");
            }))
            ->limit(10)
            ->get(['id', 'reference_number', 'project_name', 'status', 'user_id', 'service_id']);

        return response()->json(['quotes' => $quotes]);
    }
}
