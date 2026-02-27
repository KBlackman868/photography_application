<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * A client's session booking / appointment request with the studio.
 *
 * This is the main record that tracks a client's journey from initial
 * inquiry all the way through to a completed shoot.
 *
 * Status flow:
 *  1. inquiry   -- Client has reached out, nothing confirmed yet.
 *  2. quoted    -- Photographer sent a price quote.
 *  3. confirmed -- Client accepted the quote and date is locked in.
 *  4. paid      -- Deposit or full payment received.
 *  5. completed -- The session happened and everything is wrapped up.
 *  6. cancelled -- Booking was called off.
 *
 * Each booking gets an auto-generated reference number (e.g. "KB-00042")
 * for easy tracking in emails and conversations.
 */
class Booking extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'studio_id',
        'project_id',
        'client_user_id',
        'package_id',
        'reference_number',  // Auto-generated (e.g. "KB-00042") for easy tracking
        'status',            // inquiry, quoted, confirmed, paid, completed, or cancelled
        'session_date',      // When the photo session is scheduled
        'location',          // Where the shoot will take place
        'notes',             // Any special instructions or details from the client
        'total_amount',      // Full price for this booking
        'deposit_amount',    // Upfront deposit required to hold the date
        'confirmed_at',      // When the booking was officially confirmed
    ];

    /**
     * Automatically assign a reference number (e.g. "KB-00042") when
     * a new booking is created, so every booking has a short, easy-to-share ID.
     */
    protected static function booted(): void
    {
        static::creating(function (Booking $booking) {
            if (! $booking->reference_number) {
                $booking->reference_number = 'KB-' . str_pad(
                    (static::withTrashed()->max('id') ?? 0) + 1,
                    5,
                    '0',
                    STR_PAD_LEFT
                );
            }
        });
    }

    protected function casts(): array
    {
        return [
            'session_date' => 'datetime',
            'confirmed_at' => 'datetime',
            'total_amount' => 'decimal:2',
            'deposit_amount' => 'decimal:2',
        ];
    }

    /** Tracks booking status changes for an audit trail. */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'session_date', 'total_amount'])
            ->logOnlyDirty();
    }

    // ── Relationships ─────────────────────────────────────────

    /** The studio handling this booking. */
    public function studio(): BelongsTo
    {
        return $this->belongsTo(Studio::class);
    }

    /** The photography project / shoot this booking is tied to. */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /** The client who made this booking. */
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_user_id');
    }

    /** The service package the client chose (e.g. "Wedding Premium"). */
    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    /** The contract the client needs to sign for this booking. */
    public function contract(): HasOne
    {
        return $this->hasOne(Contract::class);
    }

    /** Invoices issued to the client for this booking. */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }
}
