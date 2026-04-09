<?php

namespace App\Http\Middleware;

use App\Helpers\ApiResponse;
use App\Models\Proposal;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureProposalOwnedByCustomer
{
    /**
     * Memastikan proposal pada rute dimiliki oleh customer yang terhubung ke user yang terautentikasi.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $customer = $request->user()->customer;

        if (! $customer) {
            return ApiResponse::forbidden('Akun Anda tidak terhubung ke profil pelanggan.');
        }

        $proposal = $request->route('proposal');

        if (! $proposal instanceof Proposal) {
            return ApiResponse::notFound('Proposal tidak ditemukan.');
        }

        if ((int) $proposal->customer_id !== (int) $customer->id) {
            return ApiResponse::forbidden('Anda tidak memiliki akses ke proposal ini.');
        }

        return $next($request);
    }
}
