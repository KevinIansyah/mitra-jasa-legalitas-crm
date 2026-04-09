<?php

namespace App\Http\Middleware;

use App\Helpers\ApiResponse;
use App\Models\Estimate;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEstimateAccessibleByCustomer
{
    /**
     * Memastikan estimasi dapat diakses: lewat customer, proposal terkait, atau quote milik user.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $customerId = $user->customer?->id;
        $userId = $user->id;

        $estimate = $request->route('estimate');

        if (! $estimate instanceof Estimate) {
            return ApiResponse::notFound('Estimasi tidak ditemukan.');
        }

        $estimate->loadMissing(['proposal', 'quote']);

        if ($this->isAuthorized($estimate, $customerId, $userId)) {
            return $next($request);
        }

        return ApiResponse::forbidden('Anda tidak memiliki akses ke estimasi ini.');
    }

    private function isAuthorized(Estimate $estimate, ?int $customerId, int $userId): bool
    {
        return $estimate->customer_id === $customerId
            || $estimate->proposal?->customer_id === $customerId
            || $estimate->quote?->user_id === $userId;
    }
}
