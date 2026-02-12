<?php

use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ServiceCategoryController;
use App\Http\Controllers\ServiceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');


Route::middleware(['auth', 'verified', 'restrict_user'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.index');

    // Role Management
    Route::resource('roles', RoleController::class)
        ->only(['index', 'store', 'edit', 'update', 'destroy'])
        ->middleware([
            'index'   => 'permission:view-roles',
            'store'   => 'permission:create-roles',
            'edit'    => 'permission:edit-roles',
            'update'  => 'permission:edit-roles',
            'destroy' => 'permission:delete-roles',
        ]);

    // Role Management -> Permission
    Route::prefix('roles')->name('roles.')->group(function () {
        Route::get('{role}/permissions/edit', [RoleController::class, 'editPermission'])
            ->middleware('permission:edit-permissions')
            ->name('permission.edit');

        Route::put('{role}/permissions/update', [RoleController::class, 'updatePermission'])
            ->middleware('permission:edit-permissions')
            ->name('permission.update');
    });

    // Contact Management
    Route::prefix('contacts')->name('contacts.')->group(function () {
        // Customers
        Route::resource('customers', CustomerController::class)
            ->only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
            ->middleware([
                'index'   => 'permission:view-contact-customers',
                'create'  => 'permission:create-contact-customers',
                'store'   => 'permission:create-contact-customers',
                'edit'    => 'permission:edit-contact-customers',
                'update'  => 'permission:edit-contact-customers',
                'destroy' => 'permission:delete-contact-customers',
            ]);

        // Company
        Route::resource('companies', CompanyController::class)
            ->only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
            ->middleware([
                'index'   => 'permission:view-contact-companies',
                'create'  => 'permission:create-contact-companies',
                'store'   => 'permission:create-contact-companies',
                'edit'    => 'permission:edit-contact-companies',
                'update'  => 'permission:edit-contact-companies',
                'destroy' => 'permission:delete-contact-companies',
            ]);

        // Company Customer Relations
        Route::prefix('companies')->name('companies.')->middleware('permission:edit-contact-companies')->group(function () {
            Route::get('search-customers', [CompanyController::class, 'searchCustomer'])->name('search-customers');
            Route::post('{company}/attach-customer', [CompanyController::class, 'attachCustomer'])->name('attach-customer');
            Route::delete('{company}/detach-customer/{customer}', [CompanyController::class, 'detachCustomer'])->name('detach-customer');
            Route::patch('{company}/update-customer/{customer}', [CompanyController::class, 'updateCustomerPivot'])->name('update-customer');
        });
    });

    // Service Management
    Route::resource('services', ServiceController::class)
        ->only(['index', 'create', 'store', 'edit', 'destroy'])
        ->middleware([
            'index'   => 'permission:view-services',
            'create'  => 'permission:create-services',
            'store'   => 'permission:create-services',
            'edit'    => 'permission:edit-services',
            'destroy' => 'permission:delete-services',
        ]);

    // Service Update - Per Tab
    Route::prefix('services/{service}')->name('services.')->middleware('permission:edit-services')->group(function () {
        Route::patch('/basic-information', [ServiceController::class, 'updateBasicInformation'])->name('update.basic-information');
        Route::patch('/content', [ServiceController::class, 'updateContent'])->name('update.content');
        Route::patch('/packages', [ServiceController::class, 'updatePackages'])->name('update.packages');
        // Route::patch('/faq', [ServiceController::class, 'updateFaq'])->name('update.faq');
        // Route::patch('/gallery', [ServiceController::class, 'updateGallery'])->name('update.gallery');
        // Route::patch('/testimonials', [ServiceController::class, 'updateTestimonials'])->name('update.testimonials');
        // Route::patch('/seo', [ServiceController::class, 'updateSeo'])->name('update.seo');
    });

    // Service Management -> Category
    Route::prefix('services')->name('services.')->group(function () {
        // Categories
        Route::resource('categories', ServiceCategoryController::class)
            ->only(['index', 'store', 'edit', 'update', 'destroy'])
            ->middleware([
                'index'   => 'permission:view-service-categories',
                'store'   => 'permission:create-service-categories',
                'edit'    => 'permission:edit-service-categories',
                'update'  => 'permission:edit-service-categories',
                'destroy' => 'permission:delete-service-categories',
            ]);
    });
});

require __DIR__ . '/settings.php';
