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
        $validated = $request->validate([
            'email' => 'required|email:rfc,dns|max:255',
            'name' => 'nullable|string|min:2|max:255',
            'website' => 'nullable|string|max:0',
            'company_website' => 'nullable|string|max:0',
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
        ]);

        $genericMessage = 'Terima kasih! Jika email Anda valid, silakan cek inbox untuk konfirmasi langganan.';

        if (! empty($request->input('website')) || ! empty($request->input('company_website'))) {
            return ApiResponse::success(null, $genericMessage);
        }

        $subscriber = BlogSubscriber::firstOrCreate(
            ['email' => $validated['email']],
            ['name' => $validated['name'] ?? null],
        );

        if ($subscriber->isVerified()) {
            return ApiResponse::success(null, $genericMessage);
        }

        if (! $subscriber->wasRecentlyCreated) {
            $subscriber->update([
                'token' => Str::random(64),
                'name' => $validated['name'] ?? $subscriber->name,
            ]);
        }

        Mail::to($subscriber->email)->queue(
            new BlogSubscriberVerificationMail($subscriber->fresh())
        );

        return ApiResponse::success(null, $genericMessage);
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
