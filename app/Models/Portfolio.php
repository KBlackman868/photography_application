<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A public showcase category on the studio's website (e.g. "Weddings", "Portraits", "Events").
 *
 * Portfolios are how the photographer displays their best work to
 * prospective clients. Each portfolio has a category, a cover photo,
 * and a curated collection of portfolio photos inside it.
 */
class Portfolio extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'studio_id',
        'title',             // Display name (e.g. "Wedding Photography")
        'slug',
        'description',
        'cover_photo_path',  // Main image shown on the portfolio listing page
        'category',          // Category label (weddings, portraits, events, etc.)
        'is_published',      // Only published portfolios appear on the public website
        'sort_order',        // Controls the display order on the website
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
        ];
    }

    /** The studio this portfolio belongs to. */
    public function studio(): BelongsTo
    {
        return $this->belongsTo(Studio::class);
    }

    /** The curated photos inside this portfolio, in the photographer's chosen order. */
    public function portfolioPhotos(): HasMany
    {
        return $this->hasMany(PortfolioPhoto::class)->orderBy('sort_order');
    }

    /** Only portfolios that are live and visible on the public website. */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
