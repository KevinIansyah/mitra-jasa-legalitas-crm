<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Customer;

class Company extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'email',
        'website',
        'address',
        'city',
        'province',
        'postal_code',
        'npwp',
        'status_legal',
        'category_business',
        'notes',
    ];

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    public function customers()
    {
        return $this->belongsToMany(Customer::class, 'company_customer')
            ->withPivot('is_primary', 'position_at_company')
            ->withTimestamps();
    }

    // -----------------------------------------------------------
    // SCOPES
    // -----------------------------------------------------------

    public function primaryCustomer()
    {
        return $this->belongsToMany(Customer::class, 'company_customer')
            ->wherePivot('is_primary', true)
            ->withPivot('is_primary', 'position_at_company')
            ->withTimestamps();
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($query) use ($search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('city', 'like', "%{$search}%")
                ->orWhere('province', 'like', "%{$search}%");
        });
    }
}
