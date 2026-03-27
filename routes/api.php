<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BlogCategoryController;
use App\Http\Controllers\Api\BlogSubscriberController;
use App\Http\Controllers\Api\ChatbotController;
use App\Http\Controllers\Api\ContactMessageController;
use App\Http\Controllers\Api\EstimateController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProposalController;
use App\Http\Controllers\Api\PublicBlogController;
use App\Http\Controllers\Api\PublicHomeController;
use App\Http\Controllers\Api\PublicNavigationController;
use App\Http\Controllers\Api\PublicServiceController;
use App\Http\Controllers\Api\QuoteController;
use App\Http\Controllers\Api\ServiceCategoryController;
use App\Http\Controllers\Api\CityController;
use App\Http\Controllers\Api\CompanyInformationController;
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
        ->middleware('throttle:5,1')
        ->name('resend-verification-otp');

    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
        ->middleware('throttle:5,1')
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
        Route::get('/', [PaymentController::class, 'index']);
        Route::post('/', [PaymentController::class, 'store']);
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
        Route::get('/', [ProposalController::class, 'index']);
        Route::get('{proposal}', [ProposalController::class, 'show']);
        Route::patch('{proposal}/status', [ProposalController::class, 'updateStatus']);
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
        Route::get('/', [EstimateController::class, 'index']);
        Route::get('{estimate}', [EstimateController::class, 'show']);
        Route::patch('{estimate}/status', [EstimateController::class, 'updateStatus']);
    });
});

/*
|--------------------------------------------------------------------------
| PUBLIC HOME / BERANDA
|--------------------------------------------------------------------------
| GET /home                          → Data halaman beranda (stats, layanan, SEO, dll.)
| GET /navigation                    → Data navigasi global: kategori layanan + layanan per kategori, layanan unggulan, WhatsApp CTA, dan social media.
|--------------------------------------------------------------------------
*/

Route::get('/home', [PublicHomeController::class, 'index']);
Route::get('/navigation', [PublicNavigationController::class, 'index'])->name('navigation');

/*
|--------------------------------------------------------------------------
| PUBLIC SERVICE API ROUTES
|--------------------------------------------------------------------------
| GET /services                          → List all services
| GET /services/categories/{categorySlug}  → List services by category
| GET /services/cities/{citySlug}          → List services by city
| GET /services/{serviceSlug}/{citySlug} → Service details for a specific city
| GET /services/{serviceSlug}            → Service details
|--------------------------------------------------------------------------
*/

Route::prefix('services')->group(function () {
    Route::get('/', [PublicServiceController::class, 'index']);
    Route::get('/categories/{categorySlug}', [PublicServiceController::class, 'byCategory']);
    Route::get('/cities/{citySlug}', [PublicServiceController::class, 'byCity']);
    Route::get('/{serviceSlug}/{citySlug}', [PublicServiceController::class, 'showCityPage']);
    Route::get('/{serviceSlug}', [PublicServiceController::class, 'show']);
});

/*
|--------------------------------------------------------------------------
| PUBLIC BLOG API ROUTES
|--------------------------------------------------------------------------
| GET /blogs                          → List all blogs
| GET /blogs/{blogSlug}            → Blog details
|--------------------------------------------------------------------------
*/

Route::prefix('blogs')->group(function () {
    Route::get('/', [PublicBlogController::class, 'index']);
    Route::get('/{blogSlug}', [PublicBlogController::class, 'show']);
});

/*
|--------------------------------------------------------------------------
| CHATBOT API ROUTES
|--------------------------------------------------------------------------
| POST  /api/chatbots/session              → Buat / ambil sesi
| POST  /api/chatbots/{sessionToken}/send  → Kirim pesan
| PATCH /api/chatbots/{sessionToken}/lead  → Update data lead
|--------------------------------------------------------------------------
*/

Route::prefix('chatbots')->group(function () {
    Route::post('/session', [ChatbotController::class, 'session']);
    Route::post('/{sessionToken}/send', [ChatbotController::class, 'send']);
    Route::patch('/{sessionToken}/lead', [ChatbotController::class, 'updateLead']);
});

/*
|--------------------------------------------------------------------------
| CONTACT MESSAGES API ROUTES
|--------------------------------------------------------------------------
| POST /api/contact-messages               -> Create contact message
|--------------------------------------------------------------------------
*/

Route::prefix('contact-messages')->group(function () {
    Route::post('/', [ContactMessageController::class, 'store']);
});

/*
|--------------------------------------------------------------------------
| BLOG SUBSCRIBER API ROUTES
|--------------------------------------------------------------------------
| POST /api/blog/subscribers               -> Subscribe to blog
| GET /api/blog/subscribers/verify/{token} -> Verify blog subscription
| GET /api/blog/subscribers/unsubscribe/{token}      -> Unsubscribe from blog
|--------------------------------------------------------------------------
*/

Route::prefix('blogs')->group(function () {
    Route::post('/subscribers', [BlogSubscriberController::class, 'subscribe']);
    Route::get('/subscribers/verify/{token}', [BlogSubscriberController::class, 'verify']);
    Route::get('/subscribers/unsubscribe/{token}', [BlogSubscriberController::class, 'unsubscribe']);
});


/*
|--------------------------------------------------------------------------
| PUBLIC 
|--------------------------------------------------------------------------
| GET /cities                          → List all cities
| GET /blog-categories                 → List all blog categories
| GET /service-categories              → List all service categories
| GET /company-information             → Company information
|--------------------------------------------------------------------------
*/

Route::prefix('cities')->group(function () {
    Route::get('/', [CityController::class, 'index']);
});

Route::prefix('blog-categories')->group(function () {
    Route::get('/', [BlogCategoryController::class, 'index']);
});

Route::prefix('service-categories')->group(function () {
    Route::get('/', [ServiceCategoryController::class, 'index']);
});

Route::prefix('company-information')->group(function () {
    Route::get('/', [CompanyInformationController::class, 'index']);
});

