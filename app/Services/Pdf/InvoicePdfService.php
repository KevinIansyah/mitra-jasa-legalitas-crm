<?php

namespace App\Services\Pdf;

use App\Helpers\FileHelper;
use App\Models\ProjectInvoice;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\Storage;
use Spatie\Browsershot\Browsershot;

class InvoicePdfService
{
  public function generate(ProjectInvoice $invoice): string
  {
    $invoice->loadMissing([
      'project.customer',
      'project.company',
      'customer',
      'items',
    ]);

    $settings = SiteSetting::get();

    $html = view('pdf.finances.invoices.invoice', [
      'invoice'  => $invoice,
      'settings' => $settings,
    ])->render();

    $pdfContent = Browsershot::html($html)
      ->format('A4')
      ->margins(15, 15, 15, 15)
      ->showBackground()
      ->waitUntilNetworkIdle()
      ->timeout(30)
      ->pdf();

    $filename = 'invoices/' . $invoice->invoice_number . '.pdf';
    Storage::disk('r2_public')->put($filename, $pdfContent);

    return $filename;
  }

  public function delete(ProjectInvoice $invoice): void
  {
    if ($invoice->file_path) {
      FileHelper::deleteFromR2($invoice->file_path, isPublic: true);
    }
  }
}
