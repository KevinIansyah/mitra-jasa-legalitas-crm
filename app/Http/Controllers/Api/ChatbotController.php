<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Helpers\PhoneHelper;
use App\Http\Controllers\Controller;
use App\Models\ChatSession;
use App\Models\SiteSetting;
use App\Services\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Throwable;

class ChatbotController extends Controller
{
    public function __construct(
        private readonly ChatbotService $chatbot,
    ) {}

    public function session(Request $request): JsonResponse
    {
        $settings = SiteSetting::get();

        if (! ($settings->ai_chatbot_enabled ?? true)) {
            return ApiResponse::success([
                'enabled' => false,
                'offline_message' => $settings->ai_chatbot_offline_message ?? 'Asisten AI sedang tidak tersedia.',
                'whatsapp' => $settings->ai_chatbot_whatsapp_number,
            ]);
        }

        $used = $settings->ai_chatbot_used_tokens ?? 0;
        $limit = $settings->ai_chatbot_monthly_limit ?? 10000000;

        if ($used >= $limit) {
            return ApiResponse::success([
                'enabled' => false,
                'offline_message' => $settings->ai_chatbot_offline_message ?? 'Asisten AI sedang tidak tersedia. Hubungi kami via WhatsApp.',
                'whatsapp' => $settings->ai_chatbot_whatsapp_number,
            ]);
        }

        $sessionToken = $request->input('session_token');

        // Jangan buat baris di DB di sini: banyak pengunjung hanya memuat widget tanpa mengirim pesan.
        // Sesi baru disimpan saat pesan pertama (send) atau saat lead disimpan (updateLead).
        if ($sessionToken) {
            $existing = ChatSession::where('session_token', $sessionToken)->first();
            if ($existing) {
                return ApiResponse::success([
                    'enabled' => true,
                    'session_token' => $existing->session_token,
                    'is_converted' => $existing->isConverted(),
                    'lead' => [
                        'name' => $existing->name,
                        'email' => $existing->email,
                        'phone' => $existing->phone,
                    ],
                ]);
            }
        }

        $token = $sessionToken ?: (string) Str::uuid();

        return ApiResponse::success([
            'enabled' => true,
            'session_token' => $token,
            'is_converted' => false,
            'lead' => [
                'name' => null,
                'email' => null,
                'phone' => null,
            ],
        ]);
    }

    public function send(Request $request, string $sessionToken): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'page_url' => 'nullable|string|max:2048',
        ]);

        $session = ChatSession::firstOrCreate(
            ['session_token' => $sessionToken],
            [
                'page_url' => $request->input('page_url'),
                'status' => 'active',
            ],
        );

        if ($request->filled('page_url') && blank($session->page_url)) {
            $session->update(['page_url' => $request->input('page_url')]);
        }

        try {
            $result = $this->chatbot->chat($session, $request->input('message'));

            return ApiResponse::success([
                'message' => $result['message'],
                'tokens_used' => $result['tokens_used'],
            ]);
        } catch (Throwable $exception) {
            if ($exception->getMessage() === 'TOKEN_LIMIT_EXCEEDED') {
                $settings = SiteSetting::get();

                return ApiResponse::success([
                    'enabled' => false,
                    'offline_message' => $settings->ai_chatbot_offline_message ?? 'Asisten AI sudah mencapai batas bulan ini.',
                    'whatsapp' => $settings->ai_chatbot_whatsapp_number,
                ]);
            }

            return ApiResponse::error($exception->getMessage(), 500);
        }
    }

    public function updateLead(Request $request, string $sessionToken): JsonResponse
    {
        $request->validate([
            'name' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:100',
            'phone' => 'nullable|string|max:20',
            'page_url' => 'nullable|string|max:2048',
        ]);

        $session = ChatSession::firstOrCreate(
            ['session_token' => $sessionToken],
            [
                'page_url' => $request->input('page_url'),
                'status' => 'active',
            ],
        );

        if ($request->filled('page_url') && blank($session->page_url)) {
            $session->update(['page_url' => $request->input('page_url')]);
        }

        $session->update(array_filter([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'phone' => PhoneHelper::format($request->input('phone')),
            'status' => 'converted',
        ]));

        return ApiResponse::success([
            'message' => 'Data berhasil disimpan.',
        ]);
    }
}
