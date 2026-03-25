<?php

namespace App\Http\Requests\Content\Testimonials;

class UpdateRequest extends StoreRequest
{
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'remove_client_avatar' => 'nullable|boolean',
        ]);
    }
}
