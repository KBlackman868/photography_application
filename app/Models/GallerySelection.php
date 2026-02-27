<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * The set of photos a client picks from a gallery for final delivery.
 *
 * After browsing a gallery, the client selects their favorite photos
 * and submits them. The photographer reviews the selection and can
 * approve it, request changes, or lock it once finalized.
 *
 * Status flow:
 *  - draft:              Client is still choosing photos.
 *  - submitted:          Client has sent their picks for review.
 *  - revision_requested: Photographer asked the client to adjust their choices.
 *  - approved:           Photographer confirmed the selection -- ready for final editing/delivery.
 *
 * Once approved, the selection is locked so it cannot be accidentally changed.
 */
class GallerySelection extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'gallery_id',
        'user_id',
        'status',          // draft, submitted, revision_requested, or approved
        'is_locked',       // When true, the client can no longer change their picks
        'notes',           // Optional message from the client about their choices
        'submitted_at',    // When the client sent their selection for review
        'approved_at',     // When the photographer approved the final picks
        'approved_by',     // Which team member approved it
    ];

    protected function casts(): array
    {
        return [
            'is_locked' => 'boolean',
            'submitted_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    /** Tracks changes to selections for an audit trail. */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'is_locked', 'approved_at'])
            ->logOnlyDirty();
    }

    // ── Relationships ─────────────────────────────────────────

    /** The gallery this selection was made from. */
    public function gallery(): BelongsTo
    {
        return $this->belongsTo(Gallery::class);
    }

    /** The client who made this selection. */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** The team member who approved this selection. */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * The individual photos the client chose.
     * Each selected photo can also carry retouching notes (e.g. "please
     * remove background sign") and a color label override from the client.
     */
    public function photos(): BelongsToMany
    {
        return $this->belongsToMany(Photo::class, 'gallery_selection_photos')
            ->withPivot(['retouching_notes', 'color_label_override'])
            ->withTimestamps();
    }

    // ── Helpers ───────────────────────────────────────────────

    /** Approve the client's picks and lock the selection so it can't be changed. */
    public function approve(User $approver): void
    {
        $this->update([
            'status' => 'approved',
            'is_locked' => true,
            'approved_at' => now(),
            'approved_by' => $approver->id,
        ]);
    }

    /** Can the client still add or remove photos from this selection? */
    public function isEditable(): bool
    {
        return ! $this->is_locked && in_array($this->status, ['draft', 'revision_requested']);
    }
}
