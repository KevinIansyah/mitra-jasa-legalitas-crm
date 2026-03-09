<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class ProjectMember extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'project_id',
        'user_id',
        'role',
        // 'can_approve_documents',
        'assigned_at',
    ];

    protected $casts = [
        // 'can_approve_documents' => 'boolean',
        'assigned_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['role'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('member');
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */


    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeProjectLeaders($query)
    {
        return $query->where('role', 'project_leader');
    }

    public function scopeTeamMembers($query)
    {
        return $query->where('role', 'team_member');
    }

    /*
    |--------------------------------------------------------------------------
    | COMPUTED 
    |--------------------------------------------------------------------------
    */

    public function isProjectLeader(): bool
    {
        return $this->role === 'project_leader';
    }

    public function canApproveDocuments(): bool
    {
        return $this->can_approve_documents;
    }
}
