<?php

namespace App\Support;

use App\Helpers\FileHelper;
use App\Models\Estimate;
use App\Models\Project;
use App\Models\ProjectDeliverable;
use App\Models\ProjectDocument;
use App\Models\ProjectInvoice;
use App\Models\ProjectPayment;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Support\Collection;

class ApiFileUrls
{
    public static function userAvatar(User $user): void
    {
        $path = $user->getRawOriginal('avatar') ?? $user->avatar;
        $user->setAttribute('avatar', FileHelper::publicUrl($path));
    }

    public static function invoice(ProjectInvoice $invoice): void
    {
        $invoice->setAttribute('file_url', FileHelper::publicUrl($invoice->file_path));
    }

    public static function payment(ProjectPayment $payment): void
    {
        $payment->setAttribute('receipt_url', FileHelper::publicUrl($payment->file_path));
        $payment->setAttribute('proof_file_url', FileHelper::privateUrl($payment->proof_file));
    }

    public static function payments(Collection|array $payments): void
    {
        foreach ($payments as $payment) {
            self::payment($payment);
        }
    }

    public static function proposal(Proposal $proposal): void
    {
        $proposal->setAttribute('file_url', FileHelper::publicUrl($proposal->file_path));
    }

    public static function estimate(Estimate $estimate): void
    {
        $estimate->setAttribute('file_url', FileHelper::publicUrl($estimate->file_path));
    }

    public static function deliverable(ProjectDeliverable $deliverable): void
    {
        $deliverable->setAttribute('download_url', null);
    }

    public static function projectDocument(ProjectDocument $document): void
    {
        $document->setAttribute('download_url', null);
    }

    public static function project(Project $project): void
    {
        if ($project->relationLoaded('documents')) {
            foreach ($project->documents as $document) {
                self::projectDocument($document);
            }
        }

        if ($project->relationLoaded('deliverables')) {
            foreach ($project->deliverables as $deliverable) {
                self::deliverable($deliverable);
            }
        }
    }
}
