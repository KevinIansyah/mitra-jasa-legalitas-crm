<?php

namespace App\Http\Requests\Projects\Members;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $projectId = $this->route('project')?->id;

        return [
            'user_id' => [
                'required',
                'exists:users,id',
                Rule::unique('project_members', 'user_id')
                    ->where('project_id', $projectId),
            ],
            'role' => 'required|in:project_leader,team_member,observer',
            // 'can_approve_documents' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'User wajib dipilih.',
            'user_id.exists' => 'User yang dipilih tidak valid.',
            'user_id.unique' => 'User sudah menjadi member di project ini.',

            'role.required' => 'Role wajib dipilih.',
            'role.in' => 'Role yang dipilih tidak valid.',

            // 'can_approve_documents.boolean' => 'Izin persetujuan dokumen harus berupa true atau false.',
        ];
    }

    // protected function prepareForValidation(): void
    // {
    //     $this->merge([
    //         'can_approve_documents' => $this->boolean('can_approve_documents'),
    //     ]);
    // }
}
