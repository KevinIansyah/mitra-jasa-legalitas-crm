<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BlogCategoryController;
use App\Http\Controllers\Api\BlogSubscriberController;
use App\Http\Controllers\Api\ChatbotController;
use App\Http\Controllers\Api\CityController;
use App\Http\Controllers\Api\ClientEstimateController;
use App\Http\Controllers\Api\ClientInvoiceController;
use App\Http\Controllers\Api\ClientNotificationController;
use App\Http\Controllers\Api\ClientPaymentController;
use App\Http\Controllers\Api\ClientProfileController;
use App\Http\Controllers\Api\ClientProjectController;
use App\Http\Controllers\Api\ClientProjectDeliverableController;
use App\Http\Controllers\Api\ClientProjectDocumentController;
use App\Http\Controllers\Api\ClientProposalController;
use App\Http\Controllers\Api\ClientQuoteController;
use App\Http\Controllers\Api\CompanyInformationController;
use App\Http\Controllers\Api\ContactMessageController;
use App\Http\Controllers\Api\PublicBlogController;
use App\Http\Controllers\Api\PublicHomeController;
use App\Http\Controllers\Api\PublicNavigationController;
use App\Http\Controllers\Api\PublicServiceController;
use App\Http\Controllers\Api\ServiceCategoryController;
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
        Route::get('/', [ClientQuoteController::class, 'index'])
            ->name('index');

        Route::post('/', [ClientQuoteController::class, 'store'])
            ->name('store');

        Route::get('{quote}', [ClientQuoteController::class, 'show'])
            ->name('show');
    });
});

/*
|--------------------------------------------------------------------------
| INVOICES & PAYMENTS (CLIENT PORTAL)
|--------------------------------------------------------------------------
| GET    /invoices                              -> list invoices customer
| GET    /invoices/{invoice}                    -> detail invoice customer
| GET    /invoices/{invoice}/payments           -> list payments invoice customer
| POST   /invoices/{invoice}/payments           -> create payment invoice customer
| POST   /invoices/{invoice}/payments/{payment} -> update payment invoice customer
| DELETE /invoices/{invoice}/payments/{payment} -> delete payment invoice customer
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum'])->group(function () {

    Route::get('/invoices', [ClientInvoiceController::class, 'index'])
        ->name('client.invoices.index');
});

Route::middleware(['auth:sanctum', 'customer.owns.invoice'])->group(function () {

    Route::get('/invoices/{invoice}', [ClientInvoiceController::class, 'show'])
        ->name('client.invoices.show');

    Route::prefix('invoices/{invoice}/payments')->name('invoices.payments.')->group(function () {

        Route::get('/', [ClientPaymentController::class, 'index'])
            ->name('index');

        Route::post('/', [ClientPaymentController::class, 'store'])
            ->name('store');

        Route::post('{payment}', [ClientPaymentController::class, 'update'])
            ->name('update');

        Route::delete('{payment}', [ClientPaymentController::class, 'destroy'])
            ->name('destroy');
    });
});

/*
|--------------------------------------------------------------------------
| PROPOSALS
|--------------------------------------------------------------------------
| GET /proposals                        -> List proposals
| GET /proposals/{proposal}             -> Show proposal
| PATCH /proposals/{proposal}/status    -> Update proposal status
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('proposals')->name('proposals.')->group(function () {

        Route::get('/', [ClientProposalController::class, 'index'])
            ->name('index');

        Route::middleware('customer.owns.proposal')->group(function () {

            Route::get('{proposal}', [ClientProposalController::class, 'show'])
                ->name('show');

            Route::patch('{proposal}/status', [ClientProposalController::class, 'updateStatus'])
                ->name('update-status');
        });
    });
});

/*
|--------------------------------------------------------------------------
| PROJECTS (CUSTOMER / PORTAL)
|--------------------------------------------------------------------------
| GET  /projects                         -> Daftar proyek milik user yang login
| GET  /projects/{project}               -> Detail proyek (middleware: milik customer)
| GET  /projects/{project}/documents     -> Daftar dokumen
| POST /projects/{project}/documents/{document}/upload -> Unggah / unggah ulang (setelah ditolak)
| GET  /projects/{project}/documents/{document}/download      -> Stream file (dekripsi di server jika perlu)
| GET  /projects/{project}/deliverables/{deliverable}/download -> Stream hasil akhir (dekripsi di server jika perlu)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/projects', [ClientProjectController::class, 'index'])
        ->name('client.projects.index');

    Route::middleware('customer.owns.project')->group(function () {

        Route::get('/projects/{project}', [ClientProjectController::class, 'show'])->name('client.projects.show');

        Route::post('/projects/{project}/documents/{document}/upload', [ClientProjectDocumentController::class, 'upload'])
            ->name('client.projects.documents.upload');

        Route::get('/projects/{project}/documents/{document}/download', [ClientProjectDocumentController::class, 'download'])
            ->name('client.projects.documents.download');

        Route::get('/projects/{project}/deliverables/{deliverable}/download', [ClientProjectDeliverableController::class, 'download'])
            ->name('client.projects.deliverables.download');
    });
});

/*
|--------------------------------------------------------------------------
| ESTIMATES
|--------------------------------------------------------------------------
| GET /estimates                        -> List estimates
| GET /estimates/{estimate}             -> Show estimate (middleware: customer.can.access.estimate)
| PATCH /estimates/{estimate}/status    -> Update estimate status
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('estimates')->name('estimates.')->group(function () {
        Route::get('/', [ClientEstimateController::class, 'index'])
            ->name('index');

        Route::middleware('customer.can.access.estimate')->group(function () {

            Route::get('{estimate}', [ClientEstimateController::class, 'show'])
                ->name('show');

            Route::patch('{estimate}/status', [ClientEstimateController::class, 'updateStatus'])
                ->name('update-status');
        });
    });
});

/*
|--------------------------------------------------------------------------
| UPDATE PROFILE
|--------------------------------------------------------------------------
| POST /settings/profile               -> Update profile
| PUT /settings/password               -> Update password
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum'])->group(function () {
    Route::prefix('settings')->name('settings.')->group(function () {

        Route::post('/profile', [ClientProfileController::class, 'updateProfile'])
            ->name('profile');

        Route::put('/password', [ClientProfileController::class, 'updatePassword'])
            ->name('password');
    });
});

/*
|--------------------------------------------------------------------------
| NOTIFICATIONS (authenticated)
|--------------------------------------------------------------------------
| GET  /notifications/unread-count     -> Hanya { unread_count }
| GET  /notifications?per_page=20&unread_only=1  -> Daftar + meta + unread_count
| POST /notifications/{id}/read        -> Baca satu; response sertakan unread_count terbaru
| POST /notifications/read-all         -> Baca semua; unread_count = 0
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum'])->prefix('notifications')->name('api.notifications.')->group(function () {

    Route::get('/unread-count', [ClientNotificationController::class, 'unreadCount'])
        ->name('unread-count');

    Route::post('/read-all', [ClientNotificationController::class, 'readAll'])
        ->name('read-all');

    Route::get('/', [ClientNotificationController::class, 'index'])
        ->name('index');

    Route::post('{id}/read', [ClientNotificationController::class, 'read'])
        ->name('read');
});

/*
|--------------------------------------------------------------------------
| PUBLIC HOME / BERANDA
|--------------------------------------------------------------------------
| GET /home                          → Home page data (stats, services, SEO, etc.)
| GET /navigation                    → Global navigation data (service categories, services per category, etc.)
|--------------------------------------------------------------------------
*/

Route::get('/home', [PublicHomeController::class, 'index']);
Route::get('/navigation', [PublicNavigationController::class, 'index'])->name('navigation');

/*
|--------------------------------------------------------------------------
| PUBLIC SERVICE API ROUTES
|--------------------------------------------------------------------------
| GET /services                                  → List all services
| GET /services/categories/{categorySlug}        → List services by category
| GET /services/cities/{citySlug}                → List services by city
| GET /services/{serviceSlug}/{citySlug}         → Service details for a specific city
| GET /services/{serviceSlug}                    → Service details
|--------------------------------------------------------------------------
*/

Route::prefix('services')->group(function () {
    Route::get('/', [PublicServiceController::class, 'index']);

    Route::get('/categories/{categorySlug}', [PublicServiceController::class, 'byCategory']);
    Route::get('/cities/{citySlug}', [PublicServiceController::class, 'byCity']);

    Route::get('/{serviceSlug}/{citySlug}', [PublicServiceController::class, 'showCityPage']);

    Route::get('/{serviceSlug}', [PublicServiceController::class, 'show'])
        ->where('serviceSlug', '^(?!categories|cities)[a-z0-9\-]+$');
});

/*
|--------------------------------------------------------------------------
| PUBLIC BLOG API ROUTES
|--------------------------------------------------------------------------
| GET  /blogs                                    → List all blogs
| POST /blogs/subscribers                        → Subscribe to blog
| GET  /blogs/subscribers/verify/{token}         → Verify blog subscription
| GET  /blogs/subscribers/unsubscribe/{token}    → Unsubscribe from blog
| GET  /blogs/{blogSlug}                         → Blog details
|--------------------------------------------------------------------------
*/

Route::prefix('blogs')->group(function () {

    Route::get('/', [PublicBlogController::class, 'index']);

    Route::post('/subscribers', [BlogSubscriberController::class, 'subscribe']);

    Route::get('/subscribers/verify/{token}', [BlogSubscriberController::class, 'verify']);

    Route::get('/subscribers/unsubscribe/{token}', [BlogSubscriberController::class, 'unsubscribe']);

    Route::get('/{blogSlug}', [PublicBlogController::class, 'show'])
        ->where('blogSlug', '^(?!subscribers)[a-z0-9\-]+$');
});

/*
|--------------------------------------------------------------------------
| CHATBOT API ROUTES
|--------------------------------------------------------------------------
| POST  /chatbots/session              → Get session
| POST  /chatbots/{sessionToken}/send  → Send message
| PATCH /chatbots/{sessionToken}/lead  → Update lead data
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
| POST /contact-messages               -> Create contact message
|--------------------------------------------------------------------------
*/

Route::prefix('contact-messages')->group(function () {

    Route::post('/', [ContactMessageController::class, 'store']);
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
