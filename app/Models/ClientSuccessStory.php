<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClientSuccessStory extends Model
{
    protected $fillable = [
        'client_name',
        'industry',
        'client_logo',
        'metric_value',
        'metric_label',
        'challenge',
        'solution',
        'stat_1_value',
        'stat_1_label',
        'stat_2_value',
        'stat_2_label',
        'stat_3_value',
        'stat_3_label',
        'is_published',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
