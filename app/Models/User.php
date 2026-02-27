<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Permission\Traits\HasRoles;

/**
 * Everyone who logs into the photography application.
 *
 * There are three types of users:
 *  - Admin / Photographer: The studio owner who manages shoots, galleries, and business settings.
 *  - Editor: A team member who helps with photo editing and internal notes but doesn't run the business.
 *  - Client: A customer who books sessions, views galleries, picks favorites, and leaves feedback.
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasRoles, LogsActivity, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'studio_id',     // Which photography studio this person belongs to
        'phone',
        'avatar_path',   // Profile picture
        'role',          // 'admin', 'photographer', 'editor', or 'client'
        'bio',
        'is_active',     // Inactive users cannot log in
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /** Tracks changes to user details for an audit trail. */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email', 'role', 'is_active'])
            ->logOnlyDirty();
    }

    // ── Relationships ─────────────────────────────────────────

    /** The photography studio this user belongs to. */
    public function studio(): BelongsTo
    {
        return $this->belongsTo(Studio::class);
    }

    /** Extra profile details (address, company, preferences) -- only for clients. */
    public function clientProfile(): HasOne
    {
        return $this->hasOne(ClientProfile::class);
    }

    /** All photography projects/shoots this client has been part of. */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class, 'client_user_id');
    }

    /** Every comment or piece of feedback this user has left on photos. */
    public function comments(): HasMany
    {
        return $this->hasMany(PhotoComment::class);
    }

    /** All the photos this user has "hearted" / marked as favorites. */
    public function favorites(): HasMany
    {
        return $this->hasMany(PhotoFavorite::class);
    }

    /** Photo selections this user has submitted (their final picks from a gallery). */
    public function selections(): HasMany
    {
        return $this->hasMany(GallerySelection::class);
    }

    /** Session bookings / appointment requests made by this client. */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'client_user_id');
    }

    /** Invoices issued to this client for their bookings. */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'client_user_id');
    }

    // ── Role Helpers ──────────────────────────────────────────

    /** Is this user the studio owner or photographer who runs the business? */
    public function isAdmin(): bool
    {
        return in_array($this->role, ['admin', 'photographer']);
    }

    /** Is this user a client who books sessions and views galleries? */
    public function isClient(): bool
    {
        return $this->role === 'client';
    }

    /** Is this user an editor who helps with photo work and internal notes? */
    public function isEditor(): bool
    {
        return $this->role === 'editor';
    }
}
