<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API ROUTES
|--------------------------------------------------------------------------
| Entry point for all API routes.
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
| POST /auth/register                -> Register new user
| POST /auth/login                   -> Login
|
| POST /auth/verify-email            -> Verify email with OTP
| POST /auth/resend-verification-otp -> Resend verification OTP
|
| POST /auth/forgot-password         -> Send password reset link
| POST /auth/reset-password          -> Reset password
|
| Authenticated (auth:sanctum)
| GET  /auth/me                      -> Get current user
| POST /auth/logout                  -> Logout current device
| POST /auth/logout-all-devices      -> Logout all devices
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->name('auth.')->group(function () {

    Route::post('/register', [AuthController::class, 'register'])
        ->name('register');

    Route::post('/login', [AuthController::class, 'login'])
        ->name('login');

    Route::post('/verify-email', [AuthController::class, 'verifyEmail'])
        ->name('verify-email');

    Route::post('/resend-verification-otp', [AuthController::class, 'resendVerificationOtp'])
        ->name('resend-verification-otp');

    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
        ->name('forgot-password');

    Route::post('/reset-password', [AuthController::class, 'resetPassword'])
        ->name('reset-password');

    Route::middleware('auth:sanctum')->group(function () {

        Route::get('/me', [AuthController::class, 'me'])
            ->name('me');

        Route::post('/logout', [AuthController::class, 'logout'])
            ->name('logout');

        Route::post('/logout-all-devices', [AuthController::class, 'logoutAllDevices'])
            ->name('logout-all-devices');
    });
});
