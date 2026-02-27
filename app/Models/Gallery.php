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
 * A collection of photos from a shoot that gets shared with the client for review.
 *
 * Galleries are the heart of the client experience. After a shoot, the
 * photographer uploads photos to a gallery and shares it with the client.
 * Clients can then browse, leave comments, heart their favorites, and
 * submit their final selections.
 *
 * Gallery statuses:
 *  - draft:     Still being set up, not visible to the client yet.
 *  - published: Live and shared with the client for viewing.
 *  - archived:  No longer active, kept for records.
 */
class Gallery extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'project_id',
        'studio_id',
        'name',
        'slug',
        'description',
        'cover_photo_path',    // The main thumbnail shown when listing galleries
        'status',              // draft, published, or archived
        'is_public',           // Whether the gallery is accessible without logging in
        'password',            // Optional password protection for private galleries
        'share_token',         // Unique link token so clients can access the gallery
        'allow_downloads',     // Can clients download the full-resolution photos?
        'allow_favorites',     // Can clients "heart" photos they love?
        'allow_comments',      // Can clients leave feedback on individual photos?
        'selection_limit',     // Max number of photos a client can pick for final delivery
        'expires_at',          // After this date the gallery link stops working
        'published_at',        // When the gallery was made live for the client
        'watermark_settings',  // Custom watermark rules for this gallery
        'photo_count',         // Cached count of photos for quick display
    ];

    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
            'allow_downloads' => 'boolean',
            'allow_favorites' => 'boolean',
            'allow_comments' => 'boolean',
            'expires_at' => 'datetime',
            'published_at' => 'datetime',
            'watermark_settings' => 'array',
        ];
    }

    protected $hidden = ['password'];

    /** Tracks changes to gallery details for an audit trail. */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'status', 'is_public'])
            ->logOnlyDirty();
    }

    // ── Relationships ─────────────────────────────────────────

    /** The photography project / shoot this gallery belongs to. */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /** The studio that owns this gallery. */
    public function studio(): BelongsTo
    {
        return $this->belongsTo(Studio::class);
    }

    /** All photos in this gallery, ordered by the photographer's chosen sort. */
    public function photos(): HasMany
    {
        return $this->hasMany(Photo::class)->orderBy('sort_order');
    }

    /** The sets of photos clients have picked as their final choices. */
    public function selections(): HasMany
    {
        return $this->hasMany(GallerySelection::class);
    }

    /** Download / export requests (zip files, CSVs) created from this gallery. */
    public function exportJobs(): HasMany
    {
        return $this->hasMany(ExportJob::class);
    }

    // ── Scopes (quick filters) ────────────────────────────────

    /** Only galleries that are live and visible to clients. */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    /** Only galleries belonging to a specific client. */
    public function scopeForClient($query, User $user)
    {
        return $query->whereHas('project', fn ($q) => $q->where('client_user_id', $user->id));
    }

    // ── Helpers ───────────────────────────────────────────────

    /** Has this gallery's share link expired? */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * How much client feedback has been addressed?
     *
     * Returns a summary of total comments vs. resolved comments with a
     * completion percentage -- useful for showing the photographer how
     * much review work is left.
     */
    public function progressStats(): array
    {
        $totalComments = $this->photos()->withCount([
            'comments as total_comments' => fn ($q) => $q->whereNull('parent_id'),
            'comments as resolved_comments' => fn ($q) => $q->whereNull('parent_id')->whereNotNull('resolved_at'),
        ])->get();

        $total = $totalComments->sum('total_comments');
        $resolved = $totalComments->sum('resolved_comments');

        return [
            'total' => $total,
            'resolved' => $resolved,
            'percent' => $total > 0 ? round(($resolved / $total) * 100) : 0,
        ];
    }
}
