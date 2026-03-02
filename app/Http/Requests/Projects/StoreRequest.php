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
        return [
            'customer_id' => 'required|exists:customers,id',
            'company_id' => 'nullable|exists:companies,id',
            'service_id' => 'nullable|exists:services,id',
            'service_package_id' => 'nullable|exists:service_packages,id',
            'project_template_id' => 'nullable|exists:project_templates,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'budget' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'planned_end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'nullable|in:planning,in_progress,on_hold,completed,cancelled',
        ];
    }

    public function messages(): array
    {
        return [
            'customer_id.required' => 'Customer wajib dipilih.',
            'customer_id.exists' => 'Customer yang dipilih tidak valid.',

            'company_id.exists' => 'Perusahaan yang dipilih tidak valid.',

            'service_id.exists' => 'Layanan yang dipilih tidak valid.',

            'service_package_id.exists' => 'Paket layanan yang dipilih tidak valid.',

            'project_template_id.exists' => 'Template project yang dipilih tidak valid.',

            'name.required' => 'Nama project wajib diisi.',
            'name.string' => 'Nama project harus berupa teks.',
            'name.max' => 'Nama project maksimal 255 karakter.',

            'description.string' => 'Deskripsi harus berupa teks.',

            'budget.required' => 'Anggaran wajib diisi.',
            'budget.numeric' => 'Anggaran harus berupa angka.',
            'budget.min' => 'Anggaran tidak boleh kurang dari 0.',

            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'start_date.date' => 'Tanggal mulai tidak valid.',

            'planned_end_date.required' => 'Tanggal selesai rencana wajib diisi.',
            'planned_end_date.date' => 'Tanggal selesai rencana tidak valid.',
            'planned_end_date.after_or_equal' => 'Tanggal selesai rencana tidak boleh sebelum tanggal mulai.',

            'status.in' => 'Status project tidak valid.',
        ];
    }
}
