<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Proposal;
use App\Notifications\Staff\ProposalRejectedNotification;
use App\Services\NotificationService;
use App\Support\ApiFileUrls;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClientProposalController extends Controller
{
    public function index(Request $request)
    {
        $customerId = Auth::user()->customer?->id;

        if (! $customerId) {
            return ApiResponse::success([]);
        }

        $proposals = Proposal::where('customer_id', $customerId)
            ->where('status', '!=', 'draft')
            ->with('items')
            ->latest()
            ->get();

        return ApiResponse::success($proposals);
    }

    public function show(Proposal $proposal)
    {
        $proposal->load('items');

        ApiFileUrls::proposal($proposal);

        return ApiResponse::success($proposal);
    }

    public function updateStatus(Request $request, Proposal $proposal)
    {
        if ($proposal->status === 'accepted') {
            return ApiResponse::conflict('Proposal yang sudah diterima tidak dapat diubah.');
        }

        $request->validate([
            'status' => 'required|in:accepted,rejected',
            'rejected_reason' => 'required_if:status,rejected|nullable|string|max:500',
        ]);

        match ($request->status) {
            'rejected' => $proposal->reject($request->rejected_reason),
            default => $proposal->update([
                'status' => $request->status,
                'rejected_reason' => null,
            ]),
        };

        if ($request->status === 'rejected') {
            $proposal->loadMissing('customer');
            NotificationService::notifyAllStaff(new ProposalRejectedNotification($proposal));
        }

        $proposal = $proposal->fresh();
        $proposal->load('items');
        ApiFileUrls::proposal($proposal);

        return ApiResponse::success($proposal, 'Status proposal berhasil diperbarui.');
    }
}
