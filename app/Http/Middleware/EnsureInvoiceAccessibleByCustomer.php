<?php

namespace App\Http\Middleware;

use App\Helpers\ApiResponse;
use App\Models\ProjectInvoice;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureInvoiceAccessibleByCustomer
{
    public function handle(Request $request, Closure $next): Response
    {
        $invoice = $request->route('invoice');

        if (! $invoice instanceof ProjectInvoice) {
            return ApiResponse::notFound('Invoice tidak ditemukan.');
        }

        $invoice->loadMissing(['customer', 'project.customer']);
        $customer = $invoice->customer ?? $invoice->project?->customer;

        if (! $customer) {
            return ApiResponse::forbidden('Anda tidak memiliki akses ke invoice ini.');
        }

        if ((int) $customer->user_id !== (int) $request->user()->id) {
            return ApiResponse::forbidden('Anda tidak memiliki akses ke invoice ini.');
        }

        if ($invoice->status === 'draft') {
            return ApiResponse::notFound('Invoice tidak ditemukan.');
        }

        return $next($request);
    }
}
