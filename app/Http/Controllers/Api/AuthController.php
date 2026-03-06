<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Auth\ForgotPasswordRequest;
use App\Http\Requests\Api\Auth\LoginRequest;
use App\Http\Requests\Api\Auth\RegisterRequest;
use App\Http\Requests\Api\Auth\ResendOtpRequest;
use App\Http\Requests\Api\Auth\ResetPasswordRequest;
use App\Http\Requests\Api\Auth\VerifyEmailRequest;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(protected OtpService $otpService) {}

    /**
     * Register a new user and send an email verification OTP.
     */
    public function register(RegisterRequest $request)
    {
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'visitor',
        ]);

        $this->otpService->send($user, 'email_verification');

        return ApiResponse::success(
            ['email' => $user->email],
            'Registrasi berhasil. Kode OTP telah dikirim ke email Anda.',
            201
        );
    }

    /**
     * Verify the user's email using the OTP code.
     */
    public function verifyEmail(VerifyEmailRequest $request)
    {
        $user = User::where('email', $request->email)->firstOrFail();

        if ($user->hasVerifiedEmail()) {
            return ApiResponse::error('Email sudah terverifikasi sebelumnya.', 422);
        }

        $valid = $this->otpService->verify($user, $request->otp, 'email_verification');

        if (!$valid) {
            return ApiResponse::error('Kode OTP tidak valid atau sudah kadaluarsa.', 422);
        }

        $user->markEmailAsVerified();

        $deviceName = $request->device_name ?? $request->userAgent() ?? 'web';
        $token = $user->createToken($deviceName)->plainTextToken;

        return ApiResponse::success(
            [
                'user'       => $user,
                'token'      => $token,
                'token_type' => 'Bearer',
            ],
            'Email berhasil diverifikasi.'
        );
    }

    /**
     * Resend the email verification OTP.
     */
    public function resendVerificationOtp(ResendOtpRequest $request)
    {
        $user = User::where('email', $request->email)->firstOrFail();

        if ($user->hasVerifiedEmail()) {
            return ApiResponse::error('Email sudah terverifikasi.', 422);
        }

        $this->otpService->send($user, 'email_verification');

        return ApiResponse::success(null, 'Kode OTP baru telah dikirim ke email Anda.');
    }

    /**
     * Authenticate the user and return an access token.
     */
    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return ApiResponse::error('Email atau password salah.', 401);
        }

        if (!$user->hasVerifiedEmail()) {
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
                'user'       => $user,
                'token'      => $token,
                'token_type' => 'Bearer',
            ],
            'Login berhasil.'
        );
    }

    /**
     * Return the authenticated user's data.
     */
    public function me(Request $request)
    {
        return ApiResponse::success($request->user(), 'Data pengguna berhasil diambil.');
    }

    /**
     * Revoke the current access token (logout from current device).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return ApiResponse::success(null, 'Logout berhasil.');
    }

    /**
     * Revoke all access tokens (logout from all devices).
     */
    public function logoutAllDevices(Request $request)
    {
        $request->user()->tokens()->delete();

        return ApiResponse::success(null, 'Logout dari semua perangkat berhasil.');
    }

    /**
     * Send a password reset OTP to the user's email.
     */
    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $user = User::where('email', $request->email)->firstOrFail();

        $this->otpService->send($user, 'password_reset');

        return ApiResponse::success(
            ['email' => $user->email],
            'Kode OTP untuk reset password telah dikirim ke email Anda.'
        );
    }

    /**
     * Reset the user's password using a valid OTP.
     */
    public function resetPassword(ResetPasswordRequest $request)
    {
        $user = User::where('email', $request->email)->firstOrFail();

        $valid = $this->otpService->verify($user, $request->otp, 'password_reset');

        if (!$valid) {
            return ApiResponse::error('Kode OTP tidak valid atau sudah kadaluarsa.', 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        $user->tokens()->delete();

        return ApiResponse::success(null, 'Password berhasil direset. Silakan login kembali.');
    }
}
