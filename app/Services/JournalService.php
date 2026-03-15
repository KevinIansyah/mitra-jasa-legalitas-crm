<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Expense;
use App\Models\JournalEntry;
use App\Models\ProjectInvoice;
use App\Models\ProjectPayment;

class JournalService
{
  // ------------------------------------------------------------------------
  // INVOICE
  // ------------------------------------------------------------------------

  /**
   * Create journal entry when an invoice status changes to `sent`.
   *
   * Regular Invoice (DP / Progress / Final):
   *
   *   DEBIT   Accounts Receivable      = total_amount
   *   CREDIT  Service Revenue          = subtotal
   *   CREDIT  Tax Payable              = tax_amount (if applicable)
   *
   * Additional Invoice (mix of billable expenses + manual items):
   *
   *   DEBIT   Accounts Receivable      = total_amount
   *   CREDIT  Reimbursement Receivable = total billable expense items
   *   CREDIT  Service Revenue          = total manual items
   *   CREDIT  Tax Payable              = tax_amount (if applicable)
   */
  public static function createFromInvoice(ProjectInvoice $invoice): void
  {
    if (self::entryExists('invoice', $invoice->id)) return;

    $invoice->type === 'additional'
      ? self::createFromAdditionalInvoice($invoice)
      : self::createFromRegularInvoice($invoice);
  }

  private static function createFromRegularInvoice(ProjectInvoice $invoice): void
  {
    $entry = self::makeEntry(
      date: $invoice->invoice_date,
      description: "Invoice #{$invoice->invoice_number}",
      type: 'invoice',
      referenceId: $invoice->id,
    );

    $entry->lines()->createMany([
      self::debit(self::account('receivable'), $invoice->total_amount, "Invoice #{$invoice->invoice_number}"),
      self::credit(self::account('revenue'), $invoice->subtotal, "Invoice #{$invoice->invoice_number}"),
    ]);

    if ((float) $invoice->tax_amount > 0) {
      $entry->lines()->create(
        self::credit(self::account('tax'), $invoice->tax_amount, "PPN Invoice #{$invoice->invoice_number}")
      );
    }
  }

  private static function createFromAdditionalInvoice(ProjectInvoice $invoice): void
  {
    $invoice->loadMissing('items');

    $expenseItems = $invoice->items->whereNotNull('expense_id');
    $manualItems  = $invoice->items->whereNull('expense_id');

    $totalReimbursement = (float) $expenseItems->sum('total');
    $totalManual        = (float) $manualItems->sum('total');
    $totalTax           = (float) $invoice->tax_amount;
    $totalPiutang       = (float) $invoice->total_amount;

    $entry = self::makeEntry(
      date: $invoice->invoice_date,
      description: "Invoice Additional #{$invoice->invoice_number}",
      type: 'invoice',
      referenceId: $invoice->id,
    );

    $entry->lines()->create(
      self::debit(self::account('receivable'), $totalPiutang, "Invoice #{$invoice->invoice_number}")
    );

    if ($totalReimbursement > 0) {
      $entry->lines()->create(
        self::credit(self::account('reimbursement'), $totalReimbursement, "Reimbursement Invoice #{$invoice->invoice_number}")
      );
    }

    if ($totalManual > 0) {
      $entry->lines()->create(
        self::credit(self::account('revenue'), $totalManual, "Pendapatan Invoice #{$invoice->invoice_number}")
      );
    }

    if ($totalTax > 0) {
      $entry->lines()->create(
        self::credit(self::account('tax'), $totalTax, "PPN Invoice #{$invoice->invoice_number}")
      );
    }
  }

  public static function reverseInvoice(ProjectInvoice $invoice): void
  {
    $original = JournalEntry::where('reference_type', 'invoice')
      ->where('reference_id', $invoice->id)
      ->with('lines')
      ->first();

    if (! $original) return;

    $entry = self::makeEntry(
      date: now()->toDateString(),
      description: "Pembatalan Invoice #{$invoice->invoice_number}",
      type: 'invoice',
      referenceId: $invoice->id,
    );

    foreach ($original->lines as $line) {
      $entry->lines()->create([
        'account_id' => $line->account_id,
        'debit'      => $line->credit,
        'credit'     => $line->debit,
        'notes'      => "Reversal: {$line->notes}",
      ]);
    }
  }

  // ------------------------------------------------------------------------
  // PAYMENT
  // ------------------------------------------------------------------------

  /**
   * Create journal entry when a payment status becomes `verified`.
   *
   * Accounting impact:
   *
   *   DEBIT   Cash / Bank              = payment amount
   *   CREDIT  Accounts Receivable      = payment amount
   */
  public static function createFromPayment(ProjectPayment $payment): void
  {
    if (self::entryExists('payment', $payment->id)) return;

    $payment->loadMissing('invoice');

    $entry = self::makeEntry(
      date: $payment->payment_date,
      description: "Pembayaran Invoice #{$payment->invoice->invoice_number}",
      type: 'payment',
      referenceId: $payment->id,
    );

    $entry->lines()->createMany([
      self::debit(self::account('cash'), $payment->amount, "Payment #{$payment->id}"),
      self::credit(self::account('receivable'), $payment->amount, "Payment #{$payment->id}"),
    ]);
  }

  // ------------------------------------------------------------------------
  // EXPENSE
  // ------------------------------------------------------------------------

  /**
   * Create journal entry when an expense is created.
   *
   * Non-Billable Expense:
   *
   *   DEBIT   Operating Expense        = amount
   *   CREDIT  Cash / Bank              = amount
   *
   * Billable Expense:
   *
   *   DEBIT   Reimbursement Receivable = amount
   *   CREDIT  Cash / Bank              = amount
   *
   * Billable expenses will later be invoiced to the client
   * through an Additional Invoice.
   */
  public static function createFromExpense(Expense $expense): void
  {
    if (self::entryExists('expense', $expense->id)) return;

    $debitAccount = $expense->is_billable
      ? self::account('reimbursement')
      : self::account('expense');

    $description = $expense->is_billable
      ? "Expense Billable: {$expense->description}"
      : "Expense: {$expense->description}";

    $entry = self::makeEntry(
      date: $expense->expense_date,
      description: $description,
      type: 'expense',
      referenceId: $expense->id,
    );

    $entry->lines()->createMany([
      self::debit($debitAccount, $expense->amount, $expense->description),
      self::credit(self::account('cash'), $expense->amount, $expense->description),
    ]);
  }

  /**
   * Correct journal entry when an expense changes
   * from billable → non-billable (before invoicing).
   *
   * Accounting impact:
   *
   *   DEBIT   Operating Expense
   *   CREDIT  Reimbursement Receivable
   */
  public static function correctBillableToNonBillable(Expense $expense): void
  {
    $entry = self::makeEntry(
      date: now()->toDateString(),
      description: "Koreksi Expense: {$expense->description} (tidak jadi ditagihkan)",
      type: 'expense',
      referenceId: $expense->id,
    );

    $entry->lines()->createMany([
      self::debit(self::account('expense'), $expense->amount),
      self::credit(self::account('reimbursement'), $expense->amount),
    ]);
  }

  /**
   * Correct journal entry when an expense changes
   * from non-billable → billable.
   *
   * Accounting impact:
   *
   *   DEBIT   Reimbursement Receivable
   *   CREDIT  Operating Expense
   */
  public static function correctNonBillableToBillable(Expense $expense): void
  {
    $entry = self::makeEntry(
      date: now()->toDateString(),
      description: "Koreksi Expense: {$expense->description} (diubah jadi billable)",
      type: 'expense',
      referenceId: $expense->id,
    );

    $entry->lines()->createMany([
      self::debit(self::account('reimbursement'), $expense->amount),
      self::credit(self::account('expense'), $expense->amount),
    ]);
  }

  /**
   * Adjust journal entry when a non-billable expense amount changes.
   * Only the difference (delta) is recorded.
   *
   * If the amount increases:
   *
   *   DEBIT   Operating Expense
   *   CREDIT  Cash / Bank
   *
   * If the amount decreases:
   *
   *   DEBIT   Cash / Bank
   *   CREDIT  Operating Expense
   */
  public static function correctExpenseAmount(Expense $expense, float $oldAmount, float $newAmount): void
  {
    $selisih = $newAmount - $oldAmount;
    $beban   = self::account('expense');
    $kas     = self::account('cash');

    $entry = self::makeEntry(
      date: now()->toDateString(),
      description: "Koreksi Amount Expense: {$expense->description}",
      type: 'expense',
      referenceId: $expense->id,
    );

    if ($selisih > 0) {
      $entry->lines()->createMany([
        self::debit($beban, $selisih, "Koreksi tambah: {$expense->description}"),
        self::credit($kas, $selisih, "Koreksi tambah: {$expense->description}"),
      ]);
    } else {
      $entry->lines()->createMany([
        self::debit($kas, abs($selisih), "Koreksi kurang: {$expense->description}"),
        self::credit($beban, abs($selisih), "Koreksi kurang: {$expense->description}"),
      ]);
    }
  }

  /**
   * Adjust journal entry when a billable expense amount changes
   * before being invoiced.
   *
   * Only the difference (delta) is recorded.
   *
   * If the amount increases:
   *
   *   DEBIT   Reimbursement Receivable
   *   CREDIT  Cash / Bank
   *
   * If the amount decreases:
   *
   *   DEBIT   Cash / Bank
   *   CREDIT  Reimbursement Receivable
   */
  public static function correctReimbursementAmount(Expense $expense, float $oldAmount, float $newAmount): void
  {
    $selisih       = $newAmount - $oldAmount;
    $reimbursement = self::account('reimbursement');
    $kas           = self::account('cash');

    $entry = self::makeEntry(
      date: now()->toDateString(),
      description: "Koreksi Amount Expense Billable: {$expense->description}",
      type: 'expense',
      referenceId: $expense->id,
    );

    if ($selisih > 0) {
      $entry->lines()->createMany([
        self::debit($reimbursement, $selisih, "Koreksi tambah: {$expense->description}"),
        self::credit($kas, $selisih, "Koreksi tambah: {$expense->description}"),
      ]);
    } else {
      $entry->lines()->createMany([
        self::debit($kas, abs($selisih), "Koreksi kurang: {$expense->description}"),
        self::credit($reimbursement, abs($selisih), "Koreksi kurang: {$expense->description}"),
      ]);
    }
  }

  // ------------------------------------------------------------------------
  // OPENING BALANCE
  // ------------------------------------------------------------------------

  /**
   * Create opening balance journal entry during initial system setup.
   *
   * The equity account will automatically be calculated as the balancing
   * value between total debits and total credits.
   *
   * Example:
   *
   * $balances = [
   *     ['account_id' => 1, 'balance' => 5000000],
   *     ['account_id' => 2, 'balance' => 50000000],
   * ];
   */
  public static function createOpeningBalance(string $date, array $balances): JournalEntry
  {
    $entry = self::makeEntry(
      date: $date,
      description: 'Saldo Awal',
      type: 'opening_balance',
      referenceId: null,
    );

    $totalDebit  = 0;
    $totalCredit = 0;

    foreach ($balances as $item) {
      $account = Account::findOrFail($item['account_id']);
      $amount  = (float) $item['balance'];

      if ($account->normal_balance === 'debit') {
        $entry->lines()->create(self::debit($account, $amount, 'Saldo Awal'));
        $totalDebit += $amount;
      } else {
        $entry->lines()->create(self::credit($account, $amount, 'Saldo Awal'));
        $totalCredit += $amount;
      }
    }

    // Modal sebagai penyeimbang otomatis
    $selisih = $totalDebit - $totalCredit;
    if ($selisih != 0) {
      $modal = self::account('equity');
      $entry->lines()->create(
        $selisih > 0
          ? self::credit($modal, $selisih, 'Modal Awal')
          : self::debit($modal, abs($selisih), 'Modal Awal')
      );
    }

    return $entry;
  }

  // ------------------------------------------------------------------------
  // MANUAL JOURNAL
  // ------------------------------------------------------------------------

  /**
   * Create a manual journal entry for non-operational transactions.
   *
   * Examples:
   *  - Capital investment
   *  - Loan received
   *  - Loan repayment
   *  - Owner withdrawal (prive)
   *  - Other manual adjustments
   *
   * Example structure:
   *
   * $lines = [
   *     ['account_id' => X, 'debit' => 100000, 'credit' => 0,      'notes' => '...'],
   *     ['account_id' => Y, 'debit' => 0,      'credit' => 100000, 'notes' => '...'],
   * ];
   *
   * The system will validate that total debit equals total credit.
   * If not balanced, an exception will be thrown.
   */
  public static function createManual(string $date, string $description, array $lines): JournalEntry
  {
    $totalDebit  = collect($lines)->sum('debit');
    $totalCredit = collect($lines)->sum('credit');

    if (round($totalDebit, 2) !== round($totalCredit, 2)) {
      throw new \InvalidArgumentException(
        "Jurnal tidak balance. Total debit: {$totalDebit}, total credit: {$totalCredit}"
      );
    }

    $entry = self::makeEntry(
      date: $date,
      description: $description,
      type: 'manual',
      referenceId: null,
    );

    foreach ($lines as $line) {
      $entry->lines()->create([
        'account_id' => $line['account_id'],
        'debit'      => $line['debit'] ?? 0,
        'credit'     => $line['credit'] ?? 0,
        'notes'      => $line['notes'] ?? null,
      ]);
    }

    return $entry;
  }

  // ------------------------------------------------------------------------
  // PRIVATE HELPERS
  // ------------------------------------------------------------------------

  private static function makeEntry(string $date, string $description, string $type, ?int $referenceId): JournalEntry
  {
    return JournalEntry::create([
      'date'           => $date,
      'description'    => $description,
      'reference_type' => $type,
      'reference_id'   => $referenceId,
    ]);
  }

  private static function debit(Account $account, float $amount, ?string $notes = null): array
  {
    return [
      'account_id' => $account->id,
      'debit'      => $amount,
      'credit'     => 0,
      'notes'      => $notes,
    ];
  }

  private static function credit(Account $account, float $amount, ?string $notes = null): array
  {
    return [
      'account_id' => $account->id,
      'debit'      => 0,
      'credit'     => $amount,
      'notes'      => $notes,
    ];
  }

  private static function account(string $category): Account
  {
    return Account::where('category', $category)
      ->where('status', 'active')
      ->firstOrFail();
  }

  private static function entryExists(string $type, int $id): bool
  {
    return JournalEntry::where('reference_type', $type)
      ->where('reference_id', $id)
      ->exists();
  }
}
