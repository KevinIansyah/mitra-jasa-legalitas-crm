<?php

namespace App\Http\Requests\Finances\Proposals;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id'      => 'required|integer|exists:customers,id',
            'project_name'     => 'required|string|max:255',
            'proposal_date'    => 'required|date',
            'valid_until'      => 'nullable|date|after_or_equal:proposal_date',
            'tax_percent'      => 'nullable|numeric|min:0|max:100',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'notes'            => 'nullable|string',

            'items'                    => 'required|array|min:1',
            'items.*.description'      => 'required|string',
            'items.*.quantity'         => 'required|numeric|min:0.01',
            'items.*.unit_price'       => 'required|numeric|min:0',
            'items.*.tax_percent'      => 'nullable|numeric|min:0|max:100',
            'items.*.discount_percent' => 'nullable|numeric|min:0|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'customer_id.required'           => 'Customer wajib dipilih.',
            'customer_id.exists'             => 'Customer yang dipilih tidak valid.',
            'project_name.required'          => 'Nama project wajib diisi.',
            'project_name.string'            => 'Nama project harus berupa string.',
            'project_name.max'               => 'Nama project maksimal 255 karakter.',
            'proposal_date.required'         => 'Tanggal proposal wajib diisi.',
            'proposal_date.date'             => 'Tanggal proposal tidak valid.',
            'valid_until.date'               => 'Tanggal berlaku tidak valid.',
            'valid_until.after_or_equal'     => 'Tanggal berlaku harus setelah atau sama dengan tanggal proposal.',
            'tax_percent.numeric'            => 'Pajak harus berupa angka.',
            'tax_percent.max'                => 'Pajak maksimal 100%.',
            'discount_percent.numeric'       => 'Diskon harus berupa angka.',
            'discount_percent.max'           => 'Diskon maksimal 100%.',
            'items.required'                 => 'Item proposal wajib diisi.',
            'items.min'                      => 'Minimal 1 item proposal.',
            'items.*.description.required'   => 'Deskripsi item wajib diisi.',
            'items.*.quantity.required'      => 'Quantity item wajib diisi.',
            'items.*.quantity.min'           => 'Quantity item minimal 0.01.',
            'items.*.unit_price.required'    => 'Harga satuan item wajib diisi.',
            'items.*.unit_price.min'         => 'Harga satuan tidak boleh negatif.',
            'items.*.tax_percent.max'        => 'Pajak item maksimal 100%.',
            'items.*.discount_percent.max'   => 'Diskon item maksimal 100%.',
        ];
    }
}
