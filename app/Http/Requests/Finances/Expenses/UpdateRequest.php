<?php

namespace App\Http\Requests\Finances\Expenses;

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
            'project_id'   => 'nullable|integer|exists:projects,id',
            'vendor_id'   => 'nullable|integer|exists:vendors,id',
            'vendor_name' => 'nullable|string|max:255',
            'category'           => 'required|string|max:100',
            'description'        => 'required|string',
            'amount'             => 'required|numeric|min:0',
            'expense_date'       => 'required|date',
            'receipt_file'       => 'nullable|file|mimes:jpg,jpeg,png,webp,svg+xml,pdf|max:5120',
            'remove_receipt_file' => 'nullable|boolean',
            'is_billable'        => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'project_id.integer'   => 'ID proyek harus berupa angka.',
            'project_id.exists'    => 'ID proyek yang dipilih tidak valid.',
            'vendor_id.integer' => 'ID vendor harus berupa angka.',
            'vendor_id.exists'  => 'Vendor yang dipilih tidak valid.',
            'vendor_name.max'   => 'Nama vendor maksimal 255 karakter.',
            'category.required'    => 'Kategori pengeluaran wajib diisi.',
            'category.max'         => 'Kategori pengeluaran maksimal 100 karakter.',
            'description.required' => 'Deskripsi pengeluaran wajib diisi.',
            'amount.required'      => 'Jumlah pengeluaran wajib diisi.',
            'amount.numeric'       => 'Jumlah pengeluaran harus berupa angka.',
            'amount.min'           => 'Jumlah pengeluaran tidak boleh kurang dari 0.',
            'expense_date.required' => 'Tanggal pengeluaran wajib diisi.',
            'expense_date.date'    => 'Tanggal pengeluaran tidak valid.',
            'receipt_file.file'    => 'File struk harus berupa file yang valid.',
            'receipt_file.mimes'   => 'File struk harus berupa gambar (JPG, PNG, WEBP, SVG) atau berkas (PDF).',
            'receipt_file.max'     => 'Ukuran file struk maksimal 5MB.',
        ];
    }
}
