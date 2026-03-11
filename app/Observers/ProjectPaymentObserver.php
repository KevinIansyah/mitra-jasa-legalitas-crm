<?php

namespace App\Observers;

use App\Models\ProjectPayment;
use App\Services\JournalService;

class ProjectPaymentObserver
{
  public function updated(ProjectPayment $payment): void
  {
    if ($payment->wasChanged('status') && $payment->status === 'verified') {
      JournalService::createFromPayment($payment);
    }
  }
}
