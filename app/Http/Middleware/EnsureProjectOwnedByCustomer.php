<?php

namespace App\Http\Middleware;

use App\Helpers\ApiResponse;
use App\Models\Project;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureProjectOwnedByCustomer
{
    /**
     * Memastikan proyek pada rute dimiliki oleh customer yang terhubung ke user yang terautentikasi.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $customer = $request->user()->customer;

        if (! $customer) {
            return ApiResponse::forbidden('Akun Anda tidak terhubung ke profil pelanggan.');
        }

        $project = $request->route('project');

        if (! $project instanceof Project) {
            return ApiResponse::notFound('Proyek tidak ditemukan.');
        }

        if ((int) $project->customer_id !== (int) $customer->id) {
            return ApiResponse::forbidden('Anda tidak memiliki akses ke proyek ini.');
        }

        return $next($request);
    }
}
