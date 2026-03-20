<?php

namespace App\Jobs;

use App\Models\ProjectInvoice;
use App\Notifications\Client\InvoiceOverdueNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessInvoiceOverdue implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        ProjectInvoice::with(['project.customer.user', 'customer.user'])
            ->where('status', 'sent')
            ->whereDate('due_date', '<', now()->toDateString())
            ->each(function ($invoice) {
                $invoice->update(['status' => 'overdue']);

                $user = $invoice->customer?->user ?? $invoice->project?->customer?->user;
                if ($user) {
                    $user->notify(new InvoiceOverdueNotification($invoice));
                }
            });
    }
}
