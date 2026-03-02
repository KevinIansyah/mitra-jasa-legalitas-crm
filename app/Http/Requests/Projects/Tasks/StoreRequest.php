<?php

namespace App\Http\Requests\Projects\Tasks;

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
            'title'                => 'required|string|max:255',
            'description'          => 'nullable|string',
            'priority'             => 'required|in:low,medium,high,urgent',
            'status'               => 'required|in:todo,in_progress,review,completed,cancelled',
            'due_date'             => 'nullable|date',
            'assigned_to'          => 'nullable|exists:users,id',
            'project_milestone_id' => 'nullable|exists:project_milestones,id',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Judul tugas wajib diisi.',
            'title.string'   => 'Judul tugas harus berupa string.',
            'title.max'      => 'Judul tugas maksimal 255 karakter.',

            'description.string' => 'Deskripsi tugas harus berupa string.',

            'priority.required' => 'Prioritas wajib dipilih.',
            'priority.in'       => 'Prioritas yang dipilih tidak valid.',

            'status.required' => 'Status wajib dipilih.',
            'status.in'       => 'Status yang dipilih tidak valid.',

            'due_date.date' => 'Format tanggal tenggat tidak valid.',

            'assigned_to.exists'          => 'Pengguna yang dipilih tidak valid.',
            'project_milestone_id.exists' => 'Milestone yang dipilih tidak valid.',
        ];
    }
}
