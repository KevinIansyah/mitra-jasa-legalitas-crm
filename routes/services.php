<?php

use App\Http\Controllers\ServiceCategoryController;
use App\Http\Controllers\ServiceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'restrict_user'])->group(function () {

  /*
    |--------------------------------------------------------------------------
    | SERVICES
    |--------------------------------------------------------------------------
    */

  Route::prefix('services')->name('services.')->group(function () {
    Route::get('/',              [ServiceController::class, 'index'])->name('index')->middleware('permission:view-services');
    Route::get('/create',        [ServiceController::class, 'create'])->name('create')->middleware('permission:create-services');
    Route::post('/',             [ServiceController::class, 'store'])->name('store')->middleware('permission:create-services');
    Route::get('/{service}/edit', [ServiceController::class, 'edit'])->name('edit')->middleware('permission:edit-services');
    Route::delete('/{service}',  [ServiceController::class, 'destroy'])->name('destroy')->middleware('permission:delete-services');

    Route::prefix('{service}')->middleware('permission:edit-services')->group(function () {
      Route::post('/basic-information', [ServiceController::class, 'updateBasicInformation'])->name('update.basic-information');
      Route::patch('/content',          [ServiceController::class, 'updateContent'])->name('update.content');
      Route::patch('/packages',         [ServiceController::class, 'updatePackages'])->name('update.packages');
      Route::patch('/faqs',             [ServiceController::class, 'updateFaqs'])->name('update.faqs');
      Route::patch('/legal-bases',      [ServiceController::class, 'updateLegalBases'])->name('update.legal-bases');
      Route::patch('/requirements',     [ServiceController::class, 'updateRequirements'])->name('update.requirements');
      Route::patch('/process-steps',    [ServiceController::class, 'updateProcessSteps'])->name('update.process-steps');
    });

    /*
        |--------------------------------------------------------------------------
        | SERVICE CATEGORIES
        |--------------------------------------------------------------------------
        */

    Route::prefix('categories')->name('categories.')->group(function () {
      Route::get('/',                    [ServiceCategoryController::class, 'index'])->name('index')->middleware('permission:view-service-categories');
      Route::post('/',                   [ServiceCategoryController::class, 'store'])->name('store')->middleware('permission:create-service-categories');
      Route::get('/{category}/edit',     [ServiceCategoryController::class, 'edit'])->name('edit')->middleware('permission:edit-service-categories');
      Route::patch('/{category}',        [ServiceCategoryController::class, 'update'])->name('update')->middleware('permission:edit-service-categories');
      Route::delete('/{category}',       [ServiceCategoryController::class, 'destroy'])->name('destroy')->middleware('permission:delete-service-categories');
    });
  });
});
