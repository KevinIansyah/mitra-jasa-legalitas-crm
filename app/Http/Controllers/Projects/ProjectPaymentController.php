<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Helpers\FileHelper;
use App\Http\Requests\Projects\Payments\StoreRequest;
use App\Http\Requests\Projects\Payments\UpdateRequest;
use App\Models\ProjectInvoice;
use App\Models\ProjectPayment;
use App\Models\SiteSetting;
use App\Notifications\Client\PaymentAcceptedNotification;
use App\Notifications\Client\PaymentRejectedNotification;
use App\Services\Pdf\ReceiptPdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProjectPaymentController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');
        $status = $request->get('status');
        $method = $request->get('payment_method');

        $payments = ProjectPayment::with([
            'invoice',
            'invoice.project:id,name,customer_id',
            'invoice.project.customer:id,name',
            'verifier:id,name',
        ])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('reference_number', 'like', "%{$search}%")
                        ->orWhereHas(
                            'invoice',
                            fn($q) =>
                            $q->where('invoice_number', 'like', "%{$search}%")
                        )
                        ->orWhereHas(
                            'invoice.project',
                            fn($q) =>
                            $q->where('name', 'like', "%{$search}%")
                        );
                });
            })
            ->when($status, fn($q, $status) => $q->where('status', $status))
            ->when($method, fn($q, $method) => $q->where('payment_method', $method))
            ->latest()
            ->paginate($perPage);

        $summary = ProjectPayment::query()
            ->selectRaw("
                COUNT(*) as total,
                COALESCE(SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END), 0) as pending,
                COALESCE(SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END), 0) as verified,
                COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) as rejected,
                COALESCE(SUM(amount), 0) as total_amount,
                COALESCE(SUM(CASE WHEN status = 'verified' THEN amount ELSE 0 END), 0) as verified_amount
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

    public function show(ProjectInvoice $invoice, ProjectPayment $payment)
    {
        $payment->load([
            'invoice.project.customer',
            'invoice.project.company',
            'invoice.customer',
            'invoice.payments' => fn($q) => $q->where('status', 'verified'),
            'verifier',
        ]);

        return Inertia::render('finances/payments/detail/index', [
            'payment'  => $payment,
            'settings' => SiteSetting::get(),
        ]);
    }

    public function store(StoreRequest $request, ProjectInvoice $invoice)
    {
        $validated = $request->validated();

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

    public function update(UpdateRequest $request, ProjectInvoice $invoice, ProjectPayment $payment)
    {
        if ($error = $this->validatePaymentBelongsToInvoice($invoice, $payment)) return $error;
        if ($error = $this->validatePaymentEditable($payment)) return $error;

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

        $payment->update($validated);

        if ($request->boolean('resubmit') && $payment->isRejected()) {
            $payment->update([
                'status'           => 'pending',
                'rejection_reason' => null,
            ]);
        }

        return back()->with('success', 'Pembayaran berhasil diperbarui.');
    }

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

        $payment->loadMissing([
            'invoice.project.customer.user',
            'invoice.customer.user',
            'verifier',
        ]);

        $user = $payment->invoice->customer?->user
            ?? $payment->invoice->project?->customer?->user;

        if ($user) {
            match ($request->status) {
                'verified' => $user->notify(new PaymentAcceptedNotification($payment->fresh())),
                'rejected' => $user->notify(new PaymentRejectedNotification($payment->fresh())),
            };
        }

        $messages = [
            'verified' => 'Pembayaran berhasil diverifikasi.',
            'rejected' => 'Pembayaran berhasil ditolak.',
        ];

        return back()->with('success', $messages[$request->status]);
    }

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

    public function downloadReceiptPdf(ProjectInvoice $invoice, ProjectPayment $payment)
    {
        if (!$payment->file_path) {
            abort(404, 'Kwitansi belum tersedia.');
        }

        $content  = FileHelper::downloadFromR2Public($payment->file_path);
        $filename = 'kwitansi-' . $payment->receipt_number . '.pdf';

        return response($content, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    public function regenerateReceiptPdf(ProjectInvoice $invoice, ProjectPayment $payment)
    {
        if (!$payment->isVerified()) {
            return back()->withErrors(['error' => 'Hanya pembayaran terverifikasi yang dapat digenerate kwitansinya.']);
        }

        try {
            $pdfService = app(ReceiptPdfService::class);
            $pdfService->delete($payment);
            $filePath = $pdfService->generate($payment->fresh());
            $payment->update(['file_pathpath' => $filePath]);

            return back()->with('success', 'Kwitansi berhasil di-generate ulang.');
        } catch (\Exception $e) {
            Log::error('Receipt PDF manual regeneration failed', [
                'payment_id' => $payment->id,
                'error'      => $e->getMessage(),
            ]);

            return back()->withErrors(['error' => 'Gagal generate kwitansi: ' . $e->getMessage()]);
        }
    }

    private function validatePaymentBelongsToInvoice(ProjectInvoice $invoice, ProjectPayment $payment)
    {
        if ($payment->invoice_id !== $invoice->id) {
            return back()->withErrors(['error' => 'Pembayaran tidak ditemukan.']);
        }

        return null;
    }

    private function validatePaymentEditable(ProjectPayment $payment)
    {
        if ($payment->isVerified()) {
            return back()->withErrors(['error' => 'Pembayaran yang sudah diverifikasi tidak dapat diubah.']);
        }

        return null;
    }

    private function validatePaymentPending(ProjectPayment $payment)
    {
        if (!$payment->isPending()) {
            return back()->withErrors(['error' => 'Hanya pembayaran pending yang dapat diubah statusnya.']);
        }

        return null;
    }
}
