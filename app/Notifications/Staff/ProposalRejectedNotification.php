<?php

namespace App\Notifications\Staff;

use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ProposalRejectedNotification extends Notification implements ShouldQueue
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
            'title'      => 'Proposal Ditolak',
            'message'    => "Proposal \"{$this->proposal->proposal_number}\" dari \"{$this->proposal->customer?->name}\" telah ditolak." .
                ($this->proposal->rejected_reason ? " Alasan: {$this->proposal->rejected_reason}" : ''),
            'action_url' => "/finances/proposals/{$this->proposal->id}",
            'icon'       => 'warning',
            'type'       => 'proposal_rejected',
            'meta'       => [
                'proposal_id'     => $this->proposal->id,
                'proposal_number' => $this->proposal->proposal_number,
                'customer_name'   => $this->proposal->customer?->name,
                'rejected_reason' => $this->proposal->rejected_reason,
            ],
        ];
    }

    public function toArray(): array
    {
        return $this->toDatabase();
    }
}
