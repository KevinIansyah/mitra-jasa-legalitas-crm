<?php

namespace App\Http\Requests\Content\ClientSuccessStories;

class UpdateRequest extends StoreRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->has('remove_client_logo')) {
            $this->merge([
                'remove_client_logo' => filter_var($this->remove_client_logo, FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }

    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'remove_client_logo' => 'nullable|boolean',
        ]);
    }
}
