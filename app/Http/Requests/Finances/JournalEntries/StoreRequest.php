<?php

namespace App\Http\Requests\Finances\JournalEntries;

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
            'date'              => 'required|date',
            'description'       => 'required|string|max:255',
            'lines'             => 'required|array|min:2',
            'lines.*.account_id' => 'required|integer|exists:accounts,id',
            'lines.*.debit'     => 'required|numeric|min:0',
            'lines.*.credit'    => 'required|numeric|min:0',
            'lines.*.notes'     => 'nullable|string|max:255',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $lines = $this->input('lines', []);

            $totalDebit  = collect($lines)->sum('debit');
            $totalCredit = collect($lines)->sum('credit');

            if (round($totalDebit, 2) !== round($totalCredit, 2)) {
                $validator->errors()->add(
                    'lines',
                    "Jurnal tidak balance. Total debit: {$totalDebit}, total credit: {$totalCredit}."
                );
            }

            foreach ($lines as $i => $line) {
                if (($line['debit'] ?? 0) > 0 && ($line['credit'] ?? 0) > 0) {
                    $validator->errors()->add(
                        "lines.{$i}",
                        'Satu baris tidak boleh memiliki debit dan credit sekaligus.'
                    );
                }

                if (($line['debit'] ?? 0) == 0 && ($line['credit'] ?? 0) == 0) {
                    $validator->errors()->add(
                        "lines.{$i}",
                        'Debit atau credit wajib diisi.'
                    );
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'date.required'                => 'Tanggal jurnal wajib diisi.',
            'date.date'                    => 'Format tanggal tidak valid.',
            'description.required'         => 'Keterangan jurnal wajib diisi.',
            'description.max'              => 'Keterangan maksimal 255 karakter.',
            'lines.required'               => 'Minimal dua baris jurnal diperlukan.',
            'lines.min'                    => 'Minimal dua baris jurnal diperlukan.',
            'lines.*.account_id.required'  => 'Akun wajib dipilih.',
            'lines.*.account_id.exists'    => 'Akun tidak ditemukan.',
            'lines.*.debit.required'       => 'Kolom debit wajib diisi.',
            'lines.*.debit.min'            => 'Debit tidak boleh negatif.',
            'lines.*.credit.required'      => 'Kolom credit wajib diisi.',
            'lines.*.credit.min'           => 'Credit tidak boleh negatif.',
        ];
    }
}
