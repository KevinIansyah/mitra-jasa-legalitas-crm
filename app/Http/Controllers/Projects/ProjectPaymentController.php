<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Helpers\FileHelper;
use App\Models\ProjectInvoice;
use App\Models\ProjectPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProjectPaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');
        $status = $request->get('status');
        $method = $request->get('payment_method');

        $query = ProjectPayment::with([
            'invoice',
            'invoice.project:id,name,customer_id',
            'invoice.project.customer:id,name',
            'verifier:id,name',
        ]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                    ->orWhereHas('invoice', fn($q) => $q->where('invoice_number', 'like', "%{$search}%"))
                    ->orWhereHas('invoice.project', fn($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        if ($status) $query->where('status', $status);
        if ($method) $query->where('payment_method', $method);

        $payments = $query->latest()->paginate($perPage);

        $summary = ProjectPayment::query()
            ->selectRaw("
            COUNT(*) as total,
            SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified,
            SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
            SUM(amount) as total_amount,
            SUM(CASE WHEN status = 'verified' THEN amount ELSE 0 END) as verified_amount
        ")
            ->first();

        return Inertia::render('finances/payments/index', [
            'payments' => $payments,
            'summary'  => $summary,
            'filters'  => [
                'search'         => $search,
                'per_page'       => $perPage,
                'status'         => $status,
                'payment_method' => $method,
            ],
        ]);
    }

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
