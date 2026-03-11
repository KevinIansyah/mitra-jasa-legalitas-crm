<?php

namespace App\Http\Requests\Projects\Invoices;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isAdditional = $this->input('type') === 'additional';

        $invoice = $this->route('invoice');
        $ignoreId = $invoice?->id ?? 'NULL';

        return [
            'invoice_number'       => "sometimes|required|string|unique:project_invoices,invoice_number,{$ignoreId}",

            'type'                 => 'required|in:dp,progress,final,additional',
            'invoice_date'         => 'required|date',
            'due_date'             => 'required|date|after_or_equal:invoice_date',
            'notes'                => 'nullable|string',
            'payment_instructions' => 'nullable|string',
            'status'               => 'nullable|in:draft,sent',

            'percentage'           => 'nullable|numeric|min:0|max:100',
            'subtotal'               => $isAdditional ? 'nullable|numeric|min:0' : 'required|numeric|min:0',
            'tax_percent'          => 'nullable|numeric|min:0|max:100',
            'discount_percent'     => 'nullable|numeric|min:0|max:100',

            'items'                    => $isAdditional ? 'required|array|min:1' : 'nullable|array',
            'items.*.expense_id'           => 'nullable|integer|exists:expenses,id',
            'items.*.description'      => $isAdditional ? 'required|string|max:500' : 'nullable|string|max:500',
            'items.*.quantity'         => $isAdditional ? 'required|numeric|min:0.01' : 'nullable|numeric|min:0.01',
            'items.*.unit_price'       => $isAdditional ? 'required|numeric|min:0' : 'nullable|numeric|min:0',
            'items.*.tax_percent'      => 'nullable|numeric|min:0|max:100',
            'items.*.discount_percent' => 'nullable|numeric|min:0|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'invoice_number.unique'    => 'Nomor invoice sudah digunakan.',

            'type.required'            => 'Jenis invoice wajib dipilih.',
            'type.in'                  => 'Jenis invoice tidak valid.',

            'invoice_date.required'    => 'Tanggal invoice wajib diisi.',
            'invoice_date.date'        => 'Format tanggal invoice tidak valid.',

            'due_date.required'        => 'Tanggal jatuh tempo wajib diisi.',
            'due_date.date'            => 'Format tanggal tidak valid.',
            'due_date.after_or_equal'  => 'Jatuh tempo harus setelah atau sama dengan tanggal invoice.',

            'subtotal.required'          => 'Nominal wajib diisi.',
            'subtotal.numeric'           => 'Nominal harus berupa angka.',
            'subtotal.min'               => 'Nominal tidak boleh kurang dari 0.',

            'items.required'           => 'Item wajib diisi untuk invoice tambahan.',
            'items.min'                => 'Minimal 1 item diperlukan.',
            'items.*.expense_id.exists'        => 'Expense tidak ditemukan.',
            'items.*.description.required' => 'Deskripsi item wajib diisi.',
            'items.*.quantity.required'    => 'Qty item wajib diisi.',
            'items.*.quantity.min'         => 'Qty minimal 0.01.',
            'items.*.unit_price.required'  => 'Harga satuan item wajib diisi.',
            'items.*.unit_price.min'       => 'Harga satuan tidak boleh negatif.',
        ];
    }
}
