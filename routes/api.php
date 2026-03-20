<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PublicServiceController;
use App\Http\Controllers\Api\QuoteController;
use App\Http\Controllers\Finances\EstimateController;
use App\Http\Controllers\Finances\ProposalController;
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

/*
|--------------------------------------------------------------------------
| QUOTES
|--------------------------------------------------------------------------
| POST /quotes               -> Create quote
| GET /quotes                -> List quotes
| GET /quotes/{quote}        -> Show quote
| DELETE /quotes/{quote}     -> Delete quote
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum'])->group(function () {
    Route::prefix('quotes')->name('quotes.')->group(function () {
        Route::get('/', [QuoteController::class, 'index'])->name('index');
        Route::post('/', [QuoteController::class, 'store'])->name('store');
        Route::get('{quote}', [QuoteController::class, 'show'])->name('show');
    });
});

// Route::prefix('quotes')->name('quotes.')->group(function () {
//     Route::post('/', [QuoteController::class, 'store'])->name('store');
// });

/*
|--------------------------------------------------------------------------
| PAYMENTS
|--------------------------------------------------------------------------
| GET /invoices/{invoice}/payments              -> List payments
| POST /invoices/{invoice}/payments             -> Create payment
| DELETE /invoices/{invoice}/payments/{payment} -> Delete payment
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('invoices/{invoice}/payments')->group(function () {
        Route::get('/',    [PaymentController::class, 'index']);
        Route::post('/',   [PaymentController::class, 'store']);
        Route::delete('{payment}', [PaymentController::class, 'destroy']);
    });
});

/*
|--------------------------------------------------------------------------
| PROPOSALS
|--------------------------------------------------------------------------
| GET /proposals               -> List proposals
| GET /proposals/{proposal}    -> Show proposal
| PATCH /proposals/{proposal}/status -> Update proposal status
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('proposals')->group(function () {
        Route::get('/',                        [ProposalController::class, 'index']);
        Route::get('{proposal}',               [ProposalController::class, 'show']);
        Route::patch('{proposal}/status',      [ProposalController::class, 'updateStatus']);
    });
});

/*
|--------------------------------------------------------------------------
| ESTIMATES
|--------------------------------------------------------------------------
| GET /estimates               -> List estimates
| GET /estimates/{estimate}    -> Show estimate
| PATCH /estimates/{estimate}/status -> Update estimate status
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('estimates')->group(function () {
        Route::get('/',                        [EstimateController::class, 'index']);
        Route::get('{estimate}',               [EstimateController::class, 'show']);
        Route::patch('{estimate}/status',      [EstimateController::class, 'updateStatus']);
    });
});

/*
|--------------------------------------------------------------------------
| PUBLIC SERVICE API ROUTES
|--------------------------------------------------------------------------
| GET /layanan                          → List all services
| GET /layanan/kategori/{categorySlug}  → List services by category
| GET /layanan/kota/{citySlug}          → List services by city
| GET /layanan/{serviceSlug}/{citySlug} → Service details for a specific city
| GET /layanan/{serviceSlug}            → Service details 
|--------------------------------------------------------------------------
*/

Route::prefix('layanan')->group(function () {
    Route::get('/',                              [PublicServiceController::class, 'index']);
    Route::get('/kategori/{categorySlug}',       [PublicServiceController::class, 'byCategory']);
    Route::get('/kota/{citySlug}',               [PublicServiceController::class, 'byCity']);
    Route::get('/{serviceSlug}/{citySlug}',      [PublicServiceController::class, 'showCityPage']);
    Route::get('/{serviceSlug}',                 [PublicServiceController::class, 'show']);
});
