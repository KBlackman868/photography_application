<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Gallery extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'project_id',
        'studio_id',
        'name',
        'slug',
        'description',
        'cover_photo_path',
        'status',
        'is_public',
        'password',
        'share_token',
        'allow_downloads',
        'allow_favorites',
        'allow_comments',
        'selection_limit',
        'expires_at',
        'published_at',
        'watermark_settings',
        'photo_count',
    ];

    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
            'allow_downloads' => 'boolean',
            'allow_favorites' => 'boolean',
            'allow_comments' => 'boolean',
            'expires_at' => 'datetime',
            'published_at' => 'datetime',
            'watermark_settings' => 'array',
        ];
    }

    protected $hidden = ['password'];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'status', 'is_public'])
            ->logOnlyDirty();
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function studio(): BelongsTo
    {
        return $this->belongsTo(Studio::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(Photo::class)->orderBy('sort_order');
    }

    public function selections(): HasMany
    {
        return $this->hasMany(GallerySelection::class);
    }

    public function exportJobs(): HasMany
    {
        return $this->hasMany(ExportJob::class);
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeForClient($query, User $user)
    {
        return $query->whereHas('project', fn ($q) => $q->where('client_user_id', $user->id));
    }

    // Helpers
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function progressStats(): array
    {
        $totalComments = $this->photos()->withCount([
            'comments as total_comments' => fn ($q) => $q->whereNull('parent_id'),
            'comments as resolved_comments' => fn ($q) => $q->whereNull('parent_id')->whereNotNull('resolved_at'),
        ])->get();

        $total = $totalComments->sum('total_comments');
        $resolved = $totalComments->sum('resolved_comments');

        return [
            'total' => $total,
            'resolved' => $resolved,
            'percent' => $total > 0 ? round(($resolved / $total) * 100) : 0,
        ];
    }
}
