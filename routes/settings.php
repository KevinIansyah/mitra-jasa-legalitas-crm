<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SiteController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| SETTINGS MODULE
|--------------------------------------------------------------------------
| All user settings-related endpoints:
|   - Profile
|   - Password
|   - Appearance
|   - Two-Factor Authentication
|
| Middleware: auth, verified (where required)
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| PROFILE (auth only)
|--------------------------------------------------------------------------
| GET   /settings          -> Redirect to profile
| GET   /settings/profile  -> Show profile edit form
| PATCH /settings/profile  -> Update profile
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->group(function () {

    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])
        ->name('profile.edit');

    Route::post('settings/profile', [ProfileController::class, 'update'])
        ->name('profile.update');
});

/*
|--------------------------------------------------------------------------
| PROFILE, PASSWORD, APPEARANCE, TWO-FACTOR (auth + verified)
|--------------------------------------------------------------------------
| DELETE /settings/profile      -> Delete profile
|
| GET    /settings/password     -> Show password edit form
| PUT    /settings/password     -> Update password (throttle: 6/min)
|
| GET    /settings/appearance   -> Show appearance settings
|
| GET    /settings/two-factor   -> Show two-factor authentication page
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {

    Route::delete('settings/profile', [ProfileController::class, 'destroy'])
        ->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])
        ->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', fn () => Inertia::render('settings/appearance'))
        ->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');
});

/*
|--------------------------------------------------------------------------
| SITE SETTINGS (auth + verified + restrict_user)
|--------------------------------------------------------------------------
| GET    /settings/site                   -> Redirect ke company
|
| GET    /settings/site/company           -> Halaman identitas perusahaan
| GET    /settings/site/operational       -> Halaman operasional
| GET    /settings/site/meta              -> Halaman default meta tags
| GET    /settings/site/organization      -> Halaman schema.org
| GET    /settings/site/stats             -> Halaman statistik
| GET    /settings/site/legal             -> Halaman informasi legal
| GET    /settings/site/bank              -> Halaman informasi bank
| GET    /settings/site/signer            -> Halaman TTD & stempel
| GET    /settings/site/document          -> Halaman kustomisasi dokumen
| GET    /settings/site/analytics         -> Halaman analytics & tracking
| GET    /settings/site/social            -> Halaman social media
| GET    /settings/site/maintenance       -> Halaman maintenance
| GET    /settings/site/chatbot           -> Halaman AI Chatbot
|
| PATCH  /settings/site/company           -> Update company identity
| PATCH  /settings/site/operational       -> Update operational info
| PATCH  /settings/site/meta              -> Update default meta tags
| PATCH  /settings/site/organization      -> Update schema.org config
| PATCH  /settings/site/stats             -> Update trust indicators
| PATCH  /settings/site/legal             -> Update legal information
| PATCH  /settings/site/bank              -> Update bank information
| PATCH  /settings/site/signer            -> Update signer & stamp
| PATCH  /settings/site/document          -> Update document settings
| PATCH  /settings/site/analytics         -> Update analytics & tracking
| PATCH  /settings/site/social            -> Update social media
| PATCH  /settings/site/maintenance       -> Update maintenance mode
| PATCH  /settings/site/chatbot           -> Update AI Chatbot
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'restrict_user'])->group(function () {
    Route::prefix('settings/site')->name('site-settings.')->group(function () {
        Route::redirect('/', '/settings/site/company');

        Route::middleware('permission:view-site-settings')->group(function () {
            Route::get('/company', [SiteController::class, 'company'])
                ->name('company');

            Route::get('/operational', [SiteController::class, 'operational'])
                ->name('operational');

            Route::get('/meta', [SiteController::class, 'meta'])
                ->name('meta');

            Route::get('/organization', [SiteController::class, 'organization'])
                ->name('organization');

            Route::get('/stats', [SiteController::class, 'stats'])
                ->name('stats');

            Route::get('/legal', [SiteController::class, 'legal'])
                ->name('legal');

            Route::get('/bank', [SiteController::class, 'bank'])
                ->name('bank');

            Route::get('/signer', [SiteController::class, 'signer'])
                ->name('signer');

            Route::get('/document', [SiteController::class, 'document'])
                ->name('document');

            Route::get('/analytics', [SiteController::class, 'analytics'])
                ->name('analytics');

            Route::get('/social', [SiteController::class, 'social'])
                ->name('social');

            Route::get('/maintenance', [SiteController::class, 'maintenance'])
                ->name('maintenance');

            Route::get('/chatbot', [SiteController::class, 'chatbot'])
                ->name('chatbot');
        });

        Route::middleware('permission:edit-site-settings')->group(function () {
            Route::post('/company', [SiteController::class, 'updateCompany'])
                ->name('update.company');

            Route::patch('/operational', [SiteController::class, 'updateOperational'])
                ->name('update.operational');

            Route::patch('/meta', [SiteController::class, 'updateMeta'])
                ->name('update.meta');

            Route::patch('/organization', [SiteController::class, 'updateOrganization'])
                ->name('update.organization');

            Route::patch('/stats', [SiteController::class, 'updateStats'])
                ->name('update.stats');

            Route::patch('/legal', [SiteController::class, 'updateLegal'])
                ->name('update.legal');

            Route::patch('/bank', [SiteController::class, 'updateBank'])
                ->name('update.bank');

            Route::post('/signer', [SiteController::class, 'updateSigner'])
                ->name('update.signer');

            Route::patch('/document', [SiteController::class, 'updateDocument'])
                ->name('update.document');

            Route::patch('/analytics', [SiteController::class, 'updateAnalytics'])
                ->name('update.analytics');

            Route::patch('/social', [SiteController::class, 'updateSocial'])
                ->name('update.social');

            Route::patch('/maintenance', [SiteController::class, 'updateMaintenance'])
                ->name('update.maintenance');

            Route::patch('/chatbot', [SiteController::class, 'updateChatbot'])
                ->name('update.chatbot');
        });
    });
});
