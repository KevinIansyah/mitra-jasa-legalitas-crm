<?php

use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CustomerController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'restrict_user'])->group(function () {

  Route::prefix('contacts')->name('contacts.')->group(function () {

    /*
        |--------------------------------------------------------------------------
        | CUSTOMERS
        |--------------------------------------------------------------------------
        */

    Route::prefix('customers')->name('customers.')->group(function () {
      Route::get('/',                  [CustomerController::class, 'index'])->name('index')->middleware('permission:view-contact-customers');
      Route::get('/create',            [CustomerController::class, 'create'])->name('create')->middleware('permission:create-contact-customers');
      Route::post('/',                 [CustomerController::class, 'store'])->name('store')->middleware('permission:create-contact-customers');
      Route::get('/{customer}/edit',   [CustomerController::class, 'edit'])->name('edit')->middleware('permission:edit-contact-customers');
      Route::put('/{customer}',      [CustomerController::class, 'update'])->name('update')->middleware('permission:edit-contact-customers');
      Route::delete('/{customer}',     [CustomerController::class, 'destroy'])->name('destroy')->middleware('permission:delete-contact-customers');
    });

    /*
        |--------------------------------------------------------------------------
        | COMPANIES
        |--------------------------------------------------------------------------
        */

    Route::prefix('companies')->name('companies.')->group(function () {
      Route::get('/',                  [CompanyController::class, 'index'])->name('index')->middleware('permission:view-contact-companies');
      Route::get('/create',            [CompanyController::class, 'create'])->name('create')->middleware('permission:create-contact-companies');
      Route::post('/',                 [CompanyController::class, 'store'])->name('store')->middleware('permission:create-contact-companies');
      Route::get('/{company}/edit',    [CompanyController::class, 'edit'])->name('edit')->middleware('permission:edit-contact-companies');
      Route::put('/{company}',       [CompanyController::class, 'update'])->name('update')->middleware('permission:edit-contact-companies');
      Route::delete('/{company}',      [CompanyController::class, 'destroy'])->name('destroy')->middleware('permission:delete-contact-companies');

      Route::prefix('{company}')->middleware('permission:edit-contact-companies')->group(function () {
        Route::post('/attach-customer',              [CompanyController::class, 'attachCustomer'])->name('attach-customer');
        Route::delete('/detach-customer/{customer}', [CompanyController::class, 'detachCustomer'])->name('detach-customer');
        Route::patch('/update-customer/{customer}',  [CompanyController::class, 'updateCustomerPivot'])->name('update-customer');
      });
    });
  });
});
