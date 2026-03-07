<?php

namespace App\Http\Requests\Projects\Invoices;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isAdditional = $this->input('type') === 'additional';

        return [
            'project_id'           => 'sometimes|required|exists:projects,id',

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
            'project_id.required'      => 'Project wajib dipilih.',
            'project_id.exists'        => 'Project tidak ditemukan.',

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
            'items.*.description.required' => 'Deskripsi item wajib diisi.',
            'items.*.quantity.required'    => 'Qty item wajib diisi.',
            'items.*.quantity.min'         => 'Qty minimal 0.01.',
            'items.*.unit_price.required'  => 'Harga satuan item wajib diisi.',
            'items.*.unit_price.min'       => 'Harga satuan tidak boleh negatif.',
        ];
    }
}
