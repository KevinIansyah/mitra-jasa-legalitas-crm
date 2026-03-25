<?php

use App\Http\Controllers\Contacts\CompanyController;
use App\Http\Controllers\Contacts\ContactMessageController;
use App\Http\Controllers\Contacts\CustomerController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| CONTACTS MODULE
|--------------------------------------------------------------------------
| All contacts-related endpoints:
|   - Customers
|   - Companies
|
| Middleware: auth, verified, restrict_user
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'restrict_user'])->group(function () {

    Route::prefix('contacts')->name('contacts.')->group(function () {

        /*
            |--------------------------------------------------------------------------
            | CUSTOMERS
            |--------------------------------------------------------------------------
            | GET    /contacts/customers                  -> List customers
            | GET    /contacts/customers/create           -> Show create form
            | POST   /contacts/customers                  -> Store customer
            | GET    /contacts/customers/{customer}/edit  -> Show edit form
            | PUT    /contacts/customers/{customer}       -> Update customer
            | DELETE /contacts/customers/{customer}       -> Delete customer
            |
            | Account Management
            | POST   /contacts/customers/{customer}/check-account   -> Check if account exists
            | POST   /contacts/customers/{customer}/create-account  -> Create linked account
            | POST   /contacts/customers/{customer}/link-account    -> Link existing account
            | POST   /contacts/customers/{customer}/revoke-account  -> Revoke linked account
            |--------------------------------------------------------------------------
            */

        Route::prefix('customers')->name('customers.')->group(function () {

            Route::get('/', [CustomerController::class, 'index'])
                ->middleware('permission:view-contact-customers')
                ->name('index');

            Route::get('/create', [CustomerController::class, 'create'])
                ->middleware('permission:create-contact-customers')
                ->name('create');

            Route::post('/', [CustomerController::class, 'store'])
                ->middleware('permission:create-contact-customers')
                ->name('store');

            Route::get('/{customer}/edit', [CustomerController::class, 'edit'])
                ->middleware('permission:edit-contact-customers')
                ->name('edit');

            Route::put('/{customer}', [CustomerController::class, 'update'])
                ->middleware('permission:edit-contact-customers')
                ->name('update');

            Route::delete('/{customer}', [CustomerController::class, 'destroy'])
                ->middleware('permission:delete-contact-customers')
                ->name('destroy');

            Route::prefix('{customer}')->middleware('permission:edit-contact-customers')->group(function () {

                Route::post('/check-account', [CustomerController::class, 'checkAccount'])
                    ->name('check-account');

                Route::post('/create-account', [CustomerController::class, 'createAccount'])
                    ->name('create-account');

                Route::post('/link-account', [CustomerController::class, 'linkAccount'])
                    ->name('link-account');

                Route::post('/revoke-account', [CustomerController::class, 'revokeAccount'])
                    ->name('revoke-account');
            });
        });

        /*
            |--------------------------------------------------------------------------
            | COMPANIES
            |--------------------------------------------------------------------------
            | GET    /contacts/companies                 -> List companies
            | GET    /contacts/companies/create          -> Show create form
            | POST   /contacts/companies                 -> Store company
            | GET    /contacts/companies/{company}/edit  -> Show edit form
            | PUT    /contacts/companies/{company}       -> Update company
            | DELETE /contacts/companies/{company}       -> Delete company
            |
            | Customer Relationship Management
            | POST   /contacts/companies/{company}/attach-customer                -> Attach customer to company
            | DELETE /contacts/companies/{company}/detach-customer/{customer}     -> Detach customer from company
            | PATCH  /contacts/companies/{company}/update-customer/{customer}     -> Update customer pivot data
            |--------------------------------------------------------------------------
            */

        Route::prefix('companies')->name('companies.')->group(function () {

            Route::get('/', [CompanyController::class, 'index'])
                ->middleware('permission:view-contact-companies')
                ->name('index');

            Route::get('/create', [CompanyController::class, 'create'])
                ->middleware('permission:create-contact-companies')
                ->name('create');

            Route::post('/', [CompanyController::class, 'store'])
                ->middleware('permission:create-contact-companies')
                ->name('store');

            Route::get('/{company}/edit', [CompanyController::class, 'edit'])
                ->middleware('permission:edit-contact-companies')
                ->name('edit');

            Route::put('/{company}', [CompanyController::class, 'update'])
                ->middleware('permission:edit-contact-companies')
                ->name('update');

            Route::delete('/{company}', [CompanyController::class, 'destroy'])
                ->middleware('permission:delete-contact-companies')
                ->name('destroy');

            Route::prefix('{company}')->middleware('permission:edit-contact-companies')->group(function () {

                Route::post('/attach-customer', [CompanyController::class, 'attachCustomer'])
                    ->name('attach-customer');

                Route::delete('/detach-customer/{customer}', [CompanyController::class, 'detachCustomer'])
                    ->name('detach-customer');

                Route::patch('/update-customer/{customer}', [CompanyController::class, 'updateCustomerPivot'])
                    ->name('update-customer');
            });
        });

        /*
            |--------------------------------------------------------------------------
            | CONTACT MESSAGES
            |--------------------------------------------------------------------------
            | GET    /contacts/messages                  -> List messages
            | PATCH  /contacts/messages/{message}/status -> Update message status
            | DELETE /contacts/messages/{message}       -> Delete message
            |--------------------------------------------------------------------------
            */

        Route::prefix('messages')->name('messages.')->group(function () {
            Route::get('/', [ContactMessageController::class, 'index'])
                ->middleware('permission:view-contact-messages')
                ->name('index');

            Route::patch('/{message}/status', [ContactMessageController::class, 'updateStatus'])
                ->middleware('permission:edit-contact-messages')
                ->name('update-status');

            Route::delete('/{message}', [ContactMessageController::class, 'destroy'])
                ->middleware('permission:delete-contact-messages')
                ->name('destroy');
        });
    });
});
