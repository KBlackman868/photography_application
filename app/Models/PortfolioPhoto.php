<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class PortfolioPhoto extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'portfolio_id',
        'photo_path',
        'display_path',
        'thumb_path',
        'caption',
        'sort_order',
    ];

    /* ── Spatie Media ── */

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('photo')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp', 'image/tiff']);
    }

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

    /* ── Accessors ── */

    public function getDisplayUrlAttribute(): ?string
    {
        $media = $this->getFirstMedia('photo');
        if ($media) {
            if ($media->hasGeneratedConversion('display')) {
                return $media->getUrl('display');
            }

            return $media->getUrl();
        }

        return $this->display_path ? '/storage/' . $this->display_path : null;
    }

    public function getThumbUrlAttribute(): ?string
    {
        $media = $this->getFirstMedia('photo');
        if ($media) {
            if ($media->hasGeneratedConversion('thumb')) {
                return $media->getUrl('thumb');
            }

            return $media->getUrl();
        }

        return $this->thumb_path ? '/storage/' . $this->thumb_path : null;
    }

    public function getOriginalUrlAttribute(): ?string
    {
        $media = $this->getFirstMedia('photo');
        if ($media) {
            return $media->getUrl();
        }

        return $this->photo_path ? '/storage/' . $this->photo_path : null;
    }

    /* ── Relationships ── */

    public function portfolio(): BelongsTo
    {
        return $this->belongsTo(Portfolio::class);
    }
}
