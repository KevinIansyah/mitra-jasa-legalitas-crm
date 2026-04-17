<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class TurnstileService
{
    private ?string $secret;
    private string $verifyUrl;

    public function __construct()
    {
        $this->secret = config('services.turnstile.secret');
        $this->verifyUrl = config('services.turnstile.verify_url', 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
    }

    /**
     * Apakah verifikasi Turnstile aktif (secret di-set).
     * Di environment dev tanpa secret, verifikasi otomatis di-bypass.
     */
    public function isEnabled(): bool
    {
        return is_string($this->secret) && $this->secret !== '';
    }

    /**
     * Verifikasi token Turnstile dari client.
     *
     * @param  string|null  $token     Token `cf-turnstile-response` dari FE
     * @param  string|null  $ip        IP client (opsional, untuk validasi tambahan)
     * @return array{success:bool, error_codes:array<int,string>, action?:string, hostname?:string}
     */
    public function verify(?string $token, ?string $ip = null): array
    {
        if (! $this->isEnabled()) {
            Log::warning('Turnstile secret tidak di-set, verifikasi di-bypass.');

            return [
                'success' => true,
                'error_codes' => [],
                'bypassed' => true,
            ];
        }

        if (! is_string($token) || trim($token) === '') {
            return [
                'success' => false,
                'error_codes' => ['missing-input-response'],
            ];
        }

        $payload = [
            'secret' => $this->secret,
            'response' => $token,
        ];

        if ($ip !== null && $ip !== '') {
            $payload['remoteip'] = $ip;
        }

        try {
            /** @var \Illuminate\Http\Client\Response $response */
            $response = Http::asForm()
                ->timeout(5)
                ->connectTimeout(3)
                ->retry(2, 200, throw: false)
                ->post($this->verifyUrl, $payload);
        } catch (Throwable $e) {
            Log::error('Turnstile verify request gagal.', [
                'message' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error_codes' => ['network-error'],
            ];
        }

        if (! $response->successful()) {
            Log::error('Turnstile verify response tidak sukses.', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [
                'success' => false,
                'error_codes' => ['upstream-error'],
            ];
        }

        $body = $response->json();

        return [
            'success' => (bool) ($body['success'] ?? false),
            'error_codes' => (array) ($body['error-codes'] ?? []),
            'action' => $body['action'] ?? null,
            'hostname' => $body['hostname'] ?? null,
        ];
    }
}
