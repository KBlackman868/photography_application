<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Studio extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, InteractsWithMedia;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'logo_path',
        'photographer_photo_path',
        'website',
        'email',
        'phone',
        'branding',
        'watermark_settings',
        'payment_settings',
        'hero_images',
        'social_links',
        'availability_hours',
        'timezone',
    ];

    protected function casts(): array
    {
        return [
            'branding' => 'array',
            'watermark_settings' => 'array',
            'payment_settings' => 'array',
            'hero_images' => 'array',
            'social_links' => 'array',
            'availability_hours' => 'array',
        ];
    }

    /* ── Spatie Media Collections ── */

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('logo')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']);

        $this->addMediaCollection('hero-images')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);

        $this->addMediaCollection('photographer-photo')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(500)
            ->height(500)
            ->sharpen(10)
            ->format('webp')
            ->quality(80)
            ->performOnCollections('hero-images', 'photographer-photo');

        $this->addMediaConversion('display')
            ->width(1800)
            ->sharpen(10)
            ->format('webp')
            ->quality(85)
            ->performOnCollections('hero-images', 'photographer-photo');
    }

    /* ── Convenience Accessors ── */

    public function getLogoUrlAttribute(): ?string
    {
        return $this->getFirstMediaUrl('logo') ?: ($this->logo_path ? '/storage/' . $this->logo_path : null);
    }

    public function getPhotographerPhotoUrlAttribute(): ?string
    {
        $media = $this->getFirstMedia('photographer-photo');
        if ($media) {
            return $media->getUrl('display');
        }

        return $this->photographer_photo_path ? '/storage/' . $this->photographer_photo_path : null;
    }

    public function getHeroImageUrlsAttribute(): array
    {
        $mediaUrls = $this->getMedia('hero-images')->map(fn (Media $m) => $m->getUrl('display'))->toArray();

        if (! empty($mediaUrls)) {
            return $mediaUrls;
        }

        // Fallback to legacy hero_images column
        return $this->hero_images ?? [];
    }

    /* ── Relationships ── */

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function galleries(): HasMany
    {
        return $this->hasMany(Gallery::class);
    }

    public function portfolios(): HasMany
    {
        return $this->hasMany(Portfolio::class);
    }

    public function packages(): HasMany
    {
        return $this->hasMany(Package::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function clientProfiles(): HasMany
    {
        return $this->hasMany(ClientProfile::class);
    }

    public function testimonials(): HasMany
    {
        return $this->hasMany(Testimonial::class);
    }
}
