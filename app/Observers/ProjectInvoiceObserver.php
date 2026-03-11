<?php

namespace App\Observers;

use App\Models\ProjectInvoice;
use App\Services\JournalService;

class ProjectInvoiceObserver
{
  public function updated(ProjectInvoice $invoice): void
  {
    if (! $invoice->wasChanged('status')) return;

    match ($invoice->status) {
      'sent'      => JournalService::createFromInvoice($invoice),
      'cancelled' => JournalService::reverseInvoice($invoice),
      default     => null,
    };
  }
}
