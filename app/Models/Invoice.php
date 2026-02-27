<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * A financial document sent to a client for a booking.
 *
 * Invoices track how much is owed, how much has been paid, and what the
 * charges are for. They break down into line items (e.g. "4-hour session",
 * "20 edited photos", "travel fee") with subtotal, tax, and total.
 *
 * All money fields are stored in dollars with two decimal places.
 */
class Invoice extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'studio_id',
        'booking_id',
        'client_user_id',
        'invoice_number',  // Unique invoice number shown to the client (e.g. "INV-00042")
        'status',          // draft, sent, paid, overdue, void
        'subtotal',        // Sum of all line items before tax
        'tax',             // Tax amount
        'total',           // Final amount due (subtotal + tax)
        'amount_paid',     // How much the client has paid so far
        'due_date',        // When payment is expected
        'paid_at',         // When the invoice was fully paid
        'notes',           // Optional notes shown on the invoice
        'line_items',      // Itemized charges (e.g. session fee, prints, travel)
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'tax' => 'decimal:2',
            'total' => 'decimal:2',
            'amount_paid' => 'decimal:2',
            'due_date' => 'date',
            'paid_at' => 'datetime',
            'line_items' => 'array',
        ];
    }

    /** Tracks payment changes for an audit trail. */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'amount_paid', 'paid_at'])
            ->logOnlyDirty();
    }

    // ── Relationships ─────────────────────────────────────────

    /** The studio that issued this invoice. */
    public function studio(): BelongsTo
    {
        return $this->belongsTo(Studio::class);
    }

    /** The booking this invoice is for. */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /** The client who owes (or paid) this invoice. */
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_user_id');
    }

    // ── Helpers ───────────────────────────────────────────────

    /** How much the client still owes (total minus what's been paid). */
    public function balanceDue(): float
    {
        return (float) $this->total - (float) $this->amount_paid;
    }

    /** Has this invoice been fully paid? */
    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }
}
