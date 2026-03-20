<?php

namespace App\Jobs;

use App\Models\Proposal;
use App\Notifications\Client\ProposalExpiredNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessProposalExpired implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        Proposal::with(['customer.user'])
            ->where('status', 'sent')
            ->whereNotNull('valid_until')
            ->whereDate('valid_until', '<', now()->toDateString())
            ->each(function ($proposal) {
                $proposal->update(['status' => 'expired']);

                if ($proposal->customer?->user) {
                    $proposal->customer->user->notify(
                        new ProposalExpiredNotification($proposal)
                    );
                }
            });
    }
}
