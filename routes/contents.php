<?php

use App\Http\Controllers\Contents\ClientCompanyController;
use App\Http\Controllers\Contents\ClientSuccessStoryController;
use App\Http\Controllers\Contents\FaqController;
use App\Http\Controllers\Contents\TestimonialController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| CONTENTS MODULE
|--------------------------------------------------------------------------
| Konten situs (FAQ, dll.) dengan prefix /contents/...
|
| Middleware: auth, verified, restrict_user
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'restrict_user'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | FAQ (Global)
    |--------------------------------------------------------------------------
    | GET    /contents/faqs           -> List
    | POST   /contents/faqs           -> Store
    | PATCH  /contents/faqs/{faq}    -> Update
    | DELETE /contents/faqs/{faq}    -> Destroy
    |--------------------------------------------------------------------------
    */

    Route::prefix('contents/faqs')->name('contents.faqs.')->group(function () {

        Route::get('/', [FaqController::class, 'index'])
            ->middleware('permission:view-content-faqs')
            ->name('index');

        Route::post('/', [FaqController::class, 'store'])
            ->middleware('permission:create-content-faqs')
            ->name('store');

        Route::patch('/{faq}', [FaqController::class, 'update'])
            ->middleware('permission:edit-content-faqs')
            ->name('update');

        Route::delete('/{faq}', [FaqController::class, 'destroy'])
            ->middleware('permission:delete-content-faqs')
            ->name('destroy');
    });

    /*
    |--------------------------------------------------------------------------
    | TESTIMONIALS
    |--------------------------------------------------------------------------
    | GET    /contents/testimonials              -> List
    | POST   /contents/testimonials              -> Store
    | PATCH  /contents/testimonials/{testimonial} -> Update
    | DELETE /contents/testimonials/{testimonial} -> Destroy
    |--------------------------------------------------------------------------
    */

    Route::prefix('contents/testimonials')->name('contents.testimonials.')->group(function () {

        Route::get('/', [TestimonialController::class, 'index'])
            ->middleware('permission:view-content-testimonials')
            ->name('index');

        Route::post('/', [TestimonialController::class, 'store'])
            ->middleware('permission:create-content-testimonials')
            ->name('store');

        Route::post('/{testimonial}', [TestimonialController::class, 'update'])
            ->middleware('permission:edit-content-testimonials')
            ->name('update');

        Route::delete('/{testimonial}', [TestimonialController::class, 'destroy'])
            ->middleware('permission:delete-content-testimonials')
            ->name('destroy');
    });

    /*
    |--------------------------------------------------------------------------
    | CLIENT COMPANIES (logo klien)
    |--------------------------------------------------------------------------
    | GET    /contents/client-companies              -> List
    | POST   /contents/client-companies              -> Store
    | POST   /contents/client-companies/{client_company} -> Update
    | DELETE /contents/client-companies/{client_company} -> Destroy
    |--------------------------------------------------------------------------
    */

    Route::prefix('contents/client-companies')->name('contents.client-companies.')->group(function () {

        Route::get('/', [ClientCompanyController::class, 'index'])
            ->middleware('permission:view-content-client-companies')
            ->name('index');

        Route::post('/', [ClientCompanyController::class, 'store'])
            ->middleware('permission:create-content-client-companies')
            ->name('store');

        Route::post('/{client_company}', [ClientCompanyController::class, 'update'])
            ->middleware('permission:edit-content-client-companies')
            ->name('update');

        Route::delete('/{client_company}', [ClientCompanyController::class, 'destroy'])
            ->middleware('permission:delete-content-client-companies')
            ->name('destroy');
    });

    /*
    |--------------------------------------------------------------------------
    | CLIENT SUCCESS STORIES
    |--------------------------------------------------------------------------
    | GET    /contents/client-success-stories                    -> List
    | POST   /contents/client-success-stories                    -> Store
    | PATCH  /contents/client-success-stories/{client_success_story} -> Update
    | DELETE /contents/client-success-stories/{client_success_story} -> Destroy
    |--------------------------------------------------------------------------
    */

    Route::prefix('contents/client-success-stories')->name('contents.client-success-stories.')->group(function () {

        Route::get('/', [ClientSuccessStoryController::class, 'index'])
            ->middleware('permission:view-content-client-success-stories')
            ->name('index');

        Route::post('/', [ClientSuccessStoryController::class, 'store'])
            ->middleware('permission:create-content-client-success-stories')
            ->name('store');

        Route::post('/{client_success_story}', [ClientSuccessStoryController::class, 'update'])
            ->middleware('permission:edit-content-client-success-stories')
            ->name('update');

        Route::delete('/{client_success_story}', [ClientSuccessStoryController::class, 'destroy'])
            ->middleware('permission:delete-content-client-success-stories')
            ->name('destroy');
    });
});
