<?php

namespace App\Observers;

use App\Models\Expense;
use App\Services\JournalService;

class ExpenseObserver
{
  public function created(Expense $expense): void
  {
    JournalService::createFromExpense($expense);
  }

  public function updated(Expense $expense): void
  {
    $oldAmount     = (float) $expense->getOriginal('amount');
    $newAmount     = (float) $expense->amount;
    $wasBillable   = (bool) $expense->getOriginal('is_billable');
    $isBillable    = (bool) $expense->is_billable;
    $amountChanged = $oldAmount !== $newAmount;

    // Kasus 1: billable → non-billable, belum masuk invoice
    if ($wasBillable && !$isBillable && is_null($expense->invoice_id)) {
      JournalService::correctBillableToNonBillable($expense);
      return;
    }

    // Kasus 2: non-billable → billable ← TAMBAH INI
    if (!$wasBillable && $isBillable) {
      JournalService::correctNonBillableToBillable($expense);
      return;
    }

    // Kasus 2: non-billable, amount berubah
    if (!$isBillable && $amountChanged) {
      JournalService::correctExpenseAmount($expense, $oldAmount, $newAmount);
      return;
    }

    // Kasus 3: billable, belum di invoice, amount berubah
    if ($isBillable && is_null($expense->invoice_id) && $amountChanged) {
      JournalService::correctReimbursementAmount($expense, $oldAmount, $newAmount);
      return;
    }
  }
}
