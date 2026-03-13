<?php

use App\Http\Controllers\Finances\EstimateController;
use App\Http\Controllers\Finances\ExpenseController;
use App\Http\Controllers\Finances\AccountController;
use App\Http\Controllers\Finances\ManualJournalController;
use App\Http\Controllers\Finances\OpeningBalanceController;
use App\Http\Controllers\Finances\FinancialReportController;
use App\Http\Controllers\Projects\ProjectInvoiceController;
use App\Http\Controllers\Projects\ProjectPaymentController;
use App\Http\Controllers\Finances\QuoteController;
use App\Http\Controllers\Finances\VendorController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| FINANCE MODULE
|--------------------------------------------------------------------------
| All finance-related endpoints:
|   - Invoices
|   - Payments
|   - Expenses
|   - Vendors
|
| Middleware: auth, verified, restrict_user
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'restrict_user'])->group(function () {

  /*
    |--------------------------------------------------------------------------
    | INVOICES
    |--------------------------------------------------------------------------
    | GET    /finances/invoices                   -> List invoices
    | GET    /finances/invoices/create            -> Show create form
    | POST   /finances/invoices                   -> Store invoice
    | GET    /finances/invoices/{invoice}/edit    -> Show edit form
    | PUT    /finances/invoices/{invoice}         -> Update invoice
    | DELETE /finances/invoices/{invoice}         -> Delete invoice
    | PATCH  /finances/invoices/{invoice}/status  -> Update invoice status
    |--------------------------------------------------------------------------
    */

  Route::prefix('finances/invoices')->name('finances.invoices.')->group(function () {

    Route::get('/', [ProjectInvoiceController::class, 'index'])
      ->middleware('permission:view-finance-invoices')
      ->name('index');

    Route::get('/create', [ProjectInvoiceController::class, 'create'])
      ->middleware('permission:create-finance-invoices')
      ->name('create');

    Route::post('/', [ProjectInvoiceController::class, 'store'])
      ->middleware('permission:create-finance-invoices')
      ->name('store');

    Route::get('/{invoice}/edit', [ProjectInvoiceController::class, 'edit'])
      ->middleware('permission:edit-finance-invoices')
      ->name('edit');

    Route::put('/{invoice}', [ProjectInvoiceController::class, 'update'])
      ->middleware('permission:edit-finance-invoices')
      ->name('update');

    Route::delete('/{invoice}', [ProjectInvoiceController::class, 'destroy'])
      ->middleware('permission:delete-finance-invoices')
      ->name('destroy');

    Route::patch('/{invoice}/status', [ProjectInvoiceController::class, 'updateStatus'])
      ->middleware('permission:edit-finance-invoices')
      ->name('update-status');
  });


  /*
    |--------------------------------------------------------------------------
    | PAYMENTS
    |--------------------------------------------------------------------------
    | GET    /finances/payments                                         -> List all payments
    | POST   /finances/invoices/{invoice}/payments                      -> Create payment
    | POST   /finances/invoices/{invoice}/payments/{payment}            -> Update payment
    | DELETE /finances/invoices/{invoice}/payments/{payment}            -> Delete payment
    | PATCH  /finances/invoices/{invoice}/payments/{payment}/status     -> Update payment status
    |--------------------------------------------------------------------------
    */

  Route::get('/finances/payments', [ProjectPaymentController::class, 'index'])
    ->middleware('permission:view-finance-payments')
    ->name('finances.payments.index');

  Route::prefix('finances/invoices/{invoice}/payments')->name('finances.invoices.payments.')->group(function () {

    Route::post('/', [ProjectPaymentController::class, 'store'])
      ->middleware('permission:create-finance-payments')
      ->name('store');

    Route::post('/{payment}', [ProjectPaymentController::class, 'update'])
      ->middleware('permission:edit-finance-payments')
      ->name('update');

    Route::delete('/{payment}', [ProjectPaymentController::class, 'destroy'])
      ->middleware('permission:delete-finance-payments')
      ->name('destroy');

    Route::patch('/{payment}/status', [ProjectPaymentController::class, 'updateStatus'])
      ->middleware('permission:edit-finance-payments')
      ->name('update-status');
  });


  /*
    |--------------------------------------------------------------------------
    | EXPENSES
    |--------------------------------------------------------------------------
    | GET    /finances/expenses              -> List expenses
    | POST   /finances/expenses             -> Create expense
    | POST   /finances/expenses/{expense}   -> Update expense
    | DELETE /finances/expenses/{expense}   -> Delete expense
    |
    | GET    /projects/{project}/unbilled-expenses -> Expenses not yet billed to an invoice
    |--------------------------------------------------------------------------
    */

  Route::prefix('finances/expenses')->name('finances.expenses.')->group(function () {

    Route::get('/', [ExpenseController::class, 'index'])
      ->middleware('permission:view-finance-expenses')
      ->name('index');

    Route::post('/', [ExpenseController::class, 'store'])
      ->middleware('permission:create-finance-expenses')
      ->name('store');

    Route::post('/{expense}', [ExpenseController::class, 'update'])
      ->middleware('permission:edit-finance-expenses')
      ->name('update');

    Route::delete('/{expense}', [ExpenseController::class, 'destroy'])
      ->middleware('permission:delete-finance-expenses')
      ->name('destroy');
  });

  Route::get('/projects/{project}/unbilled-expenses', [ExpenseController::class, 'unbilled'])
    ->name('projects.unbilled-expenses');


  /*
    |--------------------------------------------------------------------------
    | VENDORS
    |--------------------------------------------------------------------------
    | GET    /finances/vendors                -> List vendors
    | GET    /finances/vendors/create         -> Show create form
    | POST   /finances/vendors                -> Store vendor
    | GET    /finances/vendors/{vendor}/edit  -> Show edit form
    | PUT    /finances/vendors/{vendor}       -> Update vendor
    | DELETE /finances/vendors/{vendor}       -> Delete vendor
    |--------------------------------------------------------------------------
    */

  Route::prefix('finances/vendors')->name('finances.vendors.')->group(function () {

    Route::get('/', [VendorController::class, 'index'])
      ->name('index');

    Route::get('/create', [VendorController::class, 'create'])
      ->name('create');

    Route::post('/', [VendorController::class, 'store'])
      ->name('store');

    Route::get('/{vendor}/edit', [VendorController::class, 'edit'])
      ->name('edit');

    Route::put('/{vendor}', [VendorController::class, 'update'])
      ->name('update');

    Route::delete('/{vendor}', [VendorController::class, 'destroy'])
      ->name('destroy');
  });

  /*
    |--------------------------------------------------------------------------
    | QUOTES
    |--------------------------------------------------------------------------
    | GET    /finances/quotes                 -> List quotes
    | GET    /finances/quotes/{quote}         -> Show quote
    | GET    /finances/quotes/{quote}/convert -> Convert quote
    | DELETE /finances/quotes/{quote}         -> Delete quote
    | PATCH  /finances/quotes/{quote}/status  -> Update quote status
    |--------------------------------------------------------------------------
    */

  Route::prefix('finances/quotes')->name('finances.quotes.')->group(function () {
    Route::get('/', [QuoteController::class, 'index'])
      ->middleware('permission:view-finance-quotes')
      ->name('index');

    Route::get('/{quote}', [QuoteController::class, 'show'])
      ->middleware('permission:view-finance-quotes')
      ->name('show');

    Route::get('/{quote}/convert', [QuoteController::class, 'convert'])
      ->middleware('permission:create-projects')
      ->name('convert');

    Route::delete('/{quote}', [QuoteController::class, 'destroy'])
      ->middleware('permission:delete-finance-quotes')
      ->name('destroy');

    Route::patch('/{quote}/status', [QuoteController::class, 'updateStatus'])
      ->middleware('permission:edit-finance-quotes')
      ->name('update-status');
  });

  /*
    |--------------------------------------------------------------------------
    | ESTIMATES
    |--------------------------------------------------------------------------
    |
    | GET    /finances/estimates                    -> List estimates
    | GET    /finances/estimates/{estimate}         -> Show estimate
    | POST   /finances/estimates                    -> Create estimate
    | GET    /finances/estimates/{estimate}/edit    -> Show edit form
    | PUT    /finances/estimates/{estimate}         -> Update estimate
    | PATCH  /finances/estimates/{estimate}/status  -> Update estimate status
    | POST   /finances/estimates/{estimate}/revise  -> Revise estimate
    | DELETE /finances/estimates/{estimate}         -> Delete estimate
    |
    |--------------------------------------------------------------------------
    */

  Route::prefix('finances/estimates')->name('finances.estimates.')->group(function () {
    Route::get('/', [EstimateController::class, 'index'])
      ->middleware('permission:view-finance-estimates')
      ->name('index');

    Route::get('/create', [EstimateController::class, 'create'])
      ->middleware('permission:create-finance-estimates')
      ->name('create');

    Route::post('/', [EstimateController::class, 'store'])
      ->middleware('permission:create-finance-estimates')
      ->name('store');

    Route::get('/{estimate}/edit', [EstimateController::class, 'edit'])
      ->middleware('permission:edit-finance-estimates')
      ->name('edit');

    Route::put('/{estimate}', [EstimateController::class, 'update'])
      ->middleware('permission:edit-finance-estimates')
      ->name('update');

    Route::patch('/{estimate}/status', [EstimateController::class, 'updateStatus'])
      ->middleware('permission:edit-finance-estimates')
      ->name('update-status');

    Route::post('/{estimate}/revise', [EstimateController::class, 'revise'])
      ->middleware('permission:edit-finance-estimates')
      ->name('revise');

    Route::delete('/{estimate}', [EstimateController::class, 'destroy'])
      ->middleware('permission:delete-finance-estimates')
      ->name('destroy');
  });

  /*
    |--------------------------------------------------------------------------
    | ACCOUNTS
    |--------------------------------------------------------------------------
    |
    | GET    /finances/accounts                    -> List accounts
    | POST   /finances/accounts                    -> Create account
    | PUT    /finances/accounts/{account}          -> Update account
    | PATCH  /finances/accounts/{account}/status   -> Update account status
    | DELETE /finances/accounts/{account}          -> Delete account
    |
    |--------------------------------------------------------------------------
    */

  Route::prefix('/finances/accounts')->name('finances.accounts.')->group(function () {
    Route::get('/', [AccountController::class, 'index'])
      ->middleware('permission:view-finance-accounts')
      ->name('index');

    Route::post('/', [AccountController::class, 'store'])
      ->middleware('permission:create-finance-accounts')
      ->name('store');

    Route::put('/{account}', [AccountController::class, 'update'])
      ->middleware('permission:edit-finance-accounts')
      ->name('update');

    Route::patch('/{account}/status', [AccountController::class, 'toggleStatus'])
      ->middleware('permission:edit-finance-accounts')
      ->name('toggle-status');

    Route::delete('/{account}', [AccountController::class, 'destroy'])
      ->middleware('permission:delete-finance-accounts')
      ->name('destroy');
  });

  /*
    |--------------------------------------------------------------------------
    | OPENING BALANCE
    |--------------------------------------------------------------------------
    |
    | GET    /finances/opening-balance            -> List opening balance
    | POST   /finances/opening-balance            -> Create opening balance
    | PUT    /finances/opening-balance            -> Update opening balance
    |
    |--------------------------------------------------------------------------
    */

  Route::prefix('finances/opening-balance')->name('finances.opening-balance.')->group(function () {
    Route::get('/', [OpeningBalanceController::class, 'index'])
      ->middleware('permission:view-finance-opening-balances')
      ->name('index');

    Route::post('/', [OpeningBalanceController::class, 'store'])
      ->middleware('permission:create-finance-opening-balances')
      ->name('store');

    Route::put('/', [OpeningBalanceController::class, 'update'])
      ->middleware('permission:edit-finance-opening-balances')
      ->name('update');
  });

  /*
    |--------------------------------------------------------------------------
    | JOURNAL ENTRIES
    |--------------------------------------------------------------------------
    |
    | GET    /finances/journal-entries            -> List journal entries
    | POST   /finances/journal-entries            -> Create journal entry
    | PUT    /finances/journal-entries/{journalEntry}    -> Update journal entry
    | DELETE /finances/journal-entries/{journalEntry}    -> Delete journal entry
    |
    |--------------------------------------------------------------------------
    */

  Route::prefix('finances/journal-entries')->name('finances.journal-entries.')->group(function () {
    Route::get('/', [ManualJournalController::class, 'index'])
      ->middleware('permission:view-finance-journals')
      ->name('index');
    Route::post('/', [ManualJournalController::class, 'store'])
      ->middleware('permission:create-finance-journals')
      ->name('store');
    Route::put('/{journalEntry}', [ManualJournalController::class, 'update'])
      ->middleware('permission:edit-finance-journals')
      ->name('update');
    Route::delete('/{journalEntry}', [ManualJournalController::class, 'destroy'])
      ->middleware('permission:delete-finance-journals')
      ->name('destroy');
  });

  /*
    |--------------------------------------------------------------------------
    | REPORTS
    |--------------------------------------------------------------------------
    |
    | GET    /finances/reports/laba-rugi     -> Laba Rugi
    | GET    /finances/reports/neraca        -> Neraca
    | GET    /finances/reports/cash-flow     -> Cash Flow
    |
    |--------------------------------------------------------------------------
    */

  Route::prefix('finances/reports')->name('finances.reports.')->middleware('permission:view-finance-reports')->group(function () {
    Route::get('/profit-loss', [FinancialReportController::class, 'labaRugi'])->name('profit-loss');
    Route::get('/balance-sheet',    [FinancialReportController::class, 'neraca'])->name('balance-sheet');
    Route::get('/cash-flow', [FinancialReportController::class, 'cashFlow'])->name('cash-flow');

    Route::get('/profit-loss/pdf', [FinancialReportController::class, 'labaRugiPdf'])->name('profit-loss.pdf');
    Route::get('/balance-sheet/pdf',    [FinancialReportController::class, 'neracaPdf'])->name('balance-sheet.pdf');
    Route::get('/cash-flow/pdf', [FinancialReportController::class, 'cashFlowPdf'])->name('cash-flow.pdf');
  });
});
