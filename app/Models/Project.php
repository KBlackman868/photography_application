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
 * A photography project or shoot -- for example "The Miller Family Session" or "Smith Wedding".
 *
 * A project ties together a client, one or more photo galleries, and any
 * related bookings. It tracks the type of shoot (wedding, portrait, event,
 * etc.) and its current status so the team knows where things stand.
 */
class Project extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'studio_id',
        'client_user_id',
        'name',             // Human-friendly project name (e.g. "Johnson Wedding")
        'slug',
        'description',
        'type',             // Kind of shoot: wedding, portrait, event, commercial, etc.
        'status',           // Where the project is in the workflow (e.g. active, completed, archived)
        'shoot_date',       // When the photo session took or will take place
        'location',         // Where the shoot happens
        'metadata',         // Any extra details stored as flexible data
    ];

    protected function casts(): array
    {
        return [
            'shoot_date' => 'date',
            'metadata' => 'array',
        ];
    }

    /** Tracks changes to project details for an audit trail. */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'status', 'type'])
            ->logOnlyDirty();
    }

    /** The photography studio running this project. */
    public function studio(): BelongsTo
    {
        return $this->belongsTo(Studio::class);
    }

    /** The client who hired us for this shoot. */
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_user_id');
    }

    /** Photo galleries created from this shoot for the client to review. */
    public function galleries(): HasMany
    {
        return $this->hasMany(Gallery::class);
    }

    /** Session bookings / appointments associated with this project. */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
