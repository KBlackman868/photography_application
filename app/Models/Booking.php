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

class Booking extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'studio_id',
        'project_id',
        'client_user_id',
        'package_id',
        'reference_number',
        'status',
        'session_date',
        'location',
        'notes',
        'total_amount',
        'deposit_amount',
        'confirmed_at',
    ];

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

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'session_date', 'total_amount'])
            ->logOnlyDirty();
    }

    public function studio(): BelongsTo
    {
        return $this->belongsTo(Studio::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_user_id');
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function contract(): HasOne
    {
        return $this->hasOne(Contract::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }
}
