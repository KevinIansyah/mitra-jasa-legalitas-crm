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

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */


    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function companies()
    {
        return $this->belongsToMany(Company::class, 'company_customer')
            ->withPivot('is_primary', 'position_at_company')
            ->withTimestamps();
    }

    public function invoices()
    {
        return $this->hasMany(ProjectInvoice::class);
    }

    public function proposals()
    {
        return $this->hasMany(Proposal::class);
    }

    public function hasAccount(): bool
    {
        return !is_null($this->user_id);
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($query) use ($search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%");
        });
    }

    public function scopeHaveAccount($query)
    {
        return $query->whereNotNull('user_id');
    }

    public function scopeNoAccount($query)
    {
        return $query->whereNull('user_id');
    }
}
