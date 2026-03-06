<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
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

    Route::patch('settings/profile', [ProfileController::class, 'update'])
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

    Route::get('settings/appearance', fn() => Inertia::render('settings/appearance'))
        ->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');
});
