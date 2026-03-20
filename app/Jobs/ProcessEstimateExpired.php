<?php

namespace App\Jobs;

use App\Models\Estimate;
use App\Notifications\Client\EstimateExpiredNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessEstimateExpired implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        Estimate::with(['customer.user', 'proposal.customer.user', 'quote.user'])
            ->where('status', 'sent')
            ->whereNotNull('valid_until')
            ->whereDate('valid_until', '<', now()->toDateString())
            ->each(function ($estimate) {
                $estimate->update(['status' => 'expired']);

                $user = $estimate->customer?->user
                    ?? $estimate->proposal?->customer?->user
                    ?? $estimate->quote?->user;

                if ($user) {
                    $user->notify(new EstimateExpiredNotification($estimate));
                }
            });
    }
}
