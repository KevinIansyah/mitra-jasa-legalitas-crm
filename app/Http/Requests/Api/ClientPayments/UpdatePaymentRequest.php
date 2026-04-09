<?php

namespace App\Http\Requests\Api\ClientPayments;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => 'required|numeric|min:1',
            'payment_date' => 'required|date',
            'payment_method' => 'required|string',
            'reference_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'proof_file' => 'nullable|file|mimes:jpg,jpeg,png,webp,svg+xml,pdf|max:5120',
            'remove_proof_file' => 'sometimes|boolean',
            'resubmit' => 'sometimes|boolean',
        ];
    }

    public function messages(): array
    {
        return [
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
        ];
    }
}
