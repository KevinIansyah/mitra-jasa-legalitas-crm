<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Mail\BlogSubscriberVerificationMail;
use App\Models\BlogSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class BlogSubscriberController extends Controller
{
    public function subscribe(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|max:255',
            'name' => 'nullable|string|max:255',
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
        ]);

        $subscriber = BlogSubscriber::firstOrCreate(
            ['email' => $request->email],
            ['name' => $request->name],
        );

        if ($subscriber->isVerified()) {
            return ApiResponse::conflict('Email ini sudah terdaftar dan terverifikasi.');
        }

        if (! $subscriber->wasRecentlyCreated) {
            $subscriber->update([
                'token' => Str::random(64),
                'name' => $request->name ?? $subscriber->name,
            ]);
        }

        Mail::to($subscriber->email)->queue(
            new BlogSubscriberVerificationMail($subscriber->fresh())
        );

        return ApiResponse::success(null, 'Terima kasih! Silakan cek email Anda untuk konfirmasi langganan.');
    }

    public function verify(string $token): RedirectResponse
    {
        $subscriber = BlogSubscriber::where('token', $token)
            ->where('is_verified', false)
            ->firstOrFail();

        $subscriber->verify();

        return redirect(config('app.frontend_url').'/blog?verified=1');
    }

    public function unsubscribe(string $token): RedirectResponse
    {
        $subscriber = BlogSubscriber::where('token', $token)->firstOrFail();
        $subscriber->delete();

        return redirect(config('app.frontend_url').'/blog?unsubscribed=1');
    }
}
