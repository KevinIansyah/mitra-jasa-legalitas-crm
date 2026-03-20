<?php

namespace App\Jobs;

use App\Models\ProjectInvoice;
use App\Notifications\Client\InvoiceDueReminderNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessInvoiceDueReminders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly int $daysLeft
    ) {}

    public function handle(): void
    {
        ProjectInvoice::with(['project.customer.user', 'customer.user'])
            ->where('status', 'sent')
            ->whereDate('due_date', now()->addDays($this->daysLeft)->toDateString())
            ->each(function ($invoice) {
                $user = $invoice->customer?->user ?? $invoice->project?->customer?->user;
                if ($user) {
                    $user->notify(new InvoiceDueReminderNotification($invoice, $this->daysLeft));
                }
            });
    }
}
