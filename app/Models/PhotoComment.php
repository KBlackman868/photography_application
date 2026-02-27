<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * Feedback on a specific photo -- from clients, the photographer, or the editing team.
 *
 * Comments support threaded conversations: a client can leave a top-level
 * comment (e.g. "Can you brighten this one?"), and the photographer or
 * editor can reply directly to it.
 *
 * Comments can also be:
 *  - Internal:   Only visible to the team (editor notes), hidden from clients.
 *  - Pinned:     Attached to a specific spot on the photo (pin_position stores x/y coordinates).
 *  - Resolved:   Marked as "done" once the requested change has been made.
 */
class PhotoComment extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'photo_id',
        'user_id',
        'parent_id',       // If this is a reply, which comment it's replying to
        'body',            // The actual feedback text
        'is_internal',     // True = team-only note, hidden from the client
        'resolved_at',     // When this feedback was marked as addressed
        'resolved_by',     // Who marked it as resolved
        'pin_position',    // X/Y coordinates if the comment is pinned to a spot on the photo
    ];

    protected function casts(): array
    {
        return [
            'is_internal' => 'boolean',
            'resolved_at' => 'datetime',
            'pin_position' => 'array',
        ];
    }

    /** Tracks changes to comments for an audit trail. */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['body', 'is_internal', 'resolved_at'])
            ->logOnlyDirty();
    }

    // ── Relationships ─────────────────────────────────────────

    /** The photo this feedback is about. */
    public function photo(): BelongsTo
    {
        return $this->belongsTo(Photo::class);
    }

    /** The person who wrote this comment. */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** The original comment this is a reply to (if it is a reply). */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(PhotoComment::class, 'parent_id');
    }

    /** All replies to this comment, in chronological order. */
    public function replies(): HasMany
    {
        return $this->hasMany(PhotoComment::class, 'parent_id')->orderBy('created_at');
    }

    /** The team member who marked this feedback as resolved / addressed. */
    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    // ── Helpers ───────────────────────────────────────────────

    /** Has the requested change been addressed? */
    public function isResolved(): bool
    {
        return $this->resolved_at !== null;
    }

    /** Is this a reply to another comment (rather than a top-level comment)? */
    public function isReply(): bool
    {
        return $this->parent_id !== null;
    }

    /** Mark this feedback as done -- the requested change has been made. */
    public function resolve(User $user): void
    {
        $this->update([
            'resolved_at' => now(),
            'resolved_by' => $user->id,
        ]);
    }

    /** Re-open this feedback because the change still needs work. */
    public function unresolve(): void
    {
        $this->update([
            'resolved_at' => null,
            'resolved_by' => null,
        ]);
    }

    // ── Scopes (quick filters) ────────────────────────────────

    /** Only comments visible to clients (not internal team notes). */
    public function scopePublic($query)
    {
        return $query->where('is_internal', false);
    }

    /** Only internal team notes (hidden from the client). */
    public function scopeInternal($query)
    {
        return $query->where('is_internal', true);
    }

    /** Only feedback that still needs to be addressed. */
    public function scopeUnresolved($query)
    {
        return $query->whereNull('resolved_at');
    }

    /** Only feedback that has already been addressed. */
    public function scopeResolved($query)
    {
        return $query->whereNotNull('resolved_at');
    }

    /** Only top-level comments (not replies). */
    public function scopeRootLevel($query)
    {
        return $query->whereNull('parent_id');
    }
}
