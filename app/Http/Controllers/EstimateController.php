<?php

namespace App\Http\Controllers;

use App\Http\Requests\Estimates\StoreRequest;
use App\Http\Requests\Estimates\UpdateRequest;
use App\Models\Estimate;
use App\Models\EstimateItem;
use App\Models\Quote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EstimateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');
        $status = $request->get('status');

        $query = Estimate::with([
            'quote:id,reference_number,project_name,status,user_id',
            'quote.user:id,name',
            'items',
        ]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('estimate_number', 'like', "%{$search}%")
                    ->orWhereHas(
                        'quote',
                        fn($q) => $q
                            ->where('reference_number', 'like', "%{$search}%")
                            ->orWhere('project_name', 'like', "%{$search}%")
                    );
            });
        }

        if ($status) $query->where('status', $status);

        $estimates = $query->latest()->paginate($perPage);

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
            ],
        ]);
    }

    /**
     * Show create form for a specific quote.
     */
    public function create(Request $request)
    {
        $selectedQuote = null;
        if ($request->filled('quote_id')) {
            $selectedQuote = Quote::with(
                'user:id,name,email',
                'customer:id,name',
                'service:id,name',
                'servicePackage:id,name',
            )->find($request->quote_id, ['id', 'name', 'customer_id', 'service_id', 'service_package_id', 'budget', 'status']);
        }

        $fromQuote = $request->filled('quote_id');

        return Inertia::render('finances/estimates/create/index', [
            'selectedQuote' => $selectedQuote,
            'fromQuote' => $fromQuote,
        ]);
    }

    /**
     * Show edit form.
     */
    public function edit(Request $request, Estimate $estimate)
    {
        $estimate->load([
            'items',
            'quote.user:id,name,email',
            'quote.customer:id,name',
            'quote.service:id,name',
        ]);

        $fromQuote = $request->filled('quote_id');

        return Inertia::render('finances/estimates/edit/index', [
            'estimate' => $estimate,
            'selectedQuote' => $estimate->quote,
            'fromQuote' => $fromQuote,
            'isEdit'   => true,
        ]);
    }

    /**
     * Store a newly created estimate.
     */
    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        $quote = Quote::find($validated['quote_id']);
        if (!$quote) {
            return back()->withErrors(['project_id' => 'Project tidak ditemukan.']);
        }

        DB::transaction(function () use ($quote, $validated) {
            $latestVersion = $quote->estimates()->max('version') ?? 0;

            $quote->estimates()->update(['is_active' => false]);

            $estimate = Estimate::create([
                'estimate_number'      => Estimate::generateEstimateNumber(),
                'quote_id'             => $quote->id,
                'version'              => $latestVersion + 1,
                'is_active'            => true,
                'subtotal'             => 0,
                'tax_percent'          => $validated['tax_percent'] ?? 0,
                'tax_amount'           => 0,
                'discount_percent'     => $validated['discount_percent'] ?? 0,
                'discount_amount'      => 0,
                'total_amount'         => 0,
                'valid_until'          => $validated['valid_until'] ?? null,
                'status'               => $validated['status'] ?? 'draft',
                'notes'                => $validated['notes'] ?? null,

            ]);

            $this->syncItems($estimate, $validated);
            $estimate->calculateTotals();

            if ($quote->status === 'contacted') {
                $quote->update(['status' => 'estimated']);
            }

            return $estimate;
        });

        if ($request->boolean('from_quote')) {
            return redirect()->route('finances.quotes.show', ['quote' => $quote->id])
                ->with('success', 'Permintaan penawaran berhasil ditambahkan.');
        }

        return redirect()->route('finances.estimates.index')
            ->with('success', 'Permintaan penawaran berhasil ditambahkan.');
    }

    /**
     * Update the specified estimate.
     */
    public function update(UpdateRequest $request, Estimate $estimate)
    {
        if ($error = $this->validateNotAccepted($estimate)) return $error;

        DB::transaction(function () use ($estimate, $request) {
            $validated = $request->validated();

            $estimate->update([
                'valid_until'          => $validated['valid_until'] ?? null,
                'tax_percent'          => $validated['tax_percent'] ?? 0,
                'discount_percent'     => $validated['discount_percent'] ?? 0,
                'status'               => $validated['status'] ?? $estimate->status,
                'notes'                => $validated['notes'] ?? null,

            ]);

            $this->syncItems($estimate, $validated);
            $estimate->refresh()->calculateTotals();
        });

        if ($request->boolean('from_quote')) {
            return redirect()->route('finances.quotes.show', ['quote' => $estimate->quote->id])
                ->with('success', 'Permintaan penawaran berhasil diperbarui.');
        }

        return redirect()->route('finances.estimates.index')
            ->with('success', 'Permintaan penawaran berhasil diperbarui.');
    }

    /**
     * Update status only.
     */
    public function updateStatus(Request $request, Estimate $estimate)
    {
        if ($estimate->status === 'accepted') {
            return back()->withErrors(['error' => 'Estimate yang sudah diterima tidak dapat diubah.']);
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
            'rejected' => $estimate->reject($request->rejected_reason),
            default => $estimate->update([
                'status' => $request->status,
                'rejected_reason' => null,
            ]),
        };

        if ($request->status === 'accepted') {
            $estimate->quote->update(['status' => 'accepted']);
        } elseif ($request->status === 'rejected' && $estimate->quote->status === 'accepted') {
            $estimate->quote->update(['status' => 'contacted']);
        }

        $messages = [
            'draft'    => 'Estimate dikembalikan ke draft.',
            'sent'     => 'Estimate ditandai sudah dikirim.',
            'accepted' => 'Estimate berhasil diterima.',
            'rejected' => 'Estimate berhasil ditolak.',
        ];

        return back()->with('success', $messages[$request->status]);
    }

    /**
     * Create a new version from existing estimate.
     */
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

        return redirect()->route('finances.estimates.edit', $newEstimate)
            ->with('success', 'Revisi estmasi berhasil dibuat.');
    }

    /**
     * Remove the specified estimate.
     */
    public function destroy(Estimate $estimate)
    {
        if ($estimate->status === 'accepted') {
            return back()->with('error', 'Estimate yang sudah diterima tidak dapat dihapus.');
        }

        DB::transaction(function () use ($estimate) {
            $wasActive = $estimate->is_active;
            $estimate->delete();

            if ($wasActive) {
                $previous = Estimate::where('quote_id', $estimate->quote_id)
                    ->orderBy('version', 'desc')
                    ->first();

                $previous?->update(['is_active' => true]);
            }
        });

        return back()->with('success', 'Estimate berhasil dihapus.');
    }

    /**
     * Sync estimate items.
     */
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

    /**
     * Validate estimate is not accepted.
     */
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
