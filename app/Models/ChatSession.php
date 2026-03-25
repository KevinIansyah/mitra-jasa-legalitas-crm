<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class ChatSession extends Model
{
    protected $fillable = [
        'session_token',
        'page_url',
        'name',
        'email',
        'phone',
        'status',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (ChatSession $session) {
            if (empty($session->session_token)) {
                $session->session_token = Str::uuid()->toString();
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class);
    }

    /*
    |--------------------------------------------------------------------------
    | COMPUTED
    |--------------------------------------------------------------------------
    */

    public function isConverted(): bool
    {
        return $this->status === 'converted';
    }

    public function markAsConverted(): void
    {
        $this->update(['status' => 'converted']);
    }

    public function getRecentMessages(int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return $this->messages()
            ->latest()
            ->limit($limit)
            ->get()
            ->reverse()
            ->values();
    }
}
