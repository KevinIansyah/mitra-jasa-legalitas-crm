<?php

namespace App\Notifications\Client;

use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProposalExpiredNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Proposal $proposal
    ) {}

    public function via(): array
    {
        return ['database', 'mail'];
    }

    public function toMail(): MailMessage
    {
        return (new MailMessage)
            ->subject("Proposal Kadaluarsa: {$this->proposal->proposal_number}")
            ->view('emails.client.proposal-expired', [
                'proposal' => $this->proposal,
            ]);
    }

    public function toDatabase(): array
    {
        return [
            'title' => 'Proposal Kadaluarsa',
            'message' => "Proposal {$this->proposal->proposal_number} untuk \"{$this->proposal->project_name}\" telah kadaluarsa.",
            'action_url' => frontend_url("/portal/proposal/{$this->proposal->id}"),
            'icon' => 'warning',
            'type' => 'proposal_expired',
            'meta' => [
                'proposal_id' => $this->proposal->id,
                'proposal_number' => $this->proposal->proposal_number,
                'project_name' => $this->proposal->project_name,
                'valid_until' => $this->proposal->valid_until?->format('Y-m-d'),
            ],
        ];
    }

    public function toArray(): array
    {
        return $this->toDatabase();
    }
}
