<?php

use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProjectTemplateController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ServiceCategoryController;
use App\Http\Controllers\ServiceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
| Routes accessible without authentication.
| Typically used for landing pages or public-facing views.
*/

// Route::get('/', function () {
//     return Inertia::render('welcome', [
//         'canRegister' => Features::enabled(Features::registration()),
//     ]);
// })->name('home');


/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
| All routes within this group require:
| - Authenticated user
| - Verified email
| - Passing the custom middleware: restrict_user
*/

Route::middleware(['auth', 'verified', 'restrict_user'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    | Main application dashboard.
    */
    Route::get('/', [DashboardController::class, 'index'])
        ->name('dashboard.index');


    /*
    |--------------------------------------------------------------------------
    | Role Management
    |--------------------------------------------------------------------------
    | CRUD operations for roles using Spatie Permission.
    */
    Route::resource('roles', RoleController::class)
        ->only(['index', 'store', 'edit', 'update', 'destroy'])
        ->middleware([
            'index'   => 'permission:view-roles',
            'store'   => 'permission:create-roles',
            'edit'    => 'permission:edit-roles',
            'update'  => 'permission:edit-roles',
            'destroy' => 'permission:delete-roles',
        ]);


    /*
    |--------------------------------------------------------------------------
    | Role → Permission Assignment
    |--------------------------------------------------------------------------
    | Manage permissions assigned to specific roles.
    */
    Route::prefix('roles')->name('roles.')->group(function () {

        // Display permission edit form for a specific role
        Route::get('{role}/permissions/edit', [RoleController::class, 'editPermission'])
            ->middleware('permission:edit-permissions')
            ->name('permission.edit');

        // Update permissions assigned to a specific role
        Route::put('{role}/permissions/update', [RoleController::class, 'updatePermission'])
            ->middleware('permission:edit-permissions')
            ->name('permission.update');
    });


    /*
    |--------------------------------------------------------------------------
    | Contact Management
    |--------------------------------------------------------------------------
    | Handles Customer and Company data management.
    */
    Route::prefix('contacts')->name('contacts.')->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Customer Management
        |--------------------------------------------------------------------------
        | CRUD operations for customer records.
        */
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


        /*
        |--------------------------------------------------------------------------
        | Company Management
        |--------------------------------------------------------------------------
        | CRUD operations for company records.
        */
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


        /*
        |--------------------------------------------------------------------------
        | Company ↔ Customer Relationship Management
        |--------------------------------------------------------------------------
        | Manages many-to-many relationships between companies and customers.
        | Includes attach, detach, search, and pivot updates.
        */
        Route::prefix('companies')
            ->name('companies.')
            ->middleware('permission:edit-contact-companies')
            ->group(function () {

                // Search customers for attaching to a company
                Route::get('search-customers', [CompanyController::class, 'searchCustomer'])
                    ->name('search-customers');

                // Attach a customer to a company
                Route::post('{company}/attach-customer', [CompanyController::class, 'attachCustomer'])
                    ->name('attach-customer');

                // Detach a customer from a company
                Route::delete('{company}/detach-customer/{customer}', [CompanyController::class, 'detachCustomer'])
                    ->name('detach-customer');

                // Update pivot data (e.g., is_primary, position_at_company)
                Route::patch('{company}/update-customer/{customer}', [CompanyController::class, 'updateCustomerPivot'])
                    ->name('update-customer');
            });
    });


    /*
    |--------------------------------------------------------------------------
    | Service Management
    |--------------------------------------------------------------------------
    | Handles service creation and basic management.
    */
    Route::resource('services', ServiceController::class)
        ->only(['index', 'create', 'store', 'edit', 'destroy'])
        ->middleware([
            'index'   => 'permission:view-services',
            'create'  => 'permission:create-services',
            'store'   => 'permission:create-services',
            'edit'    => 'permission:edit-services',
            'destroy' => 'permission:delete-services',
        ]);


    /*
    |--------------------------------------------------------------------------
    | Service Update (Tab-Based Updates)
    |--------------------------------------------------------------------------
    | Allows partial updates of service sections.
    | Each endpoint updates a specific section of the service.
    */
    Route::prefix('services/{service}')
        ->name('services.')
        ->middleware('permission:edit-services')
        ->group(function () {

            // Update basic service information
            Route::patch('/basic-information', [ServiceController::class, 'updateBasicInformation'])
                ->name('update.basic-information');

            // Update service content
            Route::patch('/content', [ServiceController::class, 'updateContent'])
                ->name('update.content');

            // Update service packages
            Route::patch('/packages', [ServiceController::class, 'updatePackages'])
                ->name('update.packages');

            // Update service FAQs
            Route::patch('/faqs', [ServiceController::class, 'updateFaqs'])
                ->name('update.faqs');

            // Update service legal bases
            Route::patch('/legal-bases', [ServiceController::class, 'updateLegalBases'])
                ->name('update.legal-bases');

            // Update service requirements
            Route::patch('/requirements', [ServiceController::class, 'updateRequirements'])
                ->name('update.requirements');

            // Update service process steps
            Route::patch('/process-steps', [ServiceController::class, 'updateProcessSteps'])
                ->name('update.process-steps');
        });


    /*
    |--------------------------------------------------------------------------
    | Service Category Management
    |--------------------------------------------------------------------------
    | CRUD operations for service categories.
    */
    Route::prefix('services')->name('services.')->group(function () {
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

    /*
    |--------------------------------------------------------------------------
    | Project Management
    |--------------------------------------------------------------------------
    | Handles project creation and basic management.
    */
    // Route::resource('projects', ProjectContoller::class)
    //     ->only(['index', 'create', 'store', 'edit', 'destroy'])
    //     ->middleware([
    //         'index'   => 'permission:view-projects',
    //         'create'  => 'permission:create-projects',
    //         'store'   => 'permission:create-projects',
    //         'edit'    => 'permission:edit-projects',
    //         'destroy' => 'permission:delete-projects',
    //     ]);

    /*
    |--------------------------------------------------------------------------
    | Project Template Management
    |--------------------------------------------------------------------------
    | CRUD operations for project templates.
    */
    Route::prefix('projects')->name('projects.')->group(function () {

        Route::resource('templates', ProjectTemplateController::class)
            ->only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
            ->middleware([
                'index'   => 'permission:view-project-templates',
                'create'  => 'permission:create-project-templates',
                'store'   => 'permission:create-project-templates',
                'edit'    => 'permission:edit-project-templates',
                'update'  => 'permission:edit-project-templates',
                'destroy' => 'permission:delete-project-templates',
            ]);

        // Duplicate template
        Route::post('templates/{template}/duplicate', [ProjectTemplateController::class, 'duplicate'])
            ->middleware('permission:create-project-templates')
            ->name('templates.duplicate');

        // Get template data from service
        Route::get('templates/from-service/{service}', [ProjectTemplateController::class, 'getTemplateFromService'])
            ->middleware('permission:create-project-templates')
            ->name('templates.from-service');
    });
});

/*
|--------------------------------------------------------------------------
| Additional Route Files
|--------------------------------------------------------------------------
*/

require __DIR__ . '/settings.php';
