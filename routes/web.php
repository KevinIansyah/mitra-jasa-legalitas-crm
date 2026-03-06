<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SearchController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

/*
|--------------------------------------------------------------------------
| WEB ROUTES
|--------------------------------------------------------------------------
| Entry point for all web routes. Additional module route files are
| required at the bottom of this file.
|
| Middleware: auth, verified, restrict_user (where required)
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
| GET / -> Dashboard
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'restrict_user'])->group(function () {

    Route::get('/', [DashboardController::class, 'index'])
        ->name('dashboard.index');


    /*
    |--------------------------------------------------------------------------
    | ROLES
    |--------------------------------------------------------------------------
    | GET    /roles                          -> List roles
    | POST   /roles                          -> Store role
    | GET    /roles/{role}/edit              -> Show edit form
    | PATCH  /roles/{role}                   -> Update role
    | DELETE /roles/{role}                   -> Delete role
    |
    | GET    /roles/{role}/permissions/edit  -> Show permissions edit form
    | PUT    /roles/{role}/permissions/update -> Update permissions
    |--------------------------------------------------------------------------
    */

    Route::prefix('roles')->name('roles.')->group(function () {

        Route::get('/', [RoleController::class, 'index'])
            ->middleware('permission:view-roles')
            ->name('index');

        Route::post('/', [RoleController::class, 'store'])
            ->middleware('permission:create-roles')
            ->name('store');

        Route::get('/{role}/edit', [RoleController::class, 'edit'])
            ->middleware('permission:edit-roles')
            ->name('edit');

        Route::patch('/{role}', [RoleController::class, 'update'])
            ->middleware('permission:edit-roles')
            ->name('update');

        Route::delete('/{role}', [RoleController::class, 'destroy'])
            ->middleware('permission:delete-roles')
            ->name('destroy');

        Route::prefix('{role}/permissions')->name('permission.')->middleware('permission:edit-permissions')->group(function () {

            Route::get('/edit', [RoleController::class, 'editPermission'])
                ->name('edit');

            Route::put('/update', [RoleController::class, 'updatePermission'])
                ->name('update');
        });
    });


    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    | GET /search/customers                             -> Search customers
    | GET /search/customers/{customer}/companies        -> Search companies by customer
    | GET /search/services/{service}/packages           -> Search packages by service
    | GET /search/services/{service}/templates          -> Search templates by service
    | GET /search/users/staff                           -> Search staff users
    | GET /search/projects                              -> Search projects
    | GET /search/vendors                               -> Search vendors
    |--------------------------------------------------------------------------
    */

    Route::prefix('search')->name('search.')->group(function () {

        Route::get('/customers', [SearchController::class, 'searchCustomer'])
            ->name('customers');

        Route::get('/customers/{customer}/companies', [SearchController::class, 'searchCompanyByCustomerId'])
            ->name('companies.by-customer-id');

        Route::get('/services/{service}/packages', [SearchController::class, 'searchPackagesByServiceId'])
            ->name('packages.by-service-id');

        Route::get('/services/{service}/templates', [SearchController::class, 'searchTemplatesByServiceId'])
            ->name('templates.by-service-id');

        Route::get('/users/staff', [SearchController::class, 'searchUserStaff'])
            ->name('users.staff');

        Route::get('/projects', [SearchController::class, 'seachProject'])
            ->name('projects');

        Route::get('/vendors', [SearchController::class, 'searchVendor'])
            ->name('vendors');
    });
});


/*
|--------------------------------------------------------------------------
| FILE ACCESS (PRIVATE)
|--------------------------------------------------------------------------
| GET /files/{path} -> Serve private file (auth + verified + permission)
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
