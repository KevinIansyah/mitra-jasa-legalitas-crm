<?php

use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ProjectInvoiceController;
use App\Http\Controllers\ProjectPaymentController;
use App\Http\Controllers\VendorController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'restrict_user'])->group(function () {

  /*
    |--------------------------------------------------------------------------
    | INVOICES
    |--------------------------------------------------------------------------
    */

  Route::prefix('finances/invoices')->name('finances.invoices.')->group(function () {
    Route::get('/',                        [ProjectInvoiceController::class, 'index'])->middleware('permission:view-finance-invoices')->name('index');
    Route::get('/create',                  [ProjectInvoiceController::class, 'create'])->middleware('permission:create-finance-invoices')->name('create');
    Route::post('/',                       [ProjectInvoiceController::class, 'store'])->middleware('permission:create-finance-invoices')->name('store');
    Route::get('/{invoice}/edit',          [ProjectInvoiceController::class, 'edit'])->middleware('permission:edit-finance-invoices')->name('edit');
    Route::put('/{invoice}',               [ProjectInvoiceController::class, 'update'])->middleware('permission:edit-finance-invoices')->name('update');
    Route::delete('/{invoice}',            [ProjectInvoiceController::class, 'destroy'])->middleware('permission:delete-finance-invoices')->name('destroy');
    Route::patch('/{invoice}/status',      [ProjectInvoiceController::class, 'updateStatus'])->middleware('permission:edit-finance-invoices')->name('update-status');
  });

  /*
    |--------------------------------------------------------------------------
    | PAYMENTS
    |--------------------------------------------------------------------------
    */

  Route::get('/finances/payments', [ProjectPaymentController::class, 'index'])
    ->middleware('permission:view-finance-payments')
    ->name('finances.payments.index');

  Route::prefix('finances/invoices/{invoice}/payments')->name('finances.invoices.payments.')->group(function () {
    Route::post('/',                     [ProjectPaymentController::class, 'store'])->middleware('permission:create-finance-payments')->name('store');
    Route::post('/{payment}',            [ProjectPaymentController::class, 'update'])->middleware('permission:edit-finance-payments')->name('update');
    Route::delete('/{payment}',          [ProjectPaymentController::class, 'destroy'])->middleware('permission:delete-finance-payments')->name('destroy');
    Route::patch('/{payment}/status',    [ProjectPaymentController::class, 'updateStatus'])->middleware('permission:edit-finance-payments')->name('update-status');
  });

  /*
    |--------------------------------------------------------------------------
    | EXPENSES
    |--------------------------------------------------------------------------
    */

  Route::prefix('finances/expenses')->name('finances.expenses.')->group(function () {
    Route::get('/',                        [ExpenseController::class, 'index'])->middleware('permission:view-finance-expenses')->name('index');
    Route::post('/',                       [ExpenseController::class, 'store'])->middleware('permission:create-finance-expenses')->name('store');
    Route::post('/{expense}',               [ExpenseController::class, 'update'])->middleware('permission:edit-finance-expenses')->name('update');
    Route::delete('/{expense}',            [ExpenseController::class, 'destroy'])->middleware('permission:delete-finance-expenses')->name('destroy');
  });

  Route::get('/projects/{project}/unbilled-expenses', [ExpenseController::class, 'unbilled'])->name('projects.unbilled-expenses');


  /*
    |--------------------------------------------------------------------------
    | VENDORS
    |--------------------------------------------------------------------------
    */

  Route::prefix('finances/vendors')->name('finances.vendors.')->group(function () {
    Route::get('/',           [VendorController::class, 'index'])->name('index');
    Route::get('/create',     [VendorController::class, 'create'])->name('create');
    Route::post('/',          [VendorController::class, 'store'])->name('store');
    Route::get('/{vendor}/edit', [VendorController::class, 'edit'])->name('edit');
    Route::put('/{vendor}',   [VendorController::class, 'update'])->name('update');
    Route::delete('/{vendor}', [VendorController::class, 'destroy'])->name('destroy');
  });
});
