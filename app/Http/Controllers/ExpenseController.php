<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Http\Requests\Expenses\StoreRequest;
use App\Http\Requests\Expenses\UpdateRequest;
use App\Models\Expense;
use App\Models\Project;
use Illuminate\Support\Facades\Auth;

class ExpenseController extends Controller
{
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
            'user_id' => Auth::id(),
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
