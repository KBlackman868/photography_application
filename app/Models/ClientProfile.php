<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Extra details about a client beyond their basic login info.
 *
 * This stores things like the client's company name, mailing address,
 * how they found us, and any personal preferences (style likes, special
 * requests) so we can deliver a more personalized experience.
 */
class ClientProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'studio_id',
        'company',          // Client's business name (if applicable)
        'address',
        'city',
        'state',
        'zip',
        'country',
        'notes',            // Internal notes about this client
        'referral_source',  // How they heard about us (e.g. "Instagram", "friend referral")
        'preferences',      // Client style preferences, saved as flexible data
    ];

    protected function casts(): array
    {
        return [
            'preferences' => 'array',
        ];
    }

    /** The client this profile belongs to. */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** The photography studio this client is associated with. */
    public function studio(): BelongsTo
    {
        return $this->belongsTo(Studio::class);
    }
}
