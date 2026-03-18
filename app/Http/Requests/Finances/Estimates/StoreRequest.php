<?php

namespace App\Http\Requests\Finances\Estimates;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $fromQuote    = $this->boolean('from_quote');
        $fromProposal = $this->boolean('from_proposal');

        return [
            'quote_id' => $fromQuote
                ? 'required|integer|exists:quotes,id'
                : 'nullable|integer|exists:quotes,id',

            'proposal_id' => $fromProposal
                ? 'required|integer|exists:proposals,id'
                : 'nullable|integer|exists:proposals,id',

            'customer_id' => (!$fromQuote && !$fromProposal)
                ? 'required|integer|exists:customers,id'
                : 'nullable|integer|exists:customers,id',

            'estimate_date'    => 'required|date',
            'valid_until'      => 'nullable|date|after_or_equal:estimate_date',
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
            'quote_id.required'            => 'Quote wajib dipilih.',
            'quote_id.exists'              => 'Quote yang dipilih tidak valid.',
            'proposal_id.required'         => 'Proposal wajib dipilih.',
            'proposal_id.exists'           => 'Proposal yang dipilih tidak valid.',
            'customer_id.required'         => 'Customer wajib dipilih.',
            'customer_id.exists'           => 'Customer yang dipilih tidak valid.',
            'estimate_date.required'       => 'Tanggal estimate wajib diisi.',
            'estimate_date.date'           => 'Tanggal estimate tidak valid.',
            'valid_until.date'             => 'Tanggal berlaku tidak valid.',
            'valid_until.after_or_equal'   => 'Tanggal berlaku harus setelah atau sama dengan tanggal estimate.',
            'tax_percent.numeric'          => 'Pajak harus berupa angka.',
            'tax_percent.max'              => 'Pajak maksimal 100%.',
            'discount_percent.numeric'     => 'Diskon harus berupa angka.',
            'discount_percent.max'         => 'Diskon maksimal 100%.',
            'items.required'               => 'Item estimate wajib diisi.',
            'items.min'                    => 'Minimal 1 item estimate.',
            'items.*.description.required' => 'Deskripsi item wajib diisi.',
            'items.*.quantity.required'    => 'Quantity item wajib diisi.',
            'items.*.quantity.min'         => 'Quantity item minimal 0.01.',
            'items.*.unit_price.required'  => 'Harga satuan item wajib diisi.',
            'items.*.unit_price.min'       => 'Harga satuan tidak boleh negatif.',
            'items.*.tax_percent.max'      => 'Pajak item maksimal 100%.',
            'items.*.discount_percent.max' => 'Diskon item maksimal 100%.',
        ];
    }
}
