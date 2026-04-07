<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClientCompany extends Model
{
    protected $fillable = [
        'name',
        'logo',
        'is_published',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
