<?php

namespace App\Http\Controllers\Projects;

use App\Helpers\FileHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Projects\Invoices\StoreRequest;
use App\Http\Requests\Projects\Invoices\UpdateRequest;
use App\Models\Expense;
use App\Models\Project;
use App\Models\ProjectInvoice;
use App\Models\ProjectInvoiceItem;
use App\Models\SiteSetting;
use App\Services\Pdf\InvoicePdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProjectInvoiceController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search  = $request->get('search');
        $status  = $request->get('status');
        $type    = $request->get('type');
        $source  = $request->get('source');

        $invoices = ProjectInvoice::with([
            'project:id,name,status,customer_id',
            'project.customer:id,name,tier',
            'customer:id,name,tier',
            'items',
            'payments',
        ])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('invoice_number', 'like', "%{$search}%")
                        ->orWhereHas('project', fn($q) => $q->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('customer', fn($q) => $q->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($status, fn($q, $status) => $q->where('status', $status))
            ->when($type,   fn($q, $type)   => $q->where('type', $type))
            ->when($source === 'project',  fn($q) => $q->whereNotNull('project_id'))
            ->when($source === 'customer', fn($q) => $q->whereNull('project_id')->whereNotNull('customer_id'))
            ->latest()
            ->paginate($perPage);

        $summary = ProjectInvoice::query()
            ->selectRaw("
                COUNT(*) as total,
                COALESCE(SUM(CASE WHEN status = 'draft'     THEN 1 ELSE 0 END), 0) as draft,
                COALESCE(SUM(CASE WHEN status = 'sent'      THEN 1 ELSE 0 END), 0) as sent,
                COALESCE(SUM(CASE WHEN status = 'paid'      THEN 1 ELSE 0 END), 0) as paid,
                COALESCE(SUM(CASE WHEN status = 'overdue'   THEN 1 ELSE 0 END), 0) as overdue,
                COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) as cancelled,
                COALESCE(SUM(total_amount), 0) as total_amount,
                COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as paid_amount
            ")
            ->first();

        return Inertia::render('finances/invoices/index', [
            'invoices' => $invoices,
            'summary'  => $summary,
            'filters'  => [
                'search'   => $search,
                'per_page' => $perPage,
                'status'   => $status,
                'type'     => $type,
                'source'   => $source,
            ],
        ]);
    }

    public function show(ProjectInvoice $invoice)
    {
        $invoice->load(['project.customer', 'project.company', 'customer', 'items']);

        return Inertia::render('finances/invoices/detail/index', [
            'invoice' => $invoice,
            'settings' => SiteSetting::get(),
        ]);
    }

    public function create(Request $request)
    {
        $selectedProject = null;
        if ($request->filled('project_id')) {
            $selectedProject = Project::with('customer')
                ->find($request->project_id, ['id', 'name', 'customer_id', 'budget', 'status']);
        }

        $fromProject = $request->filled('project_id');

        return Inertia::render('finances/invoices/create/index', [
            'selectedProject' => $selectedProject,
            'fromProject'     => $fromProject,
        ]);
    }

    public function store(StoreRequest $request)
    {
        $validated    = $request->validated();
        $fromProject  = $request->boolean('from_project');

        if ($fromProject) {
            $project = Project::find($validated['project_id']);
            if (!$project) {
                return back()->withErrors(['error' => 'Project tidak ditemukan.']);
            }
        }

        $invoice = DB::transaction(function () use ($validated, $fromProject) {
            $invoice = ProjectInvoice::create([
                'invoice_number'       => ProjectInvoice::generateInvoiceNumber(),
                'project_id'           => $validated['project_id'] ?? null,
                'customer_id'          => $fromProject ? null : ($validated['customer_id'] ?? null),
                'type'                 => $validated['type'],
                'invoice_date'         => $validated['invoice_date'],
                'due_date'             => $validated['due_date'],
                'notes'                => $validated['notes'] ?? null,
                'payment_instructions' => $validated['payment_instructions'] ?? null,
                'percentage'           => $validated['percentage'] ?? null,
                'subtotal'             => $validated['type'] !== 'additional' ? $validated['subtotal'] : 0,
                'tax_percent'          => $validated['tax_percent'] ?? 0,
                'discount_percent'     => $validated['discount_percent'] ?? 0,
                'tax_amount'           => 0,
                'discount_amount'      => 0,
                'total_amount'         => 0,
                'status'               => 'draft',
            ]);

            $this->syncItems($invoice, $validated);
            $invoice->calculateTotals();

            if ($invoice->type === 'additional' && !empty($validated['items'])) {
                $expenseIds = collect($validated['items'])
                    ->pluck('expense_id')->filter()->values()->toArray();

                if (!empty($expenseIds)) {
                    Expense::where('project_id', $invoice->project_id)
                        ->where('is_billable', true)
                        ->whereNull('invoice_id')
                        ->whereIn('id', $expenseIds)
                        ->update(['invoice_id' => $invoice->id]);
                }
            }

            return $invoice;
        });

        try {
            $filePath = app(InvoicePdfService::class)->generate($invoice);
            $invoice->update(['file_path' => $filePath]);
        } catch (\Exception $e) {
            Log::error('Invoice PDF generation failed', [
                'invoice_id' => $invoice->id,
                'error'      => $e->getMessage(),
            ]);

            return back()->withErrors(['error' => 'Gagal membuat invoice.']);
        }

        if ($fromProject) {
            return redirect()->route('projects.finance', $invoice->project_id)
                ->with('success', 'Invoice berhasil ditambahkan.');
        }

        return redirect()->route('finances.invoices.index')
            ->with('success', 'Invoice berhasil dibuat.');
    }

    public function edit(Request $request, ProjectInvoice $invoice)
    {
        $invoice->load(['project.customer', 'customer', 'items']);

        $fromProject = $request->filled('project_id');

        return Inertia::render('finances/invoices/edit/index', [
            'invoice'         => $invoice,
            'selectedProject' => $invoice->project,
            'selectedCustomer' => $invoice->customer,
            'fromProject'     => $fromProject,
            'isEdit'          => true,
        ]);
    }

    public function update(UpdateRequest $request, ProjectInvoice $invoice)
    {
        if ($error = $this->validateNotPaid($invoice)) return $error;

        $validated = $request->validated();

        DB::transaction(function () use ($invoice, $validated) {
            $invoice->update([
                'invoice_number'       => $validated['invoice_number'] ?? $invoice->invoice_number,
                'type'                 => $validated['type'],
                'invoice_date'         => $validated['invoice_date'],
                'due_date'             => $validated['due_date'],
                'notes'                => $validated['notes'] ?? null,
                'payment_instructions' => $validated['payment_instructions'] ?? null,
                'percentage'           => $validated['percentage'] ?? null,
                'subtotal'             => $validated['type'] !== 'additional' ? $validated['subtotal'] : 0,
                'tax_percent'          => $validated['tax_percent'] ?? 0,
                'discount_percent'     => $validated['discount_percent'] ?? 0,
                'status'               => $validated['status'] ?? $invoice->status,
            ]);

            $this->syncItems($invoice, $validated);
            $invoice->refresh()->calculateTotals();

            if ($invoice->type === 'additional') {
                Expense::where('invoice_id', $invoice->id)->update(['invoice_id' => null]);

                $expenseIds = collect($validated['items'] ?? [])
                    ->pluck('expense_id')->filter()->values()->toArray();

                if (!empty($expenseIds)) {
                    Expense::where('project_id', $invoice->project_id)
                        ->where('is_billable', true)
                        ->whereNull('invoice_id')
                        ->whereIn('id', $expenseIds)
                        ->update(['invoice_id' => $invoice->id]);
                }
            }
        });

        try {
            $pdfService = app(InvoicePdfService::class);
            $pdfService->delete($invoice);
            $filePath = $pdfService->generate($invoice->fresh());
            $invoice->update(['file_path' => $filePath]);
        } catch (\Exception $e) {
            Log::error('Invoice PDF regeneration failed', [
                'invoice_id' => $invoice->id,
                'error'      => $e->getMessage(),
            ]);

            return back()->withErrors(['error' => 'Gagal memperbarui invoice.']);
        }

        if ($request->boolean('from_project')) {
            return redirect()->route('projects.finance', $invoice->project_id)
                ->with('success', 'Invoice berhasil diperbarui.');
        }

        return redirect()->route('finances.invoices.index')
            ->with('success', 'Invoice berhasil diperbarui.');
    }

    public function updateStatus(Request $request, ProjectInvoice $invoice)
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,sent,paid,overdue,cancelled',
        ], [
            'status.required' => 'Status wajib dipilih.',
            'status.in' => 'Status yang dipilih tidak valid.',
        ]);

        $status = $validated['status'];

        if ($status === 'cancelled' && $invoice->isPaid()) {
            return back()->withErrors(['error' => 'Invoice yang sudah dibayar tidak dapat dibatalkan.']);
        }

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

    public function destroy(ProjectInvoice $invoice)
    {
        if ($error = $this->validateNotPaid($invoice)) return $error;

        if ($invoice->payments()->exists()) {
            return back()->withErrors([
                'error' => 'Invoice tidak dapat dihapus karena sudah memiliki pembayaran.'
            ]);
        }

        $invoice->delete();

        return back()->with('success', 'Invoice berhasil dihapus.');
    }

    // Tambahkan method ini di ProjectInvoiceController

    public function regeneratePdf(ProjectInvoice $invoice)
    {
        try {
            $pdfService = app(InvoicePdfService::class);

            $pdfService->delete($invoice);

            $filePath = $pdfService->generate($invoice->fresh());
            $invoice->update(['file_path' => $filePath]);

            return back()->with('success', 'PDF invoice berhasil di-generate ulang.');
        } catch (\Exception $e) {
            Log::error('Invoice PDF manual regeneration failed', [
                'invoice_id' => $invoice->id,
                'error'      => $e->getMessage(),
            ]);

            return back()->withErrors(['error' => 'Gagal generate PDF: ' . $e->getMessage()]);
        }
    }

    public function download(ProjectInvoice $invoice)
    {
        $content = FileHelper::downloadFromR2Public($invoice->file_path);
        $filename = 'invoice-' . $invoice->invoice_number . '.pdf';

        return response($content, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

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
                'expense_id'       => $itemData['expense_id'] ?? null,
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
