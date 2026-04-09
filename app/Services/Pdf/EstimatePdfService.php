<?php

namespace App\Services\Pdf;

use App\Helpers\FileHelper;
use App\Models\Estimate;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\Storage;
use Spatie\Browsershot\Browsershot;

class EstimatePdfService
{
    public function generate(Estimate $estimate): string
    {
        $estimate->loadMissing([
            'customer',
            'proposal.customer',
            'quote.customer',
            'items',
        ]);

        $settings = SiteSetting::get();

        $html = view('pdf.finances.estimates.estimate', [
            'estimate' => $estimate,
            'settings' => $settings,
        ])->render();

        set_time_limit(180);

        $pdfContent = Browsershot::html($html)
            ->format('A4')
            ->margins(15, 15, 15, 15)
            ->showBackground()
            ->waitUntilNetworkIdle()
            ->timeout(120)
            ->pdf();

        $filename = 'estimates/'.$estimate->estimate_number.'.pdf';
        Storage::disk('r2_public')->put($filename, $pdfContent);

        return $filename;
    }

    public function delete(Estimate $estimate): void
    {
        if ($estimate->file_path) {
            FileHelper::deleteFromR2($estimate->file_path, isPublic: true);
        }
    }
}
