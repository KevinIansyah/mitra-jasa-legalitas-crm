<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlogSubscriber extends Model
{
    protected $fillable = [
        'email',
        'name',
        'token',
        'is_verified',
        'verified_at',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
    ];

    protected $hidden = [
        'token',
    ];

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeUnverified($query)
    {
        return $query->where('is_verified', false);
    }

    /*
    |--------------------------------------------------------------------------
    | COMPUTED
    |--------------------------------------------------------------------------
    */

    public function verify(): void
    {
        $this->update([
            'is_verified' => true,
            'verified_at' => now(),
            'token'       => null,
        ]);
    }

    public function isVerified(): bool
    {
        return $this->is_verified;
    }
}
