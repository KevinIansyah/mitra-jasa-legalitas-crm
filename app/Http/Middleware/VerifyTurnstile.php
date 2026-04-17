<?php

namespace App\Http\Middleware;

use App\Helpers\ApiResponse;
use App\Services\TurnstileService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class VerifyTurnstile
{
    public function __construct(private readonly TurnstileService $turnstile) {}

    /**
     * Memverifikasi token Cloudflare Turnstile sebelum request diteruskan.
     *
     * Token dibaca dari header `CF-Turnstile-Token` atau field body `cf_turnstile_token`
     * (atau `turnstile_token`). Kalau secret tidak di-set, verifikasi di-bypass
     * (berguna untuk dev/testing).
     *
     * Mode:
     *  - default (wajib): token harus ada dan valid.
     *  - `optional`     : kalau token tidak dikirim → lewati verifikasi;
     *                     kalau dikirim → tetap diverifikasi.
     *                     Dipakai untuk progressive CAPTCHA (contoh: login).
     *
     * Contoh route: `->middleware('turnstile')` atau `->middleware('turnstile:optional')`.
     */
    public function handle(Request $request, Closure $next, ?string $mode = null): Response
    {
        if (! $this->turnstile->isEnabled()) {
            return $next($request);
        }

        $token = $request->header('CF-Turnstile-Token')
            ?? $request->input('cf_turnstile_token')
            ?? $request->input('turnstile_token');

        $tokenPresent = is_string($token) && trim($token) !== '';

        if ($mode === 'optional' && ! $tokenPresent) {
            return $next($request);
        }

        $result = $this->turnstile->verify(
            is_string($token) ? $token : null,
            $request->ip()
        );

        if (! ($result['success'] ?? false)) {
            Log::warning('Turnstile verifikasi gagal.', [
                'ip' => $request->ip(),
                'path' => $request->path(),
                'error_codes' => $result['error_codes'] ?? [],
            ]);

            return ApiResponse::validationError(
                ['cf_turnstile_token' => ['Verifikasi keamanan gagal. Silakan coba lagi.']],
                'Verifikasi keamanan gagal.'
            );
        }

        return $next($request);
    }
}
