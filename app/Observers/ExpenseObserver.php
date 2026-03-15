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

    // Case 1: billable -> non-billable, not yet invoiced
    if ($wasBillable && !$isBillable && is_null($expense->invoice_id)) {
      JournalService::correctBillableToNonBillable($expense);
      return;
    }

    // Case 2: non-billable -> billable
    if (!$wasBillable && $isBillable) {
      JournalService::correctNonBillableToBillable($expense);
      return;
    }

    // Case 3: non-billable, amount changed
    if (!$isBillable && $amountChanged) {
      JournalService::correctExpenseAmount($expense, $oldAmount, $newAmount);
      return;
    }

    // Case 4: billable, not yet invoiced, amount changed
    if ($isBillable && is_null($expense->invoice_id) && $amountChanged) {
      JournalService::correctReimbursementAmount($expense, $oldAmount, $newAmount);
      return;
    }
  }
}
