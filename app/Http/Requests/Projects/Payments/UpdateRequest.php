<?php

namespace App\Http\Requests\Projects\Payments;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount'            => 'required|numeric|min:0',
            'payment_date'      => 'required|date',
            'payment_method'    => 'nullable|string',
            'reference_number'  => 'nullable|string|max:255',
            'proof_file'        => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:5120',
            'remove_proof_file' => 'nullable|boolean',
            'notes'             => 'nullable|string',
            'resubmit'          => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'amount.required'   => 'Jumlah pembayaran wajib diisi.',
            'amount.numeric'    => 'Jumlah pembayaran harus berupa angka.',
            'amount.min'        => 'Jumlah pembayaran tidak boleh kurang dari 0.',

            'payment_date.required' => 'Tanggal pembayaran wajib diisi.',
            'payment_date.date'     => 'Format tanggal pembayaran tidak valid.',

            'reference_number.max' => 'Nomor referensi maksimal :max karakter.',

            'proof_file.file'  => 'Bukti pembayaran harus berupa file.',
            'proof_file.mimes' => 'Bukti pembayaran harus berupa JPG, PNG, WEBP, atau PDF.',
            'proof_file.max'   => 'Ukuran file maksimal 5MB.',
        ];
    }
}
