<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Notifications\Staff\NewContactMessageNotification;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|min:2|max:255',
            'whatsapp_number' => ['required', 'string', 'min:8', 'max:20', 'regex:/^[0-9+\-\s()]+$/'],
            'email' => 'nullable|email:rfc,dns|max:255',
            'topic' => 'nullable|string|min:2|max:255',
            'message' => 'required|string|min:10|max:2000',
            'website' => 'nullable|string|max:0',
            'company_website' => 'nullable|string|max:0',
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'name.min' => 'Nama lengkap minimal 2 karakter.',
            'whatsapp_number.required' => 'Nomor WhatsApp wajib diisi.',
            'whatsapp_number.min' => 'Nomor WhatsApp minimal 8 digit.',
            'whatsapp_number.regex' => 'Nomor WhatsApp hanya boleh berisi angka dan karakter +, -, spasi, ().',
            'email.email' => 'Format email tidak valid.',
            'message.required' => 'Pesan wajib diisi.',
            'message.min' => 'Pesan minimal 10 karakter.',
            'message.max' => 'Pesan maksimal 2000 karakter.',
        ]);

        if (! empty($request->input('website')) || ! empty($request->input('company_website'))) {
            return ApiResponse::success(null, 'Pesan berhasil dikirim.', 201);
        }

        unset($validated['website'], $validated['company_website']);

        $message = ContactMessage::create($validated);

        NotificationService::notifyAllStaff(new NewContactMessageNotification($message));

        return ApiResponse::success($message, 'Pesan berhasil dikirim.', 201);
    }
}
