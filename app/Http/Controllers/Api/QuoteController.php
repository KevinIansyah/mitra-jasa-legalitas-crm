<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Quotes\StoreRequest;
use App\Models\Quote;
use Illuminate\Support\Facades\Auth;

class QuoteController extends Controller
{
    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        $existingQuote = Quote::where('user_id', Auth::id())
            ->whereIn('status', ['pending', 'contacted'])
            ->when(
                isset($validated['service_id']),
                fn($q) => $q->where('service_id', $validated['service_id'])
            )
            ->first();

        if ($existingQuote) {
            return ApiResponse::conflict('Anda sudah memiliki permintaan quote yang sedang diproses untuk layanan ini. Silakan tunggu hingga proses selesai atau hubungi admin.');
        }

        $quote = Quote::create([
            ...$validated,
            // 'user_id'          => Auth::id(),
            'user_id'          => $request['user_id'] ?? 9,
            'reference_number' => Quote::generateReferenceNumber(),
            'source'           => 'portal',
            'status'           => 'pending',
        ]);

        $quote->load(['service', 'servicePackage']);

        return ApiResponse::created(
            $quote,
            'Permintaan quote berhasil dikirim. Tim kami akan segera menghubungi Anda.'
        );
    }
}
