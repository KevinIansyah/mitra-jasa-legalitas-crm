<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Estimate;
use App\Models\Project;
use App\Models\ProjectDocument;
use App\Models\ProjectInvoice;
use App\Models\Proposal;
use App\Models\Quote;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClientPortalSummaryController extends Controller
{
    /**
     * Ringkasan angka untuk dashboard portal klien (FE: halaman Ringkasan).
     *
     * Lingkup mengikuti endpoint portal lain: quote per user, sisanya per customer
     * (jika user punya profil customer). Tanpa customer, banyak metrik bernilai 0.
     */
    public function __invoke(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        $customerId = $user->customer?->id;

        $notificationsUnread = $user->unreadNotifications()->count();

        $quotes = [
            'total' => Quote::where('user_id', $user->id)->count(),
            'open' => Quote::where('user_id', $user->id)
                ->whereIn('status', ['pending', 'contacted', 'estimated'])
                ->count(),
        ];

        if (! $customerId) {
            return ApiResponse::success([
                'notifications' => ['unread_count' => $notificationsUnread],
                'quotes' => $quotes,
                'proposals' => self::emptyProposalBlock(),
                'estimates' => self::emptyEstimateBlock(),
                'projects' => self::emptyProjectBlock(),
                'invoices' => self::emptyInvoiceBlock(),
                'documents' => self::emptyDocumentBlock(),
            ], 'Berhasil');
        }

        $estimateBase = self::estimateBaseQuery($user, $customerId);

        return ApiResponse::success([
            'notifications' => ['unread_count' => $notificationsUnread],

            'quotes' => $quotes,

            'proposals' => [
                'total' => Proposal::where('customer_id', $customerId)
                    ->where('status', '!=', 'draft')
                    ->count(),
                'awaiting_response' => Proposal::where('customer_id', $customerId)
                    ->where('status', 'sent')
                    ->count(),
            ],

            'estimates' => [
                'total' => (clone $estimateBase)->count(),
                'awaiting_response' => (clone $estimateBase)->where('status', 'sent')->count(),
            ],

            'projects' => [
                'total' => Project::where('customer_id', $customerId)->count(),
                'active' => Project::where('customer_id', $customerId)
                    ->whereIn('status', ['planning', 'in_progress', 'on_hold'])
                    ->count(),
            ],

            'invoices' => [
                'total' => self::invoiceBaseQuery($customerId)->count(),
                'unpaid' => self::invoiceBaseQuery($customerId)
                    ->whereIn('status', ['sent', 'overdue'])
                    ->count(),
                'overdue' => self::invoiceBaseQuery($customerId)
                    ->where('status', 'overdue')
                    ->count(),
            ],

            'documents' => [
                'pending_review' => ProjectDocument::query()
                    ->whereHas('project', fn ($q) => $q->where('customer_id', $customerId))
                    ->where('status', 'pending_review')
                    ->count(),
                'rejected' => ProjectDocument::query()
                    ->whereHas('project', fn ($q) => $q->where('customer_id', $customerId))
                    ->where('status', 'rejected')
                    ->count(),
            ],
        ], 'Berhasil');
    }

    private static function invoiceBaseQuery(int $customerId)
    {
        return ProjectInvoice::query()
            ->where(function ($q) use ($customerId) {
                $q->where('customer_id', $customerId)
                    ->orWhereHas('project', fn ($p) => $p->where('customer_id', $customerId));
            })
            ->where('status', '!=', 'draft');
    }

    private static function estimateBaseQuery(User $user, int $customerId)
    {
        return Estimate::query()
            ->where(function ($q) use ($customerId, $user) {
                $q->where(function ($inner) use ($customerId) {
                    $inner->where('customer_id', $customerId)
                        ->orWhereHas('proposal', fn ($p) => $p->where('customer_id', $customerId));
                })->orWhereHas('quote', fn ($q2) => $q2->where('user_id', $user->id));
            })
            ->where('status', '!=', 'draft');
    }

    private static function emptyProposalBlock(): array
    {
        return ['total' => 0, 'awaiting_response' => 0];
    }

    private static function emptyEstimateBlock(): array
    {
        return ['total' => 0, 'awaiting_response' => 0];
    }

    private static function emptyProjectBlock(): array
    {
        return ['total' => 0, 'active' => 0];
    }

    private static function emptyInvoiceBlock(): array
    {
        return ['total' => 0, 'unpaid' => 0, 'overdue' => 0];
    }

    private static function emptyDocumentBlock(): array
    {
        return ['pending_review' => 0, 'rejected' => 0];
    }
}
