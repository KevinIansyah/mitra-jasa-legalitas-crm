<?php

namespace App\Http\Controllers\Finances;

use App\Helpers\FileHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Finances\Estimates\StoreRequest;
use App\Http\Requests\Finances\Estimates\UpdateRequest;
use App\Models\Estimate;
use App\Models\EstimateItem;
use App\Models\Proposal;
use App\Models\Quote;
use App\Models\SiteSetting;
use App\Notifications\Client\NewEstimateNotification;
use App\Services\Pdf\EstimatePdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class EstimateController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');
        $status = $request->get('status');
        $source = $request->get('source');

        $estimates = Estimate::query()
            ->with([
                'quote:id,reference_number,project_name,status,user_id',
                'quote.user:id,name',
                'proposal:id,proposal_number,project_name,status,customer_id',
                'proposal.customer:id,name,tier',
                'customer:id,name,tier',
                'items',
            ])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('estimate_number', 'like', "%{$search}%")
                        ->orWhereHas('quote', fn($q) => $q->where('reference_number', 'like', "%{$search}%")
                            ->orWhere('project_name', 'like', "%{$search}%"))
                        ->orWhereHas('proposal', fn($q) => $q->where('proposal_number', 'like', "%{$search}%"))
                        ->orWhereHas('customer', fn($q) => $q->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($status, fn($q) => $q->where('status', $status))
            ->when($source === 'quote',    fn($q) => $q->whereNotNull('quote_id'))
            ->when($source === 'proposal', fn($q) => $q->whereNotNull('proposal_id'))
            ->when($source === 'customer', fn($q) => $q->whereNotNull('customer_id'))
            ->latest()
            ->paginate($perPage);

        $summary = Estimate::query()
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

        return Inertia::render('finances/estimates/index', [
            'estimates' => $estimates,
            'summary'   => $summary,
            'filters'   => [
                'search'   => $search,
                'per_page' => $perPage,
                'status'   => $status,
                'source'   => $source,
            ],
        ]);
    }

    public function show(Estimate $estimate)
    {
        $estimate->load([
            'customer',
            'proposal.customer',
            'quote.user',
            'quote.customer',
            'items',
        ]);

        return Inertia::render('finances/estimates/detail/index', [
            'estimate' => $estimate,
            'settings' => SiteSetting::get(),
        ]);
    }

    public function create(Request $request)
    {
        $selectedQuote    = null;
        $selectedProposal = null;
        $selectedCustomer = null;

        if ($request->filled('quote_id')) {
            $selectedQuote = Quote::with(
                'user:id,name,email,phone',
                'customer:id,name,email,phone',
                'service:id,name',
                'servicePackage:id,name',
            )->find($request->quote_id);
        } elseif ($request->filled('proposal_id')) {
            $selectedProposal = Proposal::with('customer:id,name,email,phone', 'items')
                ->find($request->proposal_id);
        }

        return Inertia::render('finances/estimates/create/index', [
            'selectedQuote'    => $selectedQuote,
            'selectedProposal' => $selectedProposal,
            'fromQuote'        => $request->filled('quote_id'),
            'fromProposal'     => $request->filled('proposal_id'),
        ]);
    }

    public function store(StoreRequest $request)
    {
        $validated    = $request->validated();
        $fromQuote    = $request->boolean('from_quote');
        $fromProposal = $request->boolean('from_proposal');

        $quote    = null;
        $proposal = null;

        if ($fromQuote) {
            $quote = Quote::find($validated['quote_id']);
            if (!$quote) {
                return back()->withErrors(['error' => 'Quote tidak ditemukan.']);
            }
        } elseif ($fromProposal) {
            $proposal = Proposal::find($validated['proposal_id']);
            if (!$proposal) {
                return back()->withErrors(['error' => 'Proposal tidak ditemukan.']);
            }
        }

        $estimate = DB::transaction(function () use ($validated, $fromQuote, $fromProposal, $quote, $proposal) {
            $anchor = $quote ?? $proposal;
            $latestVersion = $anchor
                ? $anchor->estimates()->max('version') ?? 0
                : 0;

            if ($anchor) {
                $anchor->estimates()->update(['is_active' => false]);
            }

            $estimate = Estimate::create([
                'estimate_number'  => Estimate::generateEstimateNumber(),
                'quote_id'         => $fromQuote ? $quote->id : null,
                'proposal_id'      => $fromProposal ? $proposal->id : null,
                'customer_id'      => (!$fromQuote && !$fromProposal) ? ($validated['customer_id'] ?? null) : null,
                'version'          => $latestVersion + 1,
                'is_active'        => true,
                'subtotal'         => 0,
                'tax_percent'      => $validated['tax_percent'] ?? 0,
                'tax_amount'       => 0,
                'discount_percent' => $validated['discount_percent'] ?? 0,
                'discount_amount'  => 0,
                'total_amount'     => 0,
                'estimate_date'    => $validated['estimate_date'] ?? null,
                'valid_until'      => $validated['valid_until'] ?? null,
                'status'           => 'draft',
                'notes'            => $validated['notes'] ?? null,
            ]);

            $this->syncItems($estimate, $validated);
            $estimate->calculateTotals();

            if ($fromQuote && $quote->status === 'contacted') {
                $quote->update(['status' => 'estimated']);
            }

            return $estimate;
        });

        try {
            $filePath = app(EstimatePdfService::class)->generate($estimate);
            $estimate->update(['file_path' => $filePath]);
        } catch (\Exception $e) {
            Log::error('Estimate PDF generation failed', [
                'estimate_id' => $estimate->id,
                'error'       => $e->getMessage(),
            ]);
        }

        if ($fromQuote) {
            return redirect()->route('finances.quotes.show', ['quote' => $quote->id])
                ->with('success', 'Estimasi berhasil ditambahkan.');
        }

        if ($fromProposal) {
            return redirect()->route('finances.proposals.index', ['proposal' => $proposal->id])
                ->with('success', 'Estimasi berhasil ditambahkan.');
        }

        return redirect()->route('finances.estimates.index')
            ->with('success', 'Estimasi berhasil ditambahkan.');
    }

    public function edit(Request $request, Estimate $estimate)
    {
        $estimate->load([
            'items',
            'quote.user:id,name,email,phone',
            'quote.customer:id,name,tier,email,phone',
            'quote.service:id,name',
            'proposal.customer:id,name,tier,email,phone',
            'customer:id,name,tier,email,phone',
        ]);

        return Inertia::render('finances/estimates/edit/index', [
            'estimate'         => $estimate,
            'selectedQuote'    => $estimate->quote,
            'selectedProposal' => $estimate->proposal,
            'selectedCustomer' => $estimate->customer,
            'fromQuote'        => $request->filled('quote_id'),
            'fromProposal'     => $request->filled('proposal_id'),
            'isEdit'           => true,
        ]);
    }

    public function update(UpdateRequest $request, Estimate $estimate)
    {
        if ($error = $this->validateNotAccepted($estimate)) return $error;

        DB::transaction(function () use ($estimate, $request) {
            $validated = $request->validated();

            $estimate->update([
                'estimate_date'    => $validated['estimate_date'] ?? null,
                'valid_until'      => $validated['valid_until'] ?? null,
                'tax_percent'      => $validated['tax_percent'] ?? 0,
                'discount_percent' => $validated['discount_percent'] ?? 0,
                'status'           => $validated['status'] ?? $estimate->status,
                'notes'            => $validated['notes'] ?? null,
            ]);

            $this->syncItems($estimate, $validated);
            $estimate->refresh()->calculateTotals();
        });

        try {
            $pdfService = app(EstimatePdfService::class);
            $pdfService->delete($estimate);
            $filePath = $pdfService->generate($estimate->fresh());
            $estimate->update(['file_path' => $filePath]);
        } catch (\Exception $e) {
            Log::error('Estimate PDF regeneration failed', [
                'estimate_id' => $estimate->id,
                'error'       => $e->getMessage(),
            ]);
        }

        if ($request->boolean('from_quote')) {
            return redirect()->route('finances.quotes.show', ['quote' => $estimate->quote->id])
                ->with('success', 'Estimasi berhasil diperbarui.');
        }

        if ($request->boolean('from_proposal')) {
            return redirect()->route('finances.proposals.show', ['proposal' => $estimate->proposal->id])
                ->with('success', 'Estimasi berhasil diperbarui.');
        }

        return redirect()->route('finances.estimates.index')
            ->with('success', 'Estimasi berhasil diperbarui.');
    }

    public function updateStatus(Request $request, Estimate $estimate)
    {
        if ($estimate->status === 'accepted') {
            return back()->withErrors(['error' => 'Estimate yang sudah diterima tidak dapat diubah.']);
        }

        $request->validate([
            'status'          => 'required|in:draft,sent,accepted,rejected,expired',
            'rejected_reason' => 'required_if:status,rejected|nullable|string|max:500',
        ], [
            'status.required'             => 'Status wajib dipilih.',
            'status.in'                   => 'Status tidak valid.',
            'rejected_reason.required_if' => 'Alasan penolakan wajib diisi.',
        ]);

        match ($request->status) {
            'rejected' => $estimate->reject($request->rejected_reason),
            default    => $estimate->update([
                'status'          => $request->status,
                'rejected_reason' => null,
            ]),
        };

        if ($estimate->quote) {
            if ($request->status === 'accepted') {
                $estimate->quote->update(['status' => 'accepted']);
            } elseif ($request->status === 'rejected' && $estimate->quote->status === 'accepted') {
                $estimate->quote->update(['status' => 'contacted']);
            }
        }

        if ($request->status === 'sent') {
            $estimate->loadMissing(['customer.user', 'proposal.customer.user', 'quote.user', 'items']);
            $user = $estimate->customer?->user
                ?? $estimate->proposal?->customer?->user
                ?? $estimate->quote?->user;

            if ($user) {
                $user->notify(new NewEstimateNotification($estimate->fresh()));
            }
        }

        $messages = [
            'draft'    => 'Estimate dikembalikan ke draft.',
            'sent'     => 'Estimate ditandai sudah dikirim.',
            'accepted' => 'Estimate berhasil diterima.',
            'rejected' => 'Estimate berhasil ditolak.',
            'expired'  => 'Estimate telah kadaluarsa.',
        ];

        return back()->with('success', $messages[$request->status]);
    }

    public function revise(Request $request, Estimate $estimate)
    {
        if ($estimate->status === 'accepted') {
            return back()->with('error', 'Estimate yang sudah diterima tidak dapat direvisi.');
        }

        $newEstimate = DB::transaction(fn() => $estimate->createNewVersion());

        if ($request->boolean('from_quote')) {
            return redirect()->route('finances.estimates.edit', [
                'estimate'   => $newEstimate,
                'from_quote' => 'true',
                'quote_id'   => $request->quote_id,
            ])->with('success', 'Revisi estimasi berhasil dibuat.');
        }

        if ($request->boolean('from_proposal')) {
            return redirect()->route('finances.estimates.edit', [
                'estimate'    => $newEstimate,
                'from_proposal' => 'true',
                'proposal_id' => $request->proposal_id,
            ])->with('success', 'Revisi estimasi berhasil dibuat.');
        }

        return redirect()->route('finances.estimates.edit', $newEstimate)
            ->with('success', 'Revisi estimasi berhasil dibuat.');
    }

    public function destroy(Estimate $estimate)
    {
        if ($estimate->status === 'accepted') {
            return back()->with('error', 'Estimate yang sudah diterima tidak dapat dihapus.');
        }

        DB::transaction(function () use ($estimate) {
            $wasActive = $estimate->is_active;
            $estimate->delete();

            if ($wasActive) {
                $previous = Estimate::when($estimate->quote_id, fn($q) => $q->where('quote_id', $estimate->quote_id))
                    ->when($estimate->proposal_id, fn($q) => $q->where('proposal_id', $estimate->proposal_id))
                    ->orderBy('version', 'desc')
                    ->first();

                $previous?->update(['is_active' => true]);
            }
        });

        return back()->with('success', 'Estimate berhasil dihapus.');
    }

    public function regeneratePdf(Estimate $estimate)
    {
        try {
            $pdfService = app(EstimatePdfService::class);
            $pdfService->delete($estimate);
            $filePath = $pdfService->generate($estimate->fresh());
            $estimate->update(['file_path' => $filePath]);

            return back()->with('success', 'PDF estimasi berhasil di-generate ulang.');
        } catch (\Exception $e) {
            Log::error('Estimate PDF manual regeneration failed', [
                'estimate_id' => $estimate->id,
                'error'       => $e->getMessage(),
            ]);

            return back()->withErrors(['error' => 'Gagal generate PDF: ' . $e->getMessage()]);
        }
    }

    public function download(Estimate $estimate)
    {
        $content  = FileHelper::downloadFromR2Public($estimate->file_path);
        $filename = 'estimasi-' . $estimate->estimate_number . '.pdf';

        return response($content, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    private function syncItems(Estimate $estimate, array $validated): void
    {
        $estimate->items()->delete();

        foreach ($validated['items'] ?? [] as $i => $itemData) {
            $amounts = EstimateItem::calculateAmounts(
                quantity: $itemData['quantity'],
                unitPrice: $itemData['unit_price'],
                taxPercent: $itemData['tax_percent'] ?? 0,
                discountPercent: $itemData['discount_percent'] ?? 0,
            );

            EstimateItem::create([
                'estimate_id'      => $estimate->id,
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

    private function validateNotAccepted(Estimate $estimate)
    {
        if ($estimate->status === 'accepted') {
            return back()->withErrors([
                'error' => 'Estimate yang sudah diterima tidak dapat diubah.',
            ]);
        }

        return null;
    }
}
