<?php

namespace App\Http\Controllers\Finances;

use App\Helpers\FileHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Finances\Proposals\StoreRequest;
use App\Http\Requests\Finances\Proposals\UpdateRequest;
use App\Models\Proposal;
use App\Models\ProposalItem;
use App\Models\SiteSetting;
use App\Services\Pdf\ProposalPdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProposalController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');
        $status = $request->get('status');

        $proposals = Proposal::query()
            ->with(['customer:id,name', 'items'])
            ->withCount('estimates')
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('proposal_number', 'like', "%{$search}%")
                        ->orWhereHas('customer', fn($q) => $q->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($status, fn($q) => $q->where('status', $status))
            ->latest()
            ->paginate($perPage);

        $summary = Proposal::query()
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status = 'draft'    THEN 1 ELSE 0 END) as draft,
                SUM(CASE WHEN status = 'sent'     THEN 1 ELSE 0 END) as sent,
                SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                SUM(total_amount) as total_amount,
                SUM(CASE WHEN status = 'accepted' THEN total_amount ELSE 0 END) as accepted_amount
            ")
            ->first();

        return Inertia::render('finances/proposals/index', [
            'proposals' => $proposals,
            'summary'   => $summary,
            'filters'   => [
                'search'   => $search,
                'per_page' => $perPage,
                'status'   => $status,
            ],
        ]);
    }

    public function show(Proposal $proposal)
    {
        $proposal->load(['customer', 'items']);

        return Inertia::render('finances/proposals/detail/index', [
            'proposal' => $proposal,
            'settings' => SiteSetting::get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('finances/proposals/create/index');
    }

    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        $proposal = DB::transaction(function () use ($validated) {
            $proposal = Proposal::create([
                'proposal_number'  => Proposal::generateProposalNumber(),
                'customer_id'      => $validated['customer_id'],
                'project_name'     => $validated['project_name'],
                'subtotal'         => 0,
                'tax_percent'      => $validated['tax_percent'] ?? 0,
                'tax_amount'       => 0,
                'discount_percent' => $validated['discount_percent'] ?? 0,
                'discount_amount'  => 0,
                'total_amount'     => 0,
                'proposal_date'    => $validated['proposal_date'],
                'valid_until'      => $validated['valid_until'] ?? null,
                'status'           => 'draft',
                'notes'            => $validated['notes'] ?? null,
            ]);

            $this->syncItems($proposal, $validated);
            $proposal->calculateTotals();

            return $proposal;
        });

        try {
            $filePath = app(ProposalPdfService::class)->generate($proposal);
            $proposal->update(['file_path' => $filePath]);
        } catch (\Exception $e) {
            Log::error('Proposal PDF generation failed', [
                'proposal_id' => $proposal->id,
                'error'       => $e->getMessage(),
            ]);
        }

        return redirect()->route('finances.proposals.index')
            ->with('success', 'Proposal berhasil dibuat.');
    }

    public function edit(Proposal $proposal)
    {
        $proposal->load(['items', 'customer:id,name,tier,email,phone']);

        Log::info('proposal', $proposal->toArray());

        return Inertia::render('finances/proposals/edit/index', [
            'proposal'         => $proposal,
            'selectedCustomer' => $proposal->customer,
            'isEdit'           => true,
        ]);
    }

    public function update(UpdateRequest $request, Proposal $proposal)
    {
        if ($error = $this->validateNotAccepted($proposal)) return $error;

        DB::transaction(function () use ($proposal, $request) {
            $validated = $request->validated();

            $proposal->update([
                'project_name'     => $validated['project_name'],
                'proposal_date'    => $validated['proposal_date'],
                'valid_until'      => $validated['valid_until'] ?? null,
                'tax_percent'      => $validated['tax_percent'] ?? 0,
                'discount_percent' => $validated['discount_percent'] ?? 0,
                'status'           => $validated['status'] ?? $proposal->status,
                'notes'            => $validated['notes'] ?? null,
            ]);

            $this->syncItems($proposal, $validated);
            $proposal->refresh()->calculateTotals();
        });

        try {
            $pdfService = app(ProposalPdfService::class);
            $pdfService->delete($proposal);
            $filePath = $pdfService->generate($proposal->fresh());
            $proposal->update(['file_path' => $filePath]);
        } catch (\Exception $e) {
            Log::error('Proposal PDF regeneration failed', [
                'proposal_id' => $proposal->id,
                'error'       => $e->getMessage(),
            ]);
        }

        return redirect()->route('finances.proposals.index')
            ->with('success', 'Proposal berhasil diperbarui.');
    }

    public function updateStatus(Request $request, Proposal $proposal)
    {
        if ($proposal->status === 'accepted') {
            return back()->withErrors(['error' => 'Proposal yang sudah diterima tidak dapat diubah.']);
        }

        $request->validate([
            'status'          => 'required|in:draft,sent,accepted,rejected',
            'rejected_reason' => 'required_if:status,rejected|nullable|string|max:500',
        ], [
            'status.required'             => 'Status wajib dipilih.',
            'status.in'                   => 'Status tidak valid.',
            'rejected_reason.required_if' => 'Alasan penolakan wajib diisi.',
        ]);

        match ($request->status) {
            'rejected' => $proposal->reject($request->rejected_reason),
            default    => $proposal->update([
                'status'          => $request->status,
                'rejected_reason' => null,
            ]),
        };

        $messages = [
            'draft'    => 'Proposal dikembalikan ke draft.',
            'sent'     => 'Proposal ditandai sudah dikirim.',
            'accepted' => 'Proposal berhasil diterima.',
            'rejected' => 'Proposal berhasil ditolak.',
        ];

        return back()->with('success', $messages[$request->status]);
    }

    public function destroy(Proposal $proposal)
    {
        if ($proposal->status === 'accepted') {
            return back()->withErrors(['error' => 'Proposal yang sudah diterima tidak dapat dihapus.']);
        }

        if ($proposal->estimates()->exists()) {
            return back()->withErrors(['error' => 'Proposal tidak dapat dihapus karena masih memiliki estimate.']);
        }

        $proposal->delete();

        return back()->with('success', 'Proposal berhasil dihapus.');
    }

    public function regeneratePdf(Proposal $proposal)
    {
        try {
            $pdfService = app(ProposalPdfService::class);
            $pdfService->delete($proposal);
            $filePath = $pdfService->generate($proposal->fresh());
            $proposal->update(['file_path' => $filePath]);

            return back()->with('success', 'PDF proposal berhasil di-generate ulang.');
        } catch (\Exception $e) {
            Log::error('Proposal PDF manual regeneration failed', [
                'proposal_id' => $proposal->id,
                'error'       => $e->getMessage(),
            ]);

            return back()->withErrors(['error' => 'Gagal generate PDF: ' . $e->getMessage()]);
        }
    }

    public function download(Proposal $proposal)
    {
        $content  = FileHelper::downloadFromR2Public($proposal->file_path);
        $filename = 'proposal-' . $proposal->proposal_number . '.pdf';

        return response($content, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    private function syncItems(Proposal $proposal, array $validated): void
    {
        $proposal->items()->delete();

        foreach ($validated['items'] ?? [] as $i => $itemData) {
            $amounts = ProposalItem::calculateAmounts(
                quantity: $itemData['quantity'],
                unitPrice: $itemData['unit_price'],
                taxPercent: $itemData['tax_percent'] ?? 0,
                discountPercent: $itemData['discount_percent'] ?? 0,
            );

            ProposalItem::create([
                'proposal_id'      => $proposal->id,
                'description'      => $itemData['description'],
                'quantity'         => $itemData['quantity'],
                'unit_price'       => $itemData['unit_price'],
                'tax_percent'      => $itemData['tax_percent'] ?? 0,
                'discount_percent' => $itemData['discount_percent'] ?? 0,
                'sort_order'       => $i,
                ...$amounts,
            ]);
        }
    }

    private function validateNotAccepted(Proposal $proposal)
    {
        if ($proposal->status === 'accepted') {
            return back()->withErrors([
                'error' => 'Proposal yang sudah diterima tidak dapat diubah.',
            ]);
        }

        return null;
    }
}
