<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Helpers\FileHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ClientPayments\StorePaymentRequest;
use App\Http\Requests\Api\ClientPayments\UpdatePaymentRequest;
use App\Models\ProjectInvoice;
use App\Models\ProjectPayment;
use App\Notifications\Staff\NewPaymentNotification;
use App\Services\NotificationService;
use App\Support\ApiFileUrls;
use Illuminate\Http\Request;

class ClientPaymentController extends Controller
{
    public function store(StorePaymentRequest $request, ProjectInvoice $invoice)
    {
        $validated = $request->validated();

        if ($request->hasFile('proof_file')) {
            $fileData = FileHelper::uploadToR2(
                $request->file('proof_file'),
                "invoices/{$invoice->id}/payments",
            );
            $validated['proof_file'] = $fileData['path'];
        } else {
            unset($validated['proof_file']);
        }

        $payment = $invoice->payments()->create($validated);
        $payment->load(['invoice.project.customer', 'invoice.customer']);

        NotificationService::notifyStaff(new NewPaymentNotification($payment));

        ApiFileUrls::payment($payment);

        return ApiResponse::success($payment, 'Pembayaran berhasil ditambahkan, menunggu verifikasi.', 201);
    }

    public function index(Request $request, ProjectInvoice $invoice)
    {
        $payments = $invoice->payments()
            ->latest()
            ->get();

        ApiFileUrls::payments($payments);

        return ApiResponse::success($payments);
    }

    public function update(UpdatePaymentRequest $request, ProjectInvoice $invoice, ProjectPayment $payment)
    {
        if ($payment->invoice_id !== $invoice->id) {
            return ApiResponse::notFound('Faktur tidak ditemukan.');
        }

        if ($payment->isVerified()) {
            return ApiResponse::conflict('Pembayaran yang sudah diverifikasi tidak dapat diubah.');
        }

        $wasRejected = $payment->isRejected();

        $validated = $request->validated();

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

        unset($validated['remove_proof_file'], $validated['resubmit']);

        $payment->update($validated);

        if ($request->boolean('resubmit') && $payment->fresh()->isRejected()) {
            $payment->update([
                'status' => 'pending',
                'rejection_reason' => null,
            ]);
        }

        $payment->refresh()->load(['invoice.project.customer', 'invoice.customer']);

        if ($wasRejected && $payment->isPending()) {
            NotificationService::notifyStaff(new NewPaymentNotification($payment));
        }

        ApiFileUrls::payment($payment);

        return ApiResponse::updated($payment, 'Pembayaran berhasil diperbarui.');
    }

    public function destroy(ProjectInvoice $invoice, ProjectPayment $payment)
    {
        if ($payment->invoice_id !== $invoice->id) {
            return ApiResponse::notFound('Pembayaran tidak ditemukan.');
        }

        if ($payment->isVerified()) {
            return ApiResponse::conflict('Pembayaran yang sudah diverifikasi tidak dapat dihapus.');
        }

        if ($payment->proof_file) {
            FileHelper::deleteFromR2($payment->proof_file);
        }

        $payment->delete();

        return ApiResponse::success(null, 'Pembayaran berhasil dihapus.');
    }
}
