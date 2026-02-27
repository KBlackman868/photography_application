<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

/**
 * A single photograph inside a gallery.
 *
 * Each photo has multiple versions stored on disk:
 *  - original_path:    The full-resolution file as uploaded from the camera.
 *  - preview_path:     A web-optimized version for comfortable on-screen viewing.
 *  - thumb_path:       A small thumbnail for grid layouts and quick browsing.
 *  - watermarked_path: A version with the studio's watermark applied.
 *
 * Photos also store camera EXIF data (aperture, shutter speed, ISO, etc.)
 * and can be rated, color-labeled, tagged, and favorited by clients.
 */
class Photo extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'gallery_id',
        'uploaded_by',
        'filename',           // Original file name from the camera / computer
        'original_path',      // Full-resolution file as shot
        'preview_path',       // Web-sized version for comfortable on-screen viewing
        'thumb_path',         // Small thumbnail for gallery grid layouts
        'watermarked_path',   // Version with the studio watermark overlaid
        'mime_type',
        'file_size',
        'width',
        'height',
        'exif_data',          // Camera settings: aperture, shutter speed, ISO, lens, etc.
        'sort_order',         // Photographer-chosen display order within the gallery
        'rating',             // Internal star rating (1-5) set by the photographer
        'color_label',        // Color-coded label for internal organization (like Lightroom)
        'tags',               // Searchable keywords for this photo
        'is_featured',        // Highlighted as a standout image from this gallery
        'is_hidden',          // Hidden from client view (e.g. not yet ready)
        'favorites_count',    // Cached count of how many clients hearted this photo
        'comments_count',     // Cached count of feedback comments
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

    // ── Relationships ─────────────────────────────────────────

    /** The gallery this photo belongs to. */
    public function gallery(): BelongsTo
    {
        return $this->belongsTo(Gallery::class);
    }

    /** The team member who uploaded this photo. */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /** All feedback comments (from clients and team) on this photo. */
    public function comments(): HasMany
    {
        return $this->hasMany(PhotoComment::class);
    }

    /** Top-level comments only (not replies), in chronological order. */
    public function rootComments(): HasMany
    {
        return $this->hasMany(PhotoComment::class)->whereNull('parent_id')->orderBy('created_at');
    }

    /** All the "hearts" / favorites this photo has received from clients. */
    public function favorites(): HasMany
    {
        return $this->hasMany(PhotoFavorite::class);
    }

    // ── URL Helpers ───────────────────────────────────────────

    /**
     * Get a secure, time-limited link to the preview-size version of this photo.
     * Falls back to the original if no preview exists.
     */
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

    /**
     * Get a secure, time-limited link to the thumbnail version of this photo.
     * Falls back to the original if no thumbnail exists.
     */
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

    /** Check whether a specific client has hearted this photo. */
    public function isFavoritedBy(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return $this->favorites()->where('user_id', $user->id)->exists();
    }

    // ── Scopes (quick filters) ────────────────────────────────

    /** Only photos the client is allowed to see (not hidden by the photographer). */
    public function scopeVisible($query)
    {
        return $query->where('is_hidden', false);
    }

    /** Only photos that a specific client has hearted. */
    public function scopeFavorited($query, User $user)
    {
        return $query->whereHas('favorites', fn ($q) => $q->where('user_id', $user->id));
    }

    /** Only photos that still have unresolved client feedback. */
    public function scopeWithUnresolvedComments($query)
    {
        return $query->whereHas('comments', fn ($q) => $q->whereNull('resolved_at')->whereNull('parent_id'));
    }

    /** Only photos with a specific color label (for internal organization). */
    public function scopeWithColorLabel($query, string $label)
    {
        return $query->where('color_label', $label);
    }
}
