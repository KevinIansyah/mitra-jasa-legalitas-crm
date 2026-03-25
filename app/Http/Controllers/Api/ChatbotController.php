<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\ChatSession;
use App\Models\SiteSetting;
use App\Services\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

        $session = $sessionToken
            ? ChatSession::firstOrCreate(
                ['session_token' => $sessionToken],
                ['page_url' => $request->input('page_url')],
            )
            : ChatSession::create([
                'page_url' => $request->input('page_url'),
            ]);

        return ApiResponse::success([
            'enabled' => true,
            'session_token' => $session->session_token,
            'is_converted' => $session->isConverted(),
            'lead' => [
                'name' => $session->name,
                'email' => $session->email,
                'phone' => $session->phone,
            ],
        ]);
    }

    public function send(Request $request, string $sessionToken): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $session = ChatSession::where('session_token', $sessionToken)->firstOrFail();

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
        ]);

        $session = ChatSession::where('session_token', $sessionToken)->firstOrFail();

        $session->update(array_filter([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'phone' => $request->input('phone'),
            'status' => 'converted',
        ]));

        return ApiResponse::success([
            'message' => 'Data berhasil disimpan.',
        ]);
    }
}
