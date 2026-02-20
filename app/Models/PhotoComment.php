<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class PhotoComment extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'photo_id',
        'user_id',
        'parent_id',
        'body',
        'is_internal',
        'resolved_at',
        'resolved_by',
        'pin_position',
    ];

    protected function casts(): array
    {
        return [
            'is_internal' => 'boolean',
            'resolved_at' => 'datetime',
            'pin_position' => 'array',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['body', 'is_internal', 'resolved_at'])
            ->logOnlyDirty();
    }

    // Relationships
    public function photo(): BelongsTo
    {
        return $this->belongsTo(Photo::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(PhotoComment::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(PhotoComment::class, 'parent_id')->orderBy('created_at');
    }

    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    // Helpers
    public function isResolved(): bool
    {
        return $this->resolved_at !== null;
    }

    public function isReply(): bool
    {
        return $this->parent_id !== null;
    }

    public function resolve(User $user): void
    {
        $this->update([
            'resolved_at' => now(),
            'resolved_by' => $user->id,
        ]);
    }

    public function unresolve(): void
    {
        $this->update([
            'resolved_at' => null,
            'resolved_by' => null,
        ]);
    }

    // Scopes
    public function scopePublic($query)
    {
        return $query->where('is_internal', false);
    }

    public function scopeInternal($query)
    {
        return $query->where('is_internal', true);
    }

    public function scopeUnresolved($query)
    {
        return $query->whereNull('resolved_at');
    }

    public function scopeResolved($query)
    {
        return $query->whereNotNull('resolved_at');
    }

    public function scopeRootLevel($query)
    {
        return $query->whereNull('parent_id');
    }
}
