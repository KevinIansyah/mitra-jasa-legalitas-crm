<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\ProjectInvoice;
use App\Models\ProjectPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectPaymentController extends Controller
{
    /**
     * Store a newly created payment.
     */
    public function store(Request $request, ProjectInvoice $invoice)
    {
        $validated = $request->validate([
            'amount'           => 'required|numeric|min:0',
            'payment_date'     => 'required|date',
            'payment_method'   => 'nullable|string',
            'reference_number' => 'nullable|string|max:255',
            'proof_file'       => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:5120',
            'notes'            => 'nullable|string',
        ]);

        if ($request->hasFile('proof_file')) {
            $fileData = FileHelper::uploadToR2(
                $request->file('proof_file'),
                "invoices/{$invoice->id}/payments",
            );
            $validated['proof_file'] = $fileData['path'];
        }

        $invoice->payments()->create($validated);

        return back()->with('success', 'Pembayaran berhasil ditambahkan.');
    }

    /**
     * Update the specified payment.
     */
    public function update(Request $request, ProjectInvoice $invoice, ProjectPayment $payment)
    {
        if ($error = $this->validatePaymentBelongsToInvoice($invoice, $payment)) return $error;
        if ($error = $this->validatePaymentEditable($payment)) return $error;

        $validated = $request->validate([
            'amount'            => 'required|numeric|min:0',
            'payment_date'      => 'required|date',
            'payment_method'    => 'nullable|string',
            'reference_number'  => 'nullable|string|max:255',
            'proof_file'        => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:5120',
            'remove_proof_file' => 'nullable|boolean',
            'notes'             => 'nullable|string',
            'resubmit'          => 'nullable|boolean',
        ]);

        if ($request->boolean('remove_proof_file') && $payment->proof_file) {
            FileHelper::deleteFromR2($payment->proof_file);
            $validated['proof_file'] = null;
        }

        if ($request->hasFile('proof_file')) {
            if ($payment->proof_file) {
                FileHelper::deleteFromR2($payment->proof_file);
            }
            $fileData = FileHelper::uploadToR2(
                $request->file('proof_file'),
                "invoices/{$invoice->id}/payments",
            );
            $validated['proof_file'] = $fileData['path'];
        }

        $payment->update($validated);

        if ($request->boolean('resubmit') && $payment->isRejected()) {
            $payment->update([
                'status'           => 'pending',
                'rejection_reason' => null,
            ]);
        }

        return back()->with('success', 'Pembayaran berhasil diperbarui.');
    }

    /**
     * Update status payment (verify / reject).
     */
    public function updateStatus(Request $request, ProjectInvoice $invoice, ProjectPayment $payment)
    {
        if ($error = $this->validatePaymentBelongsToInvoice($invoice, $payment)) return $error;
        if ($error = $this->validatePaymentPending($payment)) return $error;

        $request->validate([
            'status'           => 'required|in:verified,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string|max:1000',
        ]);

        match ($request->status) {
            'verified' => $payment->verify(Auth::user()),
            'rejected' => $payment->reject($request->rejection_reason),
        };

        $messages = [
            'verified' => 'Pembayaran berhasil diverifikasi.',
            'rejected' => 'Pembayaran berhasil ditolak.',
        ];

        return back()->with('success', $messages[$request->status]);
    }

    /**
     * Delete the specified payment.
     */
    public function destroy(ProjectInvoice $invoice, ProjectPayment $payment)
    {
        if ($error = $this->validatePaymentBelongsToInvoice($invoice, $payment)) return $error;
        if ($error = $this->validatePaymentEditable($payment)) return $error;

        if ($payment->proof_file) {
            FileHelper::deleteFromR2($payment->proof_file);
        }

        $payment->delete();

        return back()->with('success', 'Pembayaran berhasil dihapus.');
    }

    /**
     * Validate payment belongs to invoice.
     */
    private function validatePaymentBelongsToInvoice(ProjectInvoice $invoice, ProjectPayment $payment)
    {
        if ($payment->invoice_id !== $invoice->id) {
            return back()->withErrors(['payment' => 'Pembayaran tidak ditemukan.']);
        }

        return null;
    }

    /**
     * Validate payment is editable.
     */
    private function validatePaymentEditable(ProjectPayment $payment)
    {
        if ($payment->isVerified()) {
            return back()->withErrors(['payment' => 'Pembayaran yang sudah diverifikasi tidak dapat diubah.']);
        }

        return null;
    }

    /**
     * Validate payment is pending.
     */
    private function validatePaymentPending(ProjectPayment $payment)
    {
        if (!$payment->isPending()) {
            return back()->withErrors(['payment' => 'Hanya pembayaran pending yang dapat diubah statusnya.']);
        }

        return null;
    }
}
