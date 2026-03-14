<?php

use App\Http\Controllers\CityController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| MASTER DATA MODULE
|--------------------------------------------------------------------------
|
| All master data-related endpoints:
|   - Cities
|
| Middleware: auth, verified (where required)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'restrict_user'])->group(function () {
  Route::prefix('master-data')->name('master-data.')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | CITIES 
    |--------------------------------------------------------------------------
    | GET    /master-data/cities              -> List cities
    | GET    /master-data/cities/create       -> Show create form
    | POST   /master-data/cities              -> Store city
    | GET    /master-data/cities/{city}/edit  -> Show edit form
    | PATCH  /master-data/cities/{city}       -> Update city
    | DELETE /master-data/cities/{city}       -> Delete city
    |--------------------------------------------------------------------------
    */
    Route::prefix('cities')->name('cities.')->group(function () {

      Route::get('/', [CityController::class, 'index'])
        ->middleware('permission:view-master-cities')
        ->name('index');

      Route::get('/create', [CityController::class, 'create'])
        ->middleware('permission:create-master-cities')
        ->name('create');

      Route::post('/', [CityController::class, 'store'])
        ->middleware('permission:create-master-cities')
        ->name('store');

      Route::get('/{city}/edit', [CityController::class, 'edit'])
        ->middleware('permission:edit-master-cities')
        ->name('edit');

      Route::patch('/{city}', [CityController::class, 'update'])
        ->middleware('permission:edit-master-cities')
        ->name('update');

      Route::delete('/{city}', [CityController::class, 'destroy'])
        ->middleware('permission:delete-master-cities')
        ->name('destroy');
    });
  });
});
