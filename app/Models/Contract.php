<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A contract or agreement attached to a booking that the client signs.
 *
 * Before a session, the photographer sends a contract for the client to
 * review and sign electronically. The contract stores the full text,
 * the client's signature image, and when/where it was signed.
 */
class Contract extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'title',            // Contract title (e.g. "Wedding Photography Agreement")
        'content',          // The full contract text / terms
        'signature_path',   // Image file of the client's electronic signature
        'signer_name',      // Name the client typed when signing
        'signer_ip',        // IP address at the time of signing (for legal records)
        'signed_at',        // When the client signed -- null means not yet signed
    ];

    protected function casts(): array
    {
        return [
            'signed_at' => 'datetime',
        ];
    }

    /** The booking this contract is for. */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /** Has the client signed this contract yet? */
    public function isSigned(): bool
    {
        return $this->signed_at !== null;
    }
}
