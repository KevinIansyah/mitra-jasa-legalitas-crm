<?php

namespace App\Services\Pdf;

use App\Helpers\FileHelper;
use App\Models\Proposal;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\Storage;
use Spatie\Browsershot\Browsershot;

class ProposalPdfService
{
  public function generate(Proposal $proposal): string
  {
    $proposal->loadMissing(['customer', 'items']);

    $settings = SiteSetting::get();

    $html = view('pdf.finances.proposals.proposal', [
      'proposal' => $proposal,
      'settings' => $settings,
    ])->render();

    $pdfContent = Browsershot::html($html)
      ->format('A4')
      ->margins(15, 15, 15, 15)
      ->showBackground()
      ->waitUntilNetworkIdle()
      ->timeout(30)
      ->pdf();

    $filename = 'proposals/' . $proposal->proposal_number . '.pdf';
    Storage::disk('r2_public')->put($filename, $pdfContent);

    return $filename;
  }

  public function delete(Proposal $proposal): void
  {
    if ($proposal->file_path) {
      FileHelper::deleteFromR2($proposal->file_path, isPublic: true);
    }
  }
}
