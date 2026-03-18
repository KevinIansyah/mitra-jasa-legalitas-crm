<?php

namespace App\Http\Requests\Finances\Estimates;

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
            'estimate_date'        => 'required|date',
            'valid_until'          => 'required|date',
            'tax_percent'          => 'nullable|numeric|min:0|max:100',
            'discount_percent'     => 'nullable|numeric|min:0|max:100',
            'notes'                => 'nullable|string',
            'status'               => 'nullable|in:draft,sent,accepted,rejected',

            'items'                       => 'required|array|min:1',
            'items.*.description'         => 'required|string',
            'items.*.quantity'            => 'required|numeric|min:0.01',
            'items.*.unit_price'          => 'required|numeric|min:0',
            'items.*.tax_percent'         => 'nullable|numeric|min:0|max:100',
            'items.*.discount_percent'    => 'nullable|numeric|min:0|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'estimate_date.required'         => 'Tanggal estimate wajib diisi.',
            'estimate_date.date'             => 'Tanggal estimate tidak valid.',
            'valid_until.required'           => 'Tanggal berlaku wajib diisi.',
            'valid_until.date'               => 'Tanggal berlaku tidak valid.',
            'tax_percent.numeric'            => 'Pajak harus berupa angka.',
            'tax_percent.max'                => 'Pajak maksimal 100%.',
            'discount_percent.numeric'       => 'Diskon harus berupa angka.',
            'discount_percent.max'           => 'Diskon maksimal 100%.',
            'status.in'                      => 'Status tidak valid.',
            'items.required'                 => 'Item estimate wajib diisi.',
            'items.min'                      => 'Minimal 1 item estimate.',
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
