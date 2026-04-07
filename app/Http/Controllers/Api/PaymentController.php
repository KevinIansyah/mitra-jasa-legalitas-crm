<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Helpers\FileHelper;
use App\Http\Controllers\Controller;
use App\Models\ProjectInvoice;
use App\Models\ProjectPayment;
use App\Models\User;
use App\Notifications\Staff\NewPaymentNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;

class PaymentController extends Controller
{
    public function store(Request $request, ProjectInvoice $invoice)
    {
        $validated = $request->validate([
            'amount'           => 'required|numeric|min:1',
            'payment_date'     => 'required|date',
            'payment_method'   => 'required|string',
            'reference_number' => 'nullable|string|max:255',
            'notes'            => 'nullable|string|max:1000',
            'proof_file'       => 'nullable|file|mimes:jpg,jpeg,png,webp,svg+xml,pdf|max:5120',
        ],[
            'amount.required' => 'Jumlah pembayaran wajib diisi.',
            'amount.numeric' => 'Jumlah pembayaran harus berupa angka.',
            'amount.min' => 'Jumlah pembayaran tidak boleh kurang dari 1.',
            'payment_date.required' => 'Tanggal pembayaran wajib diisi.',
            'payment_date.date' => 'Tanggal pembayaran tidak valid.',
            'payment_method.required' => 'Metode pembayaran wajib diisi.',
            'payment_method.string' => 'Metode pembayaran harus berupa teks.',
            'reference_number.max' => 'Nomor referensi maksimal 255 karakter.',
            'notes.max' => 'Catatan maksimal 1000 karakter.',
            'proof_file.file' => 'Bukti pembayaran harus berupa file.',
            'proof_file.mimes' => 'Bukti pembayaran harus berupa gambar (JPG, PNG, WEBP, SVG) atau berkas (PDF).',
            'proof_file.max' => 'Ukuran file maksimal 5MB.',
        ]);

        $customer = $invoice->customer ?? $invoice->project?->customer;
        if ($customer?->user_id !== Auth::id()) {
            return ApiResponse::forbidden();
        }

        if ($request->hasFile('proof_file')) {
            $fileData = FileHelper::uploadToR2(
                $request->file('proof_file'),
                "invoices/{$invoice->id}/payments",
            );
            $validated['proof_file'] = $fileData['path'];
        }

        $payment = $invoice->payments()->create($validated);
        $payment->load(['invoice.project.customer', 'invoice.customer']);

        $this->notifyStaff($payment);

        return ApiResponse::success($payment, 'Pembayaran berhasil ditambahkan, menunggu verifikasi.', 201);
    }

    public function index(Request $request, ProjectInvoice $invoice)
    {
        $customer = $invoice->customer ?? $invoice->project?->customer;
        if ($customer?->user_id !== Auth::id()) {
            return ApiResponse::forbidden();
        }

        $payments = $invoice->payments()
            ->latest()
            ->get();

        return ApiResponse::success($payments);
    }

    public function destroy(ProjectInvoice $invoice, ProjectPayment $payment)
    {
        $customer = $invoice->customer ?? $invoice->project?->customer;
        if ($customer?->user_id !== Auth::id()) {
            return ApiResponse::forbidden();
        }

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

    private function notifyStaff(ProjectPayment $payment): void
    {
        $project = $payment->invoice->project;

        $recipients = collect();

        if ($project) {
            $recipients = $project->teamMembers()->get();
        }

        $superAdmins = User::role('super_admin')->get();
        $recipients  = $recipients->merge($superAdmins)->unique('id');

        Notification::send($recipients, new NewPaymentNotification($payment));
    }
}
