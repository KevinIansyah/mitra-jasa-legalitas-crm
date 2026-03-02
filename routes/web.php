<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SearchController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'restrict_user'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | DASHBOARD
    |--------------------------------------------------------------------------
    */

    Route::get('/', [DashboardController::class, 'index'])->name('dashboard.index');

    /*
    |--------------------------------------------------------------------------
    | ROLES
    |--------------------------------------------------------------------------
    */

    Route::prefix('roles')->name('roles.')->group(function () {
        Route::get('/',              [RoleController::class, 'index'])->name('index')->middleware('permission:view-roles');
        Route::post('/',             [RoleController::class, 'store'])->name('store')->middleware('permission:create-roles');
        Route::get('/{role}/edit',   [RoleController::class, 'edit'])->name('edit')->middleware('permission:edit-roles');
        Route::patch('/{role}',      [RoleController::class, 'update'])->name('update')->middleware('permission:edit-roles');
        Route::delete('/{role}',     [RoleController::class, 'destroy'])->name('destroy')->middleware('permission:delete-roles');

        Route::prefix('{role}/permissions')->name('permission.')->middleware('permission:edit-permissions')->group(function () {
            Route::get('/edit',   [RoleController::class, 'editPermission'])->name('edit');
            Route::put('/update', [RoleController::class, 'updatePermission'])->name('update');
        });
    });

    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    Route::prefix('search')->name('search.')->group(function () {
        Route::get('/customers',                      [SearchController::class, 'searchCustomer'])->name('customers');
        Route::get('/customers/{customer}/companies', [SearchController::class, 'searchCompanyByCustomerId'])->name('companies.by-customer-id');
        Route::get('/services/{service}/packages',    [SearchController::class, 'searchPackagesByServiceId'])->name('packages.by-service-id');
        Route::get('/services/{service}/templates',   [SearchController::class, 'searchTemplatesByServiceId'])->name('templates.by-service-id');
        Route::get('/users/staff',                    [SearchController::class, 'searchUserStaff'])->name('users.staff');
        Route::get('/projects',                [SearchController::class, 'seachProject'])->name('projects');
    });
});

/*
|--------------------------------------------------------------------------
| FILE ACCESS (PRIVATE)
|--------------------------------------------------------------------------
*/

Route::get('/files/{path}', [FileController::class, 'show'])
    ->where('path', '.*')
    ->middleware(['auth', 'verified', 'permission:view-projects']);

/*
|--------------------------------------------------------------------------
| R2 STORAGE (Testing)
|--------------------------------------------------------------------------
*/

Route::prefix('test-r2')->group(function () {
    Route::get('/upload', function () {
        try {
            Storage::disk('r2_public')->put('test/test-file.txt', 'Test file content from Laravel');
            return 'File uploaded successfully! Path: test/test-file.txt';
        } catch (\Exception $e) {
            return 'Error: ' . $e->getMessage();
        }
    });

    Route::get('/read', function () {
        try {
            $path = 'test/test-file.txt';
            return Storage::disk('r2_public')->exists($path)
                ? 'File content: ' . Storage::disk('r2_public')->get($path)
                : 'File not found';
        } catch (\Exception $e) {
            return 'Error: ' . $e->getMessage();
        }
    });

    Route::get('/delete', function () {
        try {
            Storage::disk('r2')->delete('projects/1/expenses/1771752214_notebook-used-by-ai-it-experts-close-up (1).jpg');
            return 'File deleted successfully!';
        } catch (\Exception $e) {
            return 'Error: ' . $e->getMessage();
        }
    });

    // Route::get('/url', function () {
    //     try {
    //         return 'File URL: ' . Storage::disk('r2')->url('test/test-file.txt');
    //     } catch (\Exception $e) {
    //         return 'Error: ' . $e->getMessage();
    //     }
    // });
});

/*
|--------------------------------------------------------------------------
| ADDITIONAL ROUTE FILES
|--------------------------------------------------------------------------
*/

require __DIR__ . '/settings.php';
require __DIR__ . '/contacts.php';
require __DIR__ . '/services.php';
require __DIR__ . '/projects.php';
require __DIR__ . '/finances.php';
