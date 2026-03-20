<?php

namespace App\Notifications\Client;

use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewProposalNotification extends Notification implements ShouldQueue
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
        $mail = (new MailMessage)
            ->subject("Proposal Baru: {$this->proposal->proposal_number}")
            ->view('emails.client.new-proposal', [
                'proposal' => $this->proposal,
            ]);

        if ($this->proposal->file_path) {
            try {
                $content  = \App\Helpers\FileHelper::downloadFromR2Public($this->proposal->file_path);
                $filename = 'proposal-' . $this->proposal->proposal_number . '.pdf';
                $mail->attachData($content, $filename, ['mime' => 'application/pdf']);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning('Failed to attach proposal PDF', [
                    'proposal_id' => $this->proposal->id,
                    'error'       => $e->getMessage(),
                ]);
            }
        }

        return $mail;
    }

    public function toDatabase(): array
    {
        return [
            'title'      => 'Proposal Baru',
            'message'    => "Proposal {$this->proposal->proposal_number} untuk \"{$this->proposal->project_name}\" telah dikirimkan.",
            'action_url' => "/portal/proposal/{$this->proposal->id}",
            'icon'       => 'document',
            'type'       => 'new_proposal',
            'meta'       => [
                'proposal_id'     => $this->proposal->id,
                'proposal_number' => $this->proposal->proposal_number,
                'project_name'    => $this->proposal->project_name,
                'total_amount'    => $this->proposal->total_amount,
                'valid_until'     => $this->proposal->valid_until?->format('Y-m-d'),
            ],
        ];
    }

    public function toArray(): array
    {
        return $this->toDatabase();
    }
}
