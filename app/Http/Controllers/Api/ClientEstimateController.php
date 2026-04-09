<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Estimate;
use App\Notifications\Staff\EstimateAcceptedNotification;
use App\Notifications\Staff\EstimateRejectedNotification;
use App\Services\NotificationService;
use App\Support\ApiFileUrls;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClientEstimateController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $customerId = $user->customer?->id;

        $estimates = Estimate::query()
            ->where(function ($q) use ($customerId, $user) {
                if ($customerId !== null) {
                    $q->where(function ($inner) use ($customerId) {
                        $inner->where('customer_id', $customerId)
                            ->orWhereHas('proposal', fn ($p) => $p->where('customer_id', $customerId));
                    })->orWhereHas('quote', fn ($q2) => $q2->where('user_id', $user->id));
                } else {
                    $q->whereHas('quote', fn ($q2) => $q2->where('user_id', $user->id));
                }
            })
            ->where('status', '!=', 'draft')
            ->with(['items', 'proposal', 'quote'])
            ->latest()
            ->get();

        $estimates->each(fn (Estimate $e) => ApiFileUrls::estimate($e));

        return ApiResponse::success($estimates);
    }

    public function show(Estimate $estimate)
    {
        $estimate->load(['items', 'proposal', 'quote']);

        return ApiResponse::success($estimate);
    }

    public function updateStatus(Request $request, Estimate $estimate)
    {
        if ($estimate->status === 'accepted') {
            return ApiResponse::error('Estimasi yang sudah diterima tidak dapat diubah.', 422);
        }

        $request->validate([
            'status' => 'required|in:accepted,rejected',
            'rejected_reason' => 'required_if:status,rejected|nullable|string|max:500',
        ]);

        match ($request->status) {
            'rejected' => $estimate->reject($request->rejected_reason),
            default => $estimate->update([
                'status' => $request->status,
                'rejected_reason' => null,
            ]),
        };

        if ($request->status === 'rejected') {
            $estimate->loadMissing(['customer', 'proposal.customer', 'quote.customer']);
            NotificationService::notifyAllStaff(new EstimateRejectedNotification($estimate));
        }

        if ($request->status === 'accepted') {
            $estimate->loadMissing(['customer', 'proposal.customer', 'quote.customer']);
            NotificationService::notifyAllStaff(new EstimateAcceptedNotification($estimate));
        }

        $estimate = $estimate->fresh();
        $estimate->load(['items', 'proposal', 'quote']);
        ApiFileUrls::estimate($estimate);

        return ApiResponse::success($estimate, 'Status estimasi berhasil diperbarui.');
    }
}
