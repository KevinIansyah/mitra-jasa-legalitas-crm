<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Proposal;
use App\Notifications\Staff\ProposalRejectedNotification;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProposalController extends Controller
{
    public function index(Request $request)
    {
        $proposals = Proposal::where('customer_id', Auth::user()->customer?->id)
            ->with('items')
            ->latest()
            ->get();

        return ApiResponse::success($proposals);
    }

    public function show(Proposal $proposal)
    {
        if ($proposal->customer_id !== Auth::user()->customer?->id) {
            return ApiResponse::forbidden();
        }

        $proposal->load('items');

        return ApiResponse::success($proposal);
    }

    public function updateStatus(Request $request, Proposal $proposal)
    {
        if ($proposal->customer_id !== Auth::user()->customer?->id) {
            return ApiResponse::forbidden();
        }

        if ($proposal->status === 'accepted') {
            return ApiResponse::error('Proposal yang sudah diterima tidak dapat diubah.', 422);
        }

        $request->validate([
            'status'          => 'required|in:accepted,rejected',
            'rejected_reason' => 'required_if:status,rejected|nullable|string|max:500',
        ]);

        match ($request->status) {
            'rejected' => $proposal->reject($request->rejected_reason),
            default    => $proposal->update([
                'status'          => $request->status,
                'rejected_reason' => null,
            ]),
        };

        if ($request->status === 'rejected') {
            $proposal->loadMissing('customer');
            NotificationService::notifyAllStaff(new ProposalRejectedNotification($proposal));
        }

        return ApiResponse::success($proposal->fresh(), 'Status proposal berhasil diperbarui.');
    }
}
