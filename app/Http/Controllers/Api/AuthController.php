<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Helpers\PhoneHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Auth\ForgotPasswordRequest;
use App\Http\Requests\Api\Auth\LoginRequest;
use App\Http\Requests\Api\Auth\RegisterRequest;
use App\Http\Requests\Api\Auth\ResendOtpRequest;
use App\Http\Requests\Api\Auth\ResetPasswordRequest;
use App\Http\Requests\Api\Auth\VerifyEmailRequest;
use App\Models\Customer;
use App\Models\User;
use App\Services\Api\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(protected OtpService $otpService) {}

    public function register(RegisterRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if ($user && $user->hasVerifiedEmail()) {
            return ApiResponse::error('Email sudah terdaftar.', 422);
        }

        if ($user && ! $user->hasVerifiedEmail()) {
            $this->otpService->send($user, 'email_verification');

            return ApiResponse::success(
                ['email' => $user->email],
                'Email sudah terdaftar tapi belum diverifikasi. Kode OTP baru telah dikirim.',
                200
            );
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => PhoneHelper::format($request->phone),
            'password' => Hash::make($request->password),
            'role' => 'user',
        ]);

        $user->assignRole('user');

        $this->otpService->send($user, 'email_verification');

        return ApiResponse::success(
            ['email' => $user->email],
            'Registrasi berhasil. Kode OTP telah dikirim ke email Anda.',
            201
        );
    }

    public function verifyEmail(VerifyEmailRequest $request)
    {
        $user = User::where('email', $request->email)->firstOrFail();

        if ($user->hasVerifiedEmail()) {
            return ApiResponse::error('Email sudah terverifikasi sebelumnya.', 422);
        }

        $valid = $this->otpService->verify($user, $request->otp, 'email_verification');

        if (! $valid) {
            return ApiResponse::error('Kode OTP tidak valid atau sudah kadaluarsa.', 422);
        }

        $user->markEmailAsVerified();

        Customer::where('email', $user->email)
            ->whereNull('user_id')
            ->update(['user_id' => $user->id]);

        $deviceName = $request->device_name ?? $request->userAgent() ?? 'web';
        $token = $user->createToken($deviceName)->plainTextToken;

        return ApiResponse::success(
            [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer',
            ],
            'Email berhasil diverifikasi.'
        );
    }

    public function resendVerificationOtp(ResendOtpRequest $request)
    {
        $user = User::where('email', $request->email)->firstOrFail();

        if ($user->hasVerifiedEmail()) {
            return ApiResponse::error('Email sudah terverifikasi.', 422);
        }

        $this->otpService->send($user, 'email_verification');

        return ApiResponse::success(null, 'Kode OTP baru telah dikirim ke email Anda.');
    }

    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return ApiResponse::error('Email atau password salah.', 401);
        }

        if (! $user->hasVerifiedEmail()) {
            $this->otpService->send($user, 'email_verification');

            return ApiResponse::error(
                'Email belum diverifikasi. Kode OTP baru telah dikirim ke email Anda.',
                403,
                ['email_verified' => false]
            );
        }

        $deviceName = $request->device_name ?? $request->userAgent() ?? 'web';
        $token = $user->createToken($deviceName)->plainTextToken;

        return ApiResponse::success(
            [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer',
            ],
            'Login berhasil.'
        );
    }

    public function me(Request $request)
    {
        $user = $request->user();

        $r2Url = rtrim(config('filesystems.disks.r2_public.url', ''), '/');

        $user->avatar = $user->avatar ? "{$r2Url}/{$user->avatar}" : null;

        return ApiResponse::success($request->user(), 'Data pengguna berhasil diambil.');
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return ApiResponse::success(null, 'Logout berhasil.');
    }

    public function logoutAllDevices(Request $request)
    {
        $request->user()->tokens()->delete();

        return ApiResponse::success(null, 'Logout dari semua perangkat berhasil.');
    }

    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $user = User::where('email', $request->email)->firstOrFail();

        $this->otpService->send($user, 'password_reset');

        return ApiResponse::success(
            ['email' => $user->email],
            'Kode OTP untuk reset password telah dikirim ke email Anda.'
        );
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $user = User::where('email', $request->email)->firstOrFail();

        $valid = $this->otpService->verify($user, $request->otp, 'password_reset');

        if (! $valid) {
            return ApiResponse::error('Kode OTP tidak valid atau sudah kadaluarsa.', 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        $user->tokens()->delete();

        return ApiResponse::success(null, 'Password berhasil direset. Silakan login kembali.');
    }
}
