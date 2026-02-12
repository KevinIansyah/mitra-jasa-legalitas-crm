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
        // 'type',
        'notes',
    ];

    /**
     * Get all Customers for this company
     */
    public function customers()
    {
        return $this->belongsToMany(Customer::class, 'company_customer')
            ->withPivot('is_primary', 'position_at_company')
            ->withTimestamps();
    }

    /**
     * Get primary Customer for this company
     */
    public function primaryCustomer()
    {
        return $this->belongsToMany(Customer::class, 'company_customer')
            ->wherePivot('is_primary', true)
            ->withPivot('is_primary', 'position_at_company')
            ->withTimestamps();
    }
}
