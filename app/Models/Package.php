<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A service package or pricing tier offered by the studio.
 *
 * Examples: "Mini Session - $350", "Wedding Premium - $5,500",
 * "Family Portrait Package - $800".
 *
 * Each package lists what's included (number of edited photos, hours of
 * coverage, prints, albums, etc.) so clients can compare options when
 * making a booking.
 */
class Package extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'studio_id',
        'name',            // Package name shown to clients (e.g. "Wedding Premium")
        'description',     // Longer description of what the client gets
        'price',           // Price in dollars (e.g. 5500.00)
        'type',            // Category of package (wedding, portrait, event, etc.)
        'includes',        // List of what's included, stored as flexible data
        'is_active',       // Only active packages are shown to clients
        'sort_order',      // Controls display order on the pricing page
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'includes' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /** The studio offering this package. */
    public function studio(): BelongsTo
    {
        return $this->belongsTo(Studio::class);
    }

    /** All bookings that chose this package. */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
