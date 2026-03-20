<?php

namespace App\Http\Controllers\Finances;

use App\Http\Controllers\Controller;
use App\Models\Quote;
use App\Models\Service;
use App\Notifications\Client\QuoteRejectedNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuoteController extends Controller
{
    public function index(Request $request)
    {
        $perPage  = $request->get('per_page', 20);
        $perPage  = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search   = $request->get('search');
        $status   = $request->get('status');
        $timeline = $request->get('timeline');
        $source   = $request->get('source');

        $quotes = Quote::query()
            ->with([
                'user:id,name,email',
                'customer:id,name',
                'service:id,name',
                'servicePackage:id,name',
                'activeEstimate',
            ])
            ->withCount('estimates')
            ->when($search, fn($q) => $q->search($search))
            ->when($status, fn($q) => $q->byStatus($status))
            ->when($timeline, fn($q) => $q->where('timeline', $timeline))
            ->when($source, fn($q) => $q->where('source', $source))
            ->latest()
            ->paginate($perPage);

        $summary = Quote::query()
            ->selectRaw("
            COUNT(*) as total,
            COALESCE(SUM(CASE WHEN status = 'pending'   THEN 1 ELSE 0 END), 0) as pending,
            COALESCE(SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END), 0) as contacted,
            COALESCE(SUM(CASE WHEN status = 'estimated' THEN 1 ELSE 0 END), 0) as estimated,
            COALESCE(SUM(CASE WHEN status = 'accepted'  THEN 1 ELSE 0 END), 0) as accepted,
            COALESCE(SUM(CASE WHEN status = 'rejected'  THEN 1 ELSE 0 END), 0) as rejected,
            COALESCE(SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END), 0) as converted
        ")
            ->first();

        return Inertia::render('finances/quotes/index', [
            'quotes'  => $quotes,
            'summary' => $summary,
            'filters' => [
                'search'   => $search,
                'per_page' => $perPage,
                'status'   => $status,
                'timeline' => $timeline,
                'source'   => $source,
            ],
        ]);
    }

    public function show(Quote $quote)
    {
        $quote->load([
            'user:id,name,email',
            'customer:id,name,phone,email',
            'service:id,name',
            'servicePackage:id,name',
            'project:id,name,status',
            'estimates' => fn($q) => $q->with('items')->orderBy('version', 'desc'),
        ]);

        return Inertia::render('finances/quotes/detail/index', [
            'quote' => $quote,
        ]);
    }

    public function updateStatus(Request $request, Quote $quote)
    {
        if ($quote->status === 'converted') {
            return back()->withErrors(['error' => 'Quote yang sudah dikonversi tidak dapat diubah.']);
        }

        $request->validate([
            'status'          => 'required|in:pending,contacted,estimated,accepted,rejected',
            'rejected_reason' => 'required_if:status,rejected|nullable|string|max:500',
        ], [
            'status.required'          => 'Status wajib dipilih.',
            'status.in'                => 'Status tidak valid.',
            'rejected_reason.required_if' => 'Alasan penolakan wajib diisi.',
        ]);

        if ($request->status === 'rejected') {
            $quote->loadMissing(['user', 'service']);
            if ($quote->user) {
                $quote->user->notify(new QuoteRejectedNotification($quote->fresh()));
            }
        }

        $messages = [
            'pending'   => 'Status permintaan penawaran diubah ke menunggu.',
            'contacted' => 'permintaan penawaran ditandai sudah dihubungi.',
            'estimated' => 'Status permintaan penawaran diubah ke diestimasi.',
            'accepted'  => 'permintaan penawaran berhasil diterima.',
            'rejected'  => 'permintaan penawaran berhasil ditolak.',
        ];

        return back()->with('success', $messages[$request->status]);
    }

    public function convert(Quote $quote)
    {
        if (!$quote->is_convertible) {
            return back()->with('error', 'Quote ini belum dapat dikonversi menjadi project.');
        }

        $quote->load([
            'customer',
            'service',
            'servicePackage',
            'estimates.items',
            'user:id,name,email,phone',
            'user.customer',
        ]);

        $services = Service::orderBy('name')->get(['id', 'name']);

        return Inertia::render('projects/create/index', [
            'quote'    => $quote,
            'services' => $services,
        ]);
    }

    public function destroy(Quote $quote)
    {
        if ($quote->status === 'converted') {
            return back()->withErrors('error', 'Quote yang sudah dikonversi tidak dapat dihapus.');
        }

        if ($quote->estimates()->exists()) {
            return back()->withErrors(['error' => 'Quote tidak dapat dihapus karena masih memiliki estimate.']);
        }

        $quote->delete();

        return back()->with('success', 'Quote berhasil dihapus.');
    }
}
