<?php

namespace App\Http\Controllers;

use App\Http\Requests\Projects\Invoices\StoreRequest;
use App\Http\Requests\Projects\Invoices\UpdateRequest;
use App\Models\Expense;
use App\Models\Project;
use App\Models\ProjectInvoice;
use App\Models\ProjectInvoiceItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectInvoiceController extends Controller
{
    /**
     * List all invoices across all projects.
     */
    public function index()
    {
        $invoices = ProjectInvoice::with(['project.customer'])
            ->latest()
            ->paginate(20);

        return Inertia::render('finances/invoices/index', [
            'invoices' => $invoices,
        ]);
    }

    /**
     * Show the standalone create form.
     * Accepts ?project_id=X to pre-select a project.
     */
    public function create(Request $request)
    {
        $projects = Project::with('customer')
            ->orderBy('name')
            ->get(['id', 'name', 'customer_id', 'budget', 'status']);

        $selectedProject = null;
        if ($request->filled('project_id')) {
            $selectedProject = Project::with('customer')
                ->find($request->project_id, ['id', 'name', 'customer_id', 'budget', 'status']);
        }

        $fromProject = $request->filled('project_id');

        return Inertia::render('finances/invoices/create/index', [
            'projects'        => $projects,
            'selectedProject' => $selectedProject,
            'fromProject'     => $fromProject,
        ]);
    }

    /**
     * Show the standalone edit form.
     */
    public function edit(Request $request, ProjectInvoice $invoice)
    {
        $invoice->load(['project.customer', 'items']);

        $projects = Project::with('customer')
            ->orderBy('name')
            ->get(['id', 'name', 'customer_id', 'budget', 'status']);

        $fromProject = $request->filled('project_id');

        return Inertia::render('finances/invoices/edit/index', [
            'invoice'  => $invoice,
            'projects' => $projects,
            'fromProject' => $fromProject,
        ]);
    }

    /**
     * Store a newly created project invoice.
     */
    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        $project = Project::find($validated['project_id']);
        if (!$project) {
            return back()->withErrors(['project_id' => 'Project tidak ditemukan.']);
        }

        $invoice = $project->invoices()->create([
            'invoice_number'       => ProjectInvoice::generateInvoiceNumber(),
            'type'                 => $validated['type'],
            'invoice_date'         => $validated['invoice_date'],
            'due_date'             => $validated['due_date'],
            'notes'                => $validated['notes'] ?? null,
            'payment_instructions' => $validated['payment_instructions'] ?? null,
            'percentage'           => $validated['percentage'] ?? null,
            'amount'               => $validated['type'] !== 'additional' ? $validated['amount'] : 0,
            'tax_percent'          => $validated['tax_percent'] ?? 0,
            'discount_percent'     => $validated['discount_percent'] ?? 0,
            'tax_amount'           => 0,
            'discount_amount'      => 0,
            'total_amount'         => 0,
            'status'               => $validated['status'] ?? 'draft',
        ]);

        $this->syncItems($invoice, $validated);
        $invoice->calculateTotals();

        if ($invoice->type === 'additional' && !empty($validated['items'])) {
            $itemDescriptions = collect($validated['items'])->pluck('description');

            Expense::where('project_id', $invoice->project_id)
                ->where('is_billable', true)
                ->whereNull('invoice_id')
                ->whereIn('description', $itemDescriptions)
                ->update(['invoice_id' => $invoice->id]);
        }

        if ($request->boolean('from_project')) {
            return redirect()->route('projects.finance', $invoice->project_id)
                ->with('success', 'Invoice berhasil ditambahkan.');
        }

        return redirect()->route('invoices.index')
            ->with('success', 'Invoice berhasil dibuat.');
    }

    /**
     * Update the specified project invoice.
     */
    public function update(UpdateRequest $request, ProjectInvoice $invoice)
    {
        if ($error = $this->validateNotPaid($invoice)) return $error;

        $validated = $request->validated();

        $invoice->update([
            'invoice_number'       => $validated['invoice_number'] ?? $invoice->invoice_number,
            'type'                 => $validated['type'],
            'invoice_date'         => $validated['invoice_date'],
            'due_date'             => $validated['due_date'],
            'notes'                => $validated['notes'] ?? null,
            'payment_instructions' => $validated['payment_instructions'] ?? null,
            'percentage'           => $validated['percentage'] ?? null,
            'amount'               => $validated['type'] !== 'additional' ? $validated['amount'] : 0,
            'tax_percent'          => $validated['tax_percent'] ?? 0,
            'discount_percent'     => $validated['discount_percent'] ?? 0,
            'status'               => $validated['status'] ?? $invoice->status,
        ]);

        $this->syncItems($invoice, $validated);
        $invoice->refresh()->calculateTotals();

        if ($invoice->type === 'additional' && !empty($validated['items'])) {
            Expense::where('invoice_id', $invoice->id)
                ->update(['invoice_id' => null]);

            $itemDescriptions = collect($validated['items'])->pluck('description');

            Expense::where('project_id', $invoice->project_id)
                ->where('is_billable', true)
                ->whereNull('invoice_id')
                ->whereIn('description', $itemDescriptions)
                ->update(['invoice_id' => $invoice->id]);
        }

        if ($request->boolean('from_project')) {
            return redirect()->route('projects.finance', $invoice->project_id)
                ->with('success', 'Invoice berhasil ditambahkan.');
        }

        return redirect()->route('invoices.index')
            ->with('success', 'Invoice berhasil diperbarui.');
    }

    /**
     * Update the specified project invoice status.
     */
    public function updateStatus(Request $request, ProjectInvoice $invoice)
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,sent,paid,overdue,cancelled',
        ], [
            'status.required' => 'Status wajib dipilih.',
            'status.in' => 'Status yang dipilih tidak valid.',
        ]);

        $status = $validated['status'];

        $data = [
            'status' => $status,
            'paid_at' => match ($status) {
                'paid'  => now()->toDateString(),
                'overdue' => null,
                'cancelled' => null,
                'draft' => null,
                'sent' => null,
                default => $invoice->paid_at,
            }
        ];

        $invoice->update($data);

        return back()->with('success', 'Status invoice berhasil diperbarui.');
    }

    /**
     * Remove the specified project invoice.
     */
    public function destroy(ProjectInvoice $invoice)
    {
        if ($error = $this->validateNotPaid($invoice)) return $error;

        $invoice->delete();

        return back()->with('success', 'Invoice berhasil dihapus.');
    }

    /**
     * Sync invoice items (only for 'additional' type).
     */
    private function syncItems(ProjectInvoice $invoice, array $validated): void
    {
        if ($invoice->type !== 'additional') {
            $invoice->items()->delete();
            return;
        }

        $invoice->items()->delete();

        foreach ($validated['items'] ?? [] as $i => $itemData) {
            $item = new ProjectInvoiceItem([
                'invoice_id'       => $invoice->id,
                'description'      => $itemData['description'],
                'quantity'         => $itemData['quantity'],
                'unit_price'       => $itemData['unit_price'],
                'tax_percent'      => $itemData['tax_percent'] ?? 0,
                'discount_percent' => $itemData['discount_percent'] ?? 0,
                'sort_order'       => $i,
            ]);
            $item->calculateTotals();
            $item->save();
        }
    }

    /**
     * Validate invoice is not paid.
     */
    private function validateNotPaid(ProjectInvoice $invoice)
    {
        if ($invoice->isPaid()) {
            return back()->withErrors([
                'error' => 'Invoice yang sudah dibayar tidak dapat diubah.'
            ]);
        }

        return null;
    }
}
