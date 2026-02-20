<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class GallerySelection extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'gallery_id',
        'user_id',
        'status',
        'is_locked',
        'notes',
        'submitted_at',
        'approved_at',
        'approved_by',
    ];

    protected function casts(): array
    {
        return [
            'is_locked' => 'boolean',
            'submitted_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'is_locked', 'approved_at'])
            ->logOnlyDirty();
    }

    public function gallery(): BelongsTo
    {
        return $this->belongsTo(Gallery::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function photos(): BelongsToMany
    {
        return $this->belongsToMany(Photo::class, 'gallery_selection_photos')
            ->withPivot(['retouching_notes', 'color_label_override'])
            ->withTimestamps();
    }

    public function approve(User $approver): void
    {
        $this->update([
            'status' => 'approved',
            'is_locked' => true,
            'approved_at' => now(),
            'approved_by' => $approver->id,
        ]);
    }

    public function isEditable(): bool
    {
        return ! $this->is_locked && in_array($this->status, ['draft', 'revision_requested']);
    }
}
