<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Http\Requests\Expenses\StoreRequest;
use App\Http\Requests\Expenses\UpdateRequest;
use App\Models\Expense;
use App\Models\Project;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage  = $request->get('per_page', 20);
        $perPage  = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;
        $search   = $request->get('search');
        $category = $request->get('category');
        $billable = $request->get('is_billable');
        $billed   = $request->get('is_billed');

        $query = Expense::with([
            'project:id,name,customer_id,status',
            'project.customer:id,name',
            'invoice:id,invoice_number',
            'user:id,name,avatar',
            'vendor:id,name,category',
        ]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhereHas('project', fn($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        if ($category) $query->where('category', $category);

        if ($billable !== null) $query->where('is_billable', filter_var($billable, FILTER_VALIDATE_BOOLEAN));

        if ($billed === 'true')  $query->whereNotNull('invoice_id');

        if ($billed === 'false') $query->whereNull('invoice_id')->where('is_billable', true);

        $expenses = $query->latest('expense_date')->paginate($perPage);

        $vendors = Vendor::active()->orderBy('name')->get(['id', 'name', 'category']);

        $summary = Expense::query()
            ->selectRaw("
        COUNT(*) as total,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(SUM(CASE WHEN is_billable = 1 THEN amount ELSE 0 END), 0) as billable_amount,
        COALESCE(SUM(CASE WHEN is_billable = 1 AND invoice_id IS NOT NULL THEN amount ELSE 0 END), 0) as billed_amount,
        COALESCE(SUM(CASE WHEN is_billable = 1 AND invoice_id IS NULL THEN 1 ELSE 0 END), 0) as unbilled_count
    ")
            ->first();

        return Inertia::render('finances/expenses/index', [
            'expenses' => $expenses,
            'vendors'  => $vendors,
            'summary'  => $summary,
            'filters'  => [
                'search'      => $search,
                'per_page'    => $perPage,
                'category'    => $category,
                'is_billable' => $billable,
                'is_billed'   => $billed,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        $projectId = $validated['project_id'] ?? null;
        $directory = $projectId
            ? "projects/{$projectId}/expenses"
            : 'expenses/general';

        if ($request->hasFile('receipt_file')) {
            $fileData = FileHelper::uploadToR2($request->file('receipt_file'), $directory);
            $validated['receipt_file'] = $fileData['path'];
        }

        Expense::create([
            ...$validated,
            'user_id'     => Auth::id(),
            'vendor_id'   => $validated['vendor_id'] ?? null,
            'vendor_name' => $validated['vendor_name'] ?? null,
        ]);

        return back()->with('success', 'Pengeluaran berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRequest $request, Expense $expense)
    {
        $validated = $request->validated();
        unset($validated['remove_receipt_file']);

        $projectId = $expense->project_id ?? $validated['project_id'] ?? null;
        $directory = $projectId
            ? "projects/{$projectId}/expenses"
            : 'expenses/general';

        if ($request->hasFile('receipt_file')) {
            if ($expense->receipt_file) {
                FileHelper::deleteFromR2($expense->receipt_file);
            }
            $fileData = FileHelper::uploadToR2($request->file('receipt_file'), $directory);
            $validated['receipt_file'] = $fileData['path'];
        } elseif ($request->boolean('remove_receipt_file')) {
            if ($expense->receipt_file) {
                FileHelper::deleteFromR2($expense->receipt_file);
            }
            $validated['receipt_file'] = null;
        } else {
            unset($validated['receipt_file']);
        }

        $expense->update($validated);

        return back()->with('success', 'Pengeluaran berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Expense $expense)
    {
        if ($expense->receipt_file) {
            FileHelper::deleteFromR2($expense->receipt_file);
        }

        $expense->delete();

        return back()->with('success', 'Pengeluaran berhasil dihapus.');
    }

    /**
     * Get all unbilled expenses for a project.
     */
    public function unbilled(Project $project)
    {
        $expenses = $project->expenses()
            ->where('is_billable', true)
            ->whereNull('invoice_id')
            ->orderBy('expense_date', 'desc')
            ->get(['id', 'category', 'description', 'amount', 'expense_date']);

        return response()->json(['expenses' => $expenses]);
    }
}
