<?php

namespace App\Services\Pdf;

use App\Helpers\FileHelper;
use App\Models\ProjectPayment;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\Storage;
use Spatie\Browsershot\Browsershot;

class ReceiptPdfService
{
  public function generate(ProjectPayment $payment): string
  {
    $payment->loadMissing([
      'invoice.project.customer',
      'invoice.project.company',
      'invoice.customer',
      'verifier',
    ]);

    $settings = SiteSetting::get();

    $html = view('pdf.finances.receipts.receipt', [
      'payment'  => $payment,
      'invoice'  => $payment->invoice,
      'settings' => $settings,
    ])->render();

    $pdfContent = Browsershot::html($html)
      ->format('A4')
      ->margins(15, 15, 15, 15)
      ->showBackground()
      ->waitUntilNetworkIdle()
      ->timeout(30)
      ->pdf();

    $filename = 'receipts/' . $payment->receipt_number . '.pdf';
    Storage::disk('r2_public')->put($filename, $pdfContent);

    return $filename;
  }

  public function delete(ProjectPayment $payment): void
  {
    if ($payment->file_path) {
      FileHelper::deleteFromR2($payment->file_path, isPublic: true);
    }
  }
}
