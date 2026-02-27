<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * A client review or testimonial shown on the public website.
 *
 * After a great experience, clients can leave a review with a star
 * rating and a photo. The photographer can feature the best ones
 * on the homepage and control which testimonials are visible.
 */
class Testimonial extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'studio_id',
        'client_name',    // Display name of the reviewer
        'client_role',    // e.g. "Bride", "Mother of the Groom", "CEO at Acme Inc."
        'content',        // The review text
        'rating',         // Star rating (1-5)
        'photo_path',     // Legacy path for the reviewer's photo
        'is_featured',    // Highlighted testimonials shown prominently on the homepage
        'is_active',      // Only active testimonials appear on the website
        'sort_order',     // Controls display order
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /* ── Reviewer Photo ── */

    /** The reviewer's headshot or photo -- one image per testimonial. */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('photo')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);
    }

    /** Auto-create a small 200px thumbnail of the reviewer's photo for the website. */
    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(200)
            ->height(200)
            ->sharpen(10)
            ->format('webp')
            ->quality(80);
    }

    /* ── Accessor ── */

    /** URL for the reviewer's photo thumbnail (tries optimized version first, then legacy path). */
    public function getPhotoUrlAttribute(): ?string
    {
        $media = $this->getFirstMedia('photo');
        if ($media) {
            return $media->getUrl('thumb');
        }

        return $this->photo_path ? '/storage/' . $this->photo_path : null;
    }

    /* ── Relationships ── */

    /** The studio this testimonial belongs to. */
    public function studio(): BelongsTo
    {
        return $this->belongsTo(Studio::class);
    }

    // ── Scopes (quick filters) ────────────────────────────────

    /** Only testimonials that are visible on the public website. */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /** Only testimonials highlighted as featured (shown prominently on the homepage). */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}
