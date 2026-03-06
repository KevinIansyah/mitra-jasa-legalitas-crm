<?php

use App\Http\Controllers\Services\ServiceCategoryController;
use App\Http\Controllers\Services\ServiceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SERVICES MODULE
|--------------------------------------------------------------------------
| All service-related endpoints:
|   - Services
|   - Service Categories
|
| Middleware: auth, verified, restrict_user
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'restrict_user'])->group(function () {

  /*
    |--------------------------------------------------------------------------
    | SERVICES
    |--------------------------------------------------------------------------
    | GET    /services                -> List services
    | GET    /services/create         -> Show create form
    | POST   /services                -> Store service
    | GET    /services/{service}/edit -> Show edit form
    | DELETE /services/{service}      -> Delete service
    |
    | Service Content Management
    | POST   /services/{service}/basic-information  -> Update basic information
    | PATCH  /services/{service}/content            -> Update content
    | PATCH  /services/{service}/packages           -> Update packages
    | PATCH  /services/{service}/faqs               -> Update FAQs
    | PATCH  /services/{service}/legal-bases        -> Update legal bases
    | PATCH  /services/{service}/requirements       -> Update requirements
    | PATCH  /services/{service}/process-steps      -> Update process steps
    |--------------------------------------------------------------------------
    */

  Route::prefix('services')->name('services.')->group(function () {

    Route::get('/', [ServiceController::class, 'index'])
      ->middleware('permission:view-services')
      ->name('index');

    Route::get('/create', [ServiceController::class, 'create'])
      ->middleware('permission:create-services')
      ->name('create');

    Route::post('/', [ServiceController::class, 'store'])
      ->middleware('permission:create-services')
      ->name('store');

    Route::get('/{service}/edit', [ServiceController::class, 'edit'])
      ->middleware('permission:edit-services')
      ->name('edit');

    Route::delete('/{service}', [ServiceController::class, 'destroy'])
      ->middleware('permission:delete-services')
      ->name('destroy');

    Route::prefix('{service}')->middleware('permission:edit-services')->group(function () {

      Route::post('/basic-information', [ServiceController::class, 'updateBasicInformation'])
        ->name('update.basic-information');

      Route::patch('/content', [ServiceController::class, 'updateContent'])
        ->name('update.content');

      Route::patch('/packages', [ServiceController::class, 'updatePackages'])
        ->name('update.packages');

      Route::patch('/faqs', [ServiceController::class, 'updateFaqs'])
        ->name('update.faqs');

      Route::patch('/legal-bases', [ServiceController::class, 'updateLegalBases'])
        ->name('update.legal-bases');

      Route::patch('/requirements', [ServiceController::class, 'updateRequirements'])
        ->name('update.requirements');

      Route::patch('/process-steps', [ServiceController::class, 'updateProcessSteps'])
        ->name('update.process-steps');
    });


    /*
        |--------------------------------------------------------------------------
        | SERVICE CATEGORIES
        |--------------------------------------------------------------------------
        | GET    /services/categories                  -> List categories
        | POST   /services/categories                  -> Store category
        | GET    /services/categories/{category}/edit  -> Show edit form
        | PATCH  /services/categories/{category}       -> Update category
        | DELETE /services/categories/{category}       -> Delete category
        |--------------------------------------------------------------------------
        */

    Route::prefix('categories')->name('categories.')->group(function () {

      Route::get('/', [ServiceCategoryController::class, 'index'])
        ->middleware('permission:view-service-categories')
        ->name('index');

      Route::post('/', [ServiceCategoryController::class, 'store'])
        ->middleware('permission:create-service-categories')
        ->name('store');

      Route::get('/{category}/edit', [ServiceCategoryController::class, 'edit'])
        ->middleware('permission:edit-service-categories')
        ->name('edit');

      Route::patch('/{category}', [ServiceCategoryController::class, 'update'])
        ->middleware('permission:edit-service-categories')
        ->name('update');

      Route::delete('/{category}', [ServiceCategoryController::class, 'destroy'])
        ->middleware('permission:delete-service-categories')
        ->name('destroy');
    });
  });
});
