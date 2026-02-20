<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Photo extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'gallery_id',
        'uploaded_by',
        'filename',
        'original_path',
        'preview_path',
        'thumb_path',
        'watermarked_path',
        'mime_type',
        'file_size',
        'width',
        'height',
        'exif_data',
        'sort_order',
        'rating',
        'color_label',
        'tags',
        'is_featured',
        'is_hidden',
        'favorites_count',
        'comments_count',
    ];

    protected function casts(): array
    {
        return [
            'exif_data' => 'array',
            'tags' => 'array',
            'is_featured' => 'boolean',
            'is_hidden' => 'boolean',
        ];
    }

    // Relationships
    public function gallery(): BelongsTo
    {
        return $this->belongsTo(Gallery::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(PhotoComment::class);
    }

    public function rootComments(): HasMany
    {
        return $this->hasMany(PhotoComment::class)->whereNull('parent_id')->orderBy('created_at');
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(PhotoFavorite::class);
    }

    // URL Helpers
    public function getSignedPreviewUrl(int $minutes = 60): string
    {
        if (config('filesystems.default') === 'local') {
            return Storage::url($this->preview_path ?? $this->original_path);
        }

        return Storage::temporaryUrl(
            $this->preview_path ?? $this->original_path,
            now()->addMinutes($minutes)
        );
    }

    public function getSignedThumbUrl(int $minutes = 60): string
    {
        if (config('filesystems.default') === 'local') {
            return Storage::url($this->thumb_path ?? $this->original_path);
        }

        return Storage::temporaryUrl(
            $this->thumb_path ?? $this->original_path,
            now()->addMinutes($minutes)
        );
    }

    public function isFavoritedBy(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return $this->favorites()->where('user_id', $user->id)->exists();
    }

    // Scopes
    public function scopeVisible($query)
    {
        return $query->where('is_hidden', false);
    }

    public function scopeFavorited($query, User $user)
    {
        return $query->whereHas('favorites', fn ($q) => $q->where('user_id', $user->id));
    }

    public function scopeWithUnresolvedComments($query)
    {
        return $query->whereHas('comments', fn ($q) => $q->whereNull('resolved_at')->whereNull('parent_id'));
    }

    public function scopeWithColorLabel($query, string $label)
    {
        return $query->where('color_label', $label);
    }
}
