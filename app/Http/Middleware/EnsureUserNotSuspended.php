<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserNotSuspended
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        if ($user->isSuspended()) {
            abort(403, __('Akun Anda telah disuspend. Hubungi administrator.'));
        }

        if ($user->isInactive()) {
            abort(403, __('Akun Anda tidak aktif. Hubungi administrator.'));
        }

        return $next($request);
    }
}
