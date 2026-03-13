<?php

use App\Http\Controllers\Services\ServiceCategoryController;
use App\Http\Controllers\Services\ServiceCityPageController;
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

      Route::patch('/seo', [ServiceController::class, 'updateSeo'])
        ->name('update.seo');
    });

    /*
    |--------------------------------------------------------------------------
    | SERVICE CITY PAGES
    |--------------------------------------------------------------------------
    | GET    /services/{service}/city-pages                   -> List city pages
    | POST   /services/{service}/city-pages                   -> Store city page
    | GET    /services/city-pages/{cityPage}/edit             -> Show edit form
    | PATCH  /services/{service}/city-pages/{cityPage}        -> Update city page
    | DELETE /services/{service}/city-pages/{cityPage}        -> Delete city page
    |
    | PATCH  /services/{service}/city-pages/{cityPage}/content      -> Update content
    | PATCH  /services/{service}/city-pages/{cityPage}/seo          -> Update SEO
    | PATCH  /services/{service}/city-pages/{cityPage}/publish      -> Publish city page
    | POST   /services/{service}/city-pages/{cityPage}/generate-ai  -> Generate AI content
    |--------------------------------------------------------------------------
    */

    Route::prefix('city-pages')->name('city-pages.')->group(function () {

      Route::get('/', [ServiceCityPageController::class, 'index'])
        ->middleware('permission:view-service-city-pages')
        ->name('index');

      Route::get('/create', [ServiceCityPageController::class, 'create'])
        ->middleware('permission:create-service-city-pages')
        ->name('create');

      Route::post('/', [ServiceCityPageController::class, 'store'])
        ->middleware('permission:create-service-city-pages')
        ->name('store');

      Route::get('/{cityPage}/edit', [ServiceCityPageController::class, 'edit'])
        ->middleware('permission:edit-service-city-pages')
        ->name('edit');

      Route::delete('/{cityPage}', [ServiceCityPageController::class, 'destroy'])
        ->middleware('permission:delete-service-city-pages')
        ->name('destroy');

      Route::prefix('{cityPage}')->middleware('permission:edit-service-city-pages')->group(function () {

        Route::patch('/content', [ServiceCityPageController::class, 'updateContent'])
          ->name('update.content');

        Route::patch('/seo', [ServiceCityPageController::class, 'updateSeo'])
          ->name('update.seo');

        Route::patch('/publish', [ServiceCityPageController::class, 'publish'])
          ->name('publish');

        Route::post('/generate-ai', [ServiceCityPageController::class, 'generateAi'])
          ->middleware('permission:generate-ai-content')
          ->name('generate-ai');
      });
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
