<?php

namespace App\Http\Controllers\Api;

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
            'proof_file'       => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $customer = $invoice->customer ?? $invoice->project?->customer;
        if ($customer?->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
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

        return response()->json([
            'message' => 'Pembayaran berhasil ditambahkan, menunggu verifikasi.',
            'data'    => $payment,
        ], 201);
    }

    public function index(Request $request, ProjectInvoice $invoice)
    {
        $customer = $invoice->customer ?? $invoice->project?->customer;
        if ($customer?->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $payments = $invoice->payments()
            ->latest()
            ->get();

        return response()->json(['data' => $payments]);
    }

    public function destroy(ProjectInvoice $invoice, ProjectPayment $payment)
    {
        $customer = $invoice->customer ?? $invoice->project?->customer;
        if ($customer?->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($payment->invoice_id !== $invoice->id) {
            return response()->json(['message' => 'Pembayaran tidak ditemukan.'], 404);
        }

        if ($payment->isVerified()) {
            return response()->json(['message' => 'Pembayaran yang sudah diverifikasi tidak dapat dihapus.'], 422);
        }

        if ($payment->proof_file) {
            FileHelper::deleteFromR2($payment->proof_file);
        }

        $payment->delete();

        return response()->json(['message' => 'Pembayaran berhasil dihapus.']);
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
