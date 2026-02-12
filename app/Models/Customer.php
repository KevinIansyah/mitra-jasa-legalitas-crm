<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Company;
use App\Models\User;

class Customer extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'phone',
        'email',
        'status',
        'tier',
        'notes',
    ];

    /**
     * Get the user account for this Customer
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all companies for this Customer
     */
    public function companies()
    {
        return $this->belongsToMany(Company::class, 'company_customer')
            ->withPivot('is_primary', 'position_at_company')
            ->withTimestamps();
    }

    /**
     * Check if Customer has user account
     */
    public function hasAccount(): bool
    {
        return !is_null($this->user_id);
    }
}
