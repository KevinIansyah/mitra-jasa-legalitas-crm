<?php

use App\Http\Controllers\StaffController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| STAFF MODULE
|--------------------------------------------------------------------------
| All staff-related endpoints:
|   - Staff
|   - My Tasks
|   - My Projects
|
| Middleware: auth, verified, restrict_user
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'restrict_user'])->group(function () {


  /*
    |--------------------------------------------------------------------------
    | STAFF
    |--------------------------------------------------------------------------
    | GET    /staff/staff                     -> List staff
    | GET    /staff/staff/create              -> Show create form
    | POST   /staff/staff                     -> Store staff
    | GET    /staff/{staff}/edit              -> Show edit form
    | PUT    /staff/{staff}                   -> Update staff
    | DELETE /staff/{staff}                   -> Delete staff
    | GET    /staff/{staff}/my-projects       -> My projects
    | GET    /staff/{staff}/my-tasks          -> My tasks
    |
    |--------------------------------------------------------------------------
    */

  Route::prefix('staff')->name('staff.')->group(function () {

    Route::get('/', [StaffController::class, 'index'])
      ->middleware('permission:view-staff')
      ->name('index');

    Route::get('/create', [StaffController::class, 'create'])
      ->middleware('permission:create-staff')
      ->name('create');

    Route::post('/', [StaffController::class, 'store'])
      ->middleware('permission:create-staff')
      ->name('store');

    Route::prefix('{staff}')->group(function () {
      Route::get('/edit', [StaffController::class, 'edit'])
        ->middleware('permission:edit-staff')
        ->name('edit');

      Route::put('/', [StaffController::class, 'update'])
        ->middleware('permission:edit-staff')
        ->name('update');

      Route::delete('/', [StaffController::class, 'destroy'])
        ->middleware('permission:delete-staff')
        ->name('destroy');

      Route::get('/my-projects', [StaffController::class, 'myProjects'])
        ->middleware('permission:view-staff-my-project')
        ->name('my-projects');

      Route::get('/my-tasks', [StaffController::class, 'myTasks'])
        ->middleware('permission:view-staff-my-task')
        ->name('my-tasks');
    });
  });
});
