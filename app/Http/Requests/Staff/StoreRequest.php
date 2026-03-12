<?php

namespace App\Http\Requests\Staff;

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
            'name'                    => 'required|string|max:255',
            'email'                   => 'required|email|unique:users,email',
            'phone'                   => 'required|string|max:255',
            'role'                    => 'nullable|exists:roles,name',
            'password'                => 'required|min:8|confirmed',
            'max_concurrent_projects' => 'nullable|integer|min:1|max:20',
            'availability_status'     => 'nullable|in:available,busy,on_leave',
            'skills'                  => 'nullable|string',
            'leave_start_date'        => 'nullable|date',
            'leave_end_date'          => 'nullable|date|after_or_equal:leave_start_date',
            'notes'                   => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama staff wajib diisi.',
            'name.max' => 'Nama staff maksimal :max karakter.',

            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan oleh user lain.',

            'phone.required' => 'Nomor telepon wajib diisi.',
            'phone.max' => 'Nomor telepon maksimal :max karakter.',

            'role.exists' => 'Role yang dipilih tidak valid.',

            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal :min karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',

            'max_concurrent_projects.integer' => 'Maksimal project harus berupa angka.',
            'max_concurrent_projects.min' => 'Minimal project adalah :min.',
            'max_concurrent_projects.max' => 'Maksimal project adalah :max.',

            'availability_status.in' => 'Status ketersediaan tidak valid.',

            'leave_start_date.date' => 'Tanggal mulai cuti tidak valid.',
            'leave_end_date.date' => 'Tanggal selesai cuti tidak valid.',
            'leave_end_date.after_or_equal' => 'Tanggal selesai cuti harus setelah atau sama dengan tanggal mulai.',

            'notes.string' => 'Catatan harus berupa teks.',
        ];
    }
}
