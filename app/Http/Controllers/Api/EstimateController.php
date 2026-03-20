<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Estimate;
use App\Notifications\Staff\EstimateRejectedNotification;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EstimateController extends Controller
{
    public function index(Request $request)
    {
        $customerId = Auth::user()->customer?->id;

        $estimates = Estimate::where(function ($q) use ($customerId) {
            $q->where('customer_id', $customerId)
                ->orWhereHas('proposal', fn($q) => $q->where('customer_id', $customerId))
                ->orWhereHas('quote', fn($q) => $q->where('user_id', Auth::id()));
        })
            ->with(['items', 'proposal', 'quote'])
            ->latest()
            ->get();

        return ApiResponse::success($estimates);
    }

    public function show(Estimate $estimate)
    {
        if (!$this->isAuthorized($estimate)) {
            return ApiResponse::forbidden();
        }

        $estimate->load(['items', 'proposal', 'quote']);

        return ApiResponse::success($estimate);
    }

    public function updateStatus(Request $request, Estimate $estimate)
    {
        if (!$this->isAuthorized($estimate)) {
            return ApiResponse::forbidden();
        }

        if ($estimate->status === 'accepted') {
            return ApiResponse::error('Estimasi yang sudah diterima tidak dapat diubah.', 422);
        }

        $request->validate([
            'status'          => 'required|in:accepted,rejected',
            'rejected_reason' => 'required_if:status,rejected|nullable|string|max:500',
        ]);

        match ($request->status) {
            'rejected' => $estimate->reject($request->rejected_reason),
            default    => $estimate->update([
                'status'          => $request->status,
                'rejected_reason' => null,
            ]),
        };

        if ($request->status === 'rejected') {
            $estimate->loadMissing(['customer', 'proposal.customer', 'quote.customer']);
            NotificationService::notifyAllStaff(new EstimateRejectedNotification($estimate));
        }

        return ApiResponse::success($estimate->fresh(), 'Status estimasi berhasil diperbarui.');
    }

    private function isAuthorized(Estimate $estimate): bool
    {
        $customerId = Auth::user()->customer?->id;
        $userId     = Auth::id();

        return $estimate->customer_id === $customerId
            || $estimate->proposal?->customer_id === $customerId
            || $estimate->quote?->user_id === $userId;
    }
}
