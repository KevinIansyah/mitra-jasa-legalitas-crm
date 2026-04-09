<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Quotes\StoreRequest;
use App\Models\Quote;
use App\Notifications\Staff\NewQuoteNotification;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClientQuoteController extends Controller
{
    public function index(Request $request)
    {
        $quotes = Quote::where('user_id', Auth::id())
            ->with(['service', 'servicePackage', 'activeEstimate'])
            ->latest()
            ->get();

        return ApiResponse::success($quotes);
    }

    public function show(Quote $quote)
    {
        if ($quote->user_id !== Auth::id()) {
            return ApiResponse::forbidden();
        }

        $quote->load(['service', 'servicePackage', 'estimates', 'activeEstimate']);

        return ApiResponse::success($quote);
    }

    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        $existingQuote = Quote::where('user_id', Auth::id())
            ->whereIn('status', ['pending', 'contacted'])
            ->when(
                isset($validated['service_id']),
                fn ($q) => $q->where('service_id', $validated['service_id'])
            )
            ->first();

        if ($existingQuote) {
            return ApiResponse::conflict('Anda sudah memiliki permintaan quote yang sedang diproses untuk layanan ini. Silakan tunggu hingga proses selesai atau hubungi admin.');
        }

        $quote = Quote::create([
            ...$validated,
            'user_id' => Auth::id(),
            'reference_number' => Quote::generateReferenceNumber(),
            'source' => 'portal',
            'status' => 'pending',
        ]);

        $quote->load(['service', 'servicePackage']);

        NotificationService::notifyAllStaff(new NewQuoteNotification($quote));

        return ApiResponse::created(
            $quote,
            'Permintaan quote berhasil dikirim. Tim kami akan segera menghubungi Anda.'
        );
    }

    public function destroy(Quote $quote)
    {
        if ($quote->user_id !== Auth::id()) {
            return ApiResponse::forbidden();
        }

        if (! in_array($quote->status, ['pending', 'rejected'])) {
            return ApiResponse::conflict('Quote yang sedang diproses tidak dapat dihapus.');
        }

        $quote->delete();

        return ApiResponse::success(null, 'Quote berhasil dihapus.');
    }
}
