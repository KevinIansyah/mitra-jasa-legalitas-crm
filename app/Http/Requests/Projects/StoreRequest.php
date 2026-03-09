<?php

namespace App\Http\Requests\Projects;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isConvert = !empty($this->quote_id);
        $noCustomerId = empty($this->customer_id);
        $isCreateCompany = $this->company_mode === 'create';

        return [
            'quote_id'    => 'nullable|exists:quotes,id',
            'customer_id' => $isConvert ? 'nullable|exists:customers,id' : 'required|exists:customers,id',

            'customer_name'  => ($isConvert && $noCustomerId) ? 'required|string|max:255' : 'nullable|string|max:255',
            'customer_email' => ($isConvert && $noCustomerId) ? 'required|email|max:255'  : 'nullable|email|max:255',
            'customer_phone' => ($isConvert && $noCustomerId) ? 'required|string|max:50'  : 'nullable|string|max:50',
            'customer_tier'  => 'nullable|in:bronze,silver,gold,platinum',
            'customer_notes' => 'nullable|string',          

            'company_mode' => 'nullable|in:none,search,create',
            'company_id'   => 'required_if:company_mode,search|nullable|exists:companies,id',

            'company_name'              => $isCreateCompany ? 'required|string|max:255' : 'nullable|string|max:255',
            'company_phone'             => 'nullable|string|max:50',
            'company_email'             => 'nullable|email|max:255',
            'company_website'           => 'nullable|url|max:255',
            'company_address'           => $isCreateCompany ? 'required|string' : 'nullable|string',
            'company_city'              => 'nullable|string|max:100',
            'company_province'          => 'nullable|string|max:100',
            'company_postal_code'       => 'nullable|string|max:10',
            'company_npwp'              => 'nullable|string|max:30',
            'company_status_legal'      => $isCreateCompany ? 'required|string' : 'nullable|string',
            'company_category_business' => $isCreateCompany ? 'required|string' : 'nullable|string',
            'company_notes'             => 'nullable|string',

            'service_id'          => 'nullable|exists:services,id',
            'service_package_id'  => 'nullable|exists:service_packages,id',
            'project_template_id' => 'nullable|exists:project_templates,id',

            'name'             => 'required|string|max:255',
            'description'      => 'nullable|string',
            'budget'           => 'required|numeric|min:0',
            'start_date'       => 'required|date',
            'planned_end_date' => 'required|date|after_or_equal:start_date',
            'status'           => 'nullable|in:planning,in_progress,on_hold,completed,cancelled',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            if (!empty($this->quote_id) && empty($this->customer_id) && empty($this->customer_name)) {
                $v->errors()->add('customer_id', 'Customer wajib dipilih atau isi data customer baru.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'customer_id.required'  => 'Customer wajib dipilih.',
            'customer_id.exists'    => 'Customer yang dipilih tidak valid.',
            'customer_name.required'  => 'Nama customer wajib diisi.',
            'customer_email.required' => 'Email customer wajib diisi.',
            'customer_phone.required' => 'No telepon customer wajib diisi.',

            'company_id.required_if'             => 'Pilih perusahaan terlebih dahulu.',
            'company_id.exists'                  => 'Perusahaan yang dipilih tidak valid.',
            'company_name.required'              => 'Nama perusahaan wajib diisi.',
            'company_website.url'                => 'Format website tidak valid.',
            'company_address.required'           => 'Alamat perusahaan wajib diisi.',
            'company_status_legal.required'      => 'Status legal perusahaan wajib diisi.',
            'company_category_business.required' => 'Kategori bisnis perusahaan wajib diisi.',

            'service_id.exists'          => 'Layanan yang dipilih tidak valid.',
            'service_package_id.exists'  => 'Paket layanan yang dipilih tidak valid.',
            'project_template_id.exists' => 'Template project yang dipilih tidak valid.',

            'name.required' => 'Nama project wajib diisi.',
            'name.max'      => 'Nama project maksimal 255 karakter.',

            'budget.required' => 'Anggaran wajib diisi.',
            'budget.numeric'  => 'Anggaran harus berupa angka.',
            'budget.min'      => 'Anggaran tidak boleh kurang dari 0.',

            'start_date.required'             => 'Tanggal mulai wajib diisi.',
            'start_date.date'                 => 'Tanggal mulai tidak valid.',
            'planned_end_date.required'       => 'Tanggal selesai rencana wajib diisi.',
            'planned_end_date.date'           => 'Tanggal selesai rencana tidak valid.',
            'planned_end_date.after_or_equal' => 'Tanggal selesai rencana tidak boleh sebelum tanggal mulai.',

            'status.in' => 'Status project tidak valid.',
        ];
    }
}
