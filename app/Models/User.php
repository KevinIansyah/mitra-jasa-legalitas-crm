<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable
{
    use HasRoles, HasApiTokens, HasFactory, Notifiable, TwoFactorAuthenticatable;

    protected $fillable = [
        'name',
        'email',
        'role',
        'password',
        'status',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    // ============================================================
    // RELATIONS
    // ============================================================

    public function customer(): HasOne
    {
        return $this->hasOne(Customer::class);
    }

    public function staffProfile(): HasOne
    {
        return $this->hasOne(StaffProfile::class);
    }

    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_members', 'user_id', 'project_id')
            ->withPivot('role', 'can_approve_documents', 'assigned_at')
            ->withTimestamps();
    }

    // ============================================================
    // SCOPES
    // ============================================================

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeStaff($query)
    {
        return $query->role(['staff', 'super_admin']);
    }

    // ============================================================
    // COMPUTED
    // ============================================================

    public function getAvatarUrlAttribute(): ?string
    {
        if (!$this->avatar) return null;
        return Storage::disk('r2')->temporaryUrl($this->avatar, now()->addMinutes(30));
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    public function isStaff(): bool
    {
        return $this->hasAnyRole(['staff', 'super_admin']);
    }
}
