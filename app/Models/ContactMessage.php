<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    protected $fillable = [
        'name',
        'whatsapp_number',
        'email',
        'topic',
        'message',
        'status',
    ];

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeUnread($query)
    {
        return $query->where('status', 'unread');
    }
}
