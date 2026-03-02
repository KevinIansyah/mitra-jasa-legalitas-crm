<?php

namespace App\Http\Requests\Projects\Comments;

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
            'comment'   => 'required|string|max:5000',
            'parent_id' => 'nullable|exists:project_comments,id',
        ];
    }

    public function messages(): array
    {
        return [
            'comment.required' => 'Komentar tidak boleh kosong.',
            'comment.string'   => 'Komentar harus berupa teks.',
            'comment.max'      => 'Komentar maksimal 5000 karakter.',
            'parent_id.exists' => 'Komentar yang ingin dibalas tidak ditemukan.',
        ];
    }
}
