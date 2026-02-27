<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * When a client "hearts" a photo they love.
 *
 * This is the simple record created each time a client taps the heart
 * icon on a photo. It helps the photographer see which images resonated
 * most with the client.
 */
class PhotoFavorite extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'photo_id',   // The photo that was hearted
        'user_id',    // The client who hearted it
    ];

    /** Tracks when photos are favorited / unfavorited. */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['photo_id', 'user_id']);
    }

    /** The photo that was hearted. */
    public function photo(): BelongsTo
    {
        return $this->belongsTo(Photo::class);
    }

    /** The client who hearted this photo. */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
