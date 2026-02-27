<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * A single photo inside a public portfolio showcase.
 *
 * When uploaded, each photo is automatically converted into web-optimized
 * versions (WebP format) for fast loading:
 *  - "display" = large 1800px version for the main portfolio page view
 *  - "thumb"   = small 500px square for grid/card layouts
 */
class PortfolioPhoto extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'portfolio_id',
        'photo_path',      // Original file path (legacy, before media library)
        'display_path',    // Pre-generated display-size path (legacy)
        'thumb_path',      // Pre-generated thumbnail path (legacy)
        'caption',         // Optional description shown below the photo on the website
        'sort_order',      // Controls the display order within the portfolio
    ];

    /* ── Image Uploads ── */

    /** Each portfolio photo stores one image file (replaces on re-upload). */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('photo')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp', 'image/tiff']);
    }

    /**
     * Automatically create web-optimized versions when a photo is uploaded:
     *  - "display": 1800px wide, WebP, for the main portfolio view
     *  - "thumb":   500px square, WebP, for grid layouts
     */
    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('display')
            ->width(1800)
            ->sharpen(10)
            ->format('webp')
            ->quality(85);

        $this->addMediaConversion('thumb')
            ->width(500)
            ->height(500)
            ->sharpen(10)
            ->format('webp')
            ->quality(80);
    }

    /* ── URL Accessors ──
     * These return the best available URL for each size.
     * They try the optimized version first, then the original upload,
     * then fall back to legacy file paths stored in the database.
     */

    /**
     * URL for the large display version of this portfolio photo.
     * Tries optimized WebP first, falls back to the original upload.
     */
    public function getDisplayUrlAttribute(): ?string
    {
        $media = $this->getFirstMedia('photo');
        if ($media) {
            if ($media->hasGeneratedConversion('display')) {
                return $media->getUrl('display');
            }

            return $media->getUrl();
        }

        if ($this->display_path) {
            return '/storage/' . $this->display_path;
        }

        return $this->photo_path ? '/storage/' . $this->photo_path : null;
    }

    /**
     * URL for the small thumbnail version of this portfolio photo.
     * Tries optimized WebP first, falls back to the original upload.
     */
    public function getThumbUrlAttribute(): ?string
    {
        $media = $this->getFirstMedia('photo');
        if ($media) {
            if ($media->hasGeneratedConversion('thumb')) {
                return $media->getUrl('thumb');
            }

            return $media->getUrl();
        }

        if ($this->thumb_path) {
            return '/storage/' . $this->thumb_path;
        }

        return $this->photo_path ? '/storage/' . $this->photo_path : null;
    }

    /** URL for the full original upload (no resizing or conversion). */
    public function getOriginalUrlAttribute(): ?string
    {
        $media = $this->getFirstMedia('photo');
        if ($media) {
            return $media->getUrl();
        }

        return $this->photo_path ? '/storage/' . $this->photo_path : null;
    }

    /* ── Relationships ── */

    /** The portfolio category this photo belongs to. */
    public function portfolio(): BelongsTo
    {
        return $this->belongsTo(Portfolio::class);
    }
}
