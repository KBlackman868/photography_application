<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * The photography business itself.
 *
 * A Studio holds all the branding, contact info, and settings for one
 * photography business. Everything else (projects, clients, galleries,
 * bookings, invoices) belongs to a studio.
 */
class Studio extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, InteractsWithMedia;

    protected $fillable = [
        'name',
        'slug',                     // URL-friendly name (e.g. "miller-photography")
        'description',
        'logo_path',                // Studio logo shown on the website
        'photographer_photo_path',  // Headshot / about-me photo of the photographer
        'website',
        'email',
        'phone',
        'branding',                 // Colors, fonts, and other brand customizations
        'watermark_settings',       // How photos are watermarked before sharing
        'payment_settings',         // Payment gateway configuration
        'hero_images',              // Large banner images for the homepage
        'social_links',             // Instagram, Facebook, etc.
        'availability_hours',       // Business hours for booking availability
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

    /* ── Image Collections ──
     * The studio stores three kinds of images:
     *   1. logo          – The studio's logo (one file only)
     *   2. hero-images   – Big banner photos for the homepage (multiple)
     *   3. photographer-photo – A headshot or portrait of the photographer (one file only)
     */

    public function registerMediaCollections(): void
    {
        // Studio logo -- only one at a time, replaces the old one on upload
        $this->addMediaCollection('logo')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']);

        // Homepage banner images -- can have several
        $this->addMediaCollection('hero-images')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);

        // The photographer's own headshot for the "About" section
        $this->addMediaCollection('photographer-photo')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);
    }

    /**
     * Automatic image resizing for the website.
     * - "thumb"   = small 500px square preview (for grids / cards)
     * - "display" = large 1800px wide version (for the actual page display)
     * Both are converted to WebP for faster loading.
     */
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

    /* ── Convenience Accessors ──
     * These give a simple URL for each image, automatically picking the
     * best available version (optimized first, falling back to the original).
     */

    /** Returns the URL for the studio logo to display on the website. */
    public function getLogoUrlAttribute(): ?string
    {
        return $this->getFirstMediaUrl('logo') ?: ($this->logo_path ? '/storage/' . $this->logo_path : null);
    }

    /** Returns the URL for the photographer's headshot / about-me photo. */
    public function getPhotographerPhotoUrlAttribute(): ?string
    {
        $media = $this->getFirstMedia('photographer-photo');
        if ($media) {
            if ($media->hasGeneratedConversion('display')) {
                return $media->getUrl('display');
            }

            return $media->getUrl();
        }

        return $this->photographer_photo_path ? '/storage/' . $this->photographer_photo_path : null;
    }

    /** Returns an array of URLs for the homepage banner / hero images. */
    public function getHeroImageUrlsAttribute(): array
    {
        $mediaItems = $this->getMedia('hero-images');

        if ($mediaItems->isNotEmpty()) {
            return $mediaItems->map(function (Media $m) {
                if ($m->hasGeneratedConversion('display')) {
                    return $m->getUrl('display');
                }

                return $m->getUrl();
            })->toArray();
        }

        // Fallback to legacy hero_images column
        $legacy = $this->hero_images ?? [];

        return array_map(function ($path) {
            if (str_starts_with($path, 'http') || str_starts_with($path, '/')) {
                return $path;
            }

            return '/storage/' . $path;
        }, $legacy);
    }

    /* ── Relationships ── */

    /** All people associated with this studio (admins, editors, and clients). */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /** All photography projects / shoots managed by this studio. */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    /** All photo galleries created for client review. */
    public function galleries(): HasMany
    {
        return $this->hasMany(Gallery::class);
    }

    /** Public portfolio categories (e.g. "Weddings", "Portraits") shown on the website. */
    public function portfolios(): HasMany
    {
        return $this->hasMany(Portfolio::class);
    }

    /** Service packages and pricing tiers offered by this studio. */
    public function packages(): HasMany
    {
        return $this->hasMany(Package::class);
    }

    /** All session bookings / appointment requests for this studio. */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /** All invoices issued by this studio. */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    /** Detailed profiles for every client who has worked with this studio. */
    public function clientProfiles(): HasMany
    {
        return $this->hasMany(ClientProfile::class);
    }

    /** Client reviews / testimonials displayed on the public website. */
    public function testimonials(): HasMany
    {
        return $this->hasMany(Testimonial::class);
    }
}
