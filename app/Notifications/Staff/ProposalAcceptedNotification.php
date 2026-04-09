<?php

namespace App\Notifications\Staff;

use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ProposalAcceptedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Proposal $proposal
    ) {}

    public function via(): array
    {
        return ['database'];
    }

    public function toDatabase(): array
    {
        return [
            'title' => 'Proposal Diterima',
            'message' => "Proposal \"{$this->proposal->proposal_number}\" dari \"{$this->proposal->customer?->name}\" telah diterima oleh klien.",
            'action_url' => "/finances/proposals/{$this->proposal->id}",
            'icon' => 'document',
            'type' => 'proposal_accepted',
            'meta' => [
                'proposal_id' => $this->proposal->id,
                'proposal_number' => $this->proposal->proposal_number,
                'customer_name' => $this->proposal->customer?->name,
            ],
        ];
    }

    public function toArray(): array
    {
        return $this->toDatabase();
    }
}
