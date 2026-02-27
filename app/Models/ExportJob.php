<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Tracks a download or export request (zip file of photos, CSV spreadsheet, etc.).
 *
 * When someone requests a download from a gallery, an ExportJob is created
 * to track the progress. Packaging many photos into a zip can take time,
 * so this runs in the background.
 *
 * Status lifecycle:
 *  1. pending    -- Request received, waiting in line.
 *  2. processing -- Currently packaging the files.
 *  3. completed  -- Ready to download (link expires after 7 days).
 *  4. failed     -- Something went wrong; error_message explains what.
 */
class ExportJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'gallery_id',
        'user_id',
        'type',            // What kind of export: 'zip', 'csv', etc.
        'status',          // pending, processing, completed, or failed
        'file_path',       // Where the finished file is stored
        'file_size',       // Size of the finished file in bytes
        'photo_count',     // How many photos are included
        'error_message',   // What went wrong (only if status is 'failed')
        'started_at',      // When packaging began
        'completed_at',    // When the file was ready (or failed)
        'expires_at',      // Download link expires after this date
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    // ── Relationships ─────────────────────────────────────────

    /** The gallery this export was created from. */
    public function gallery(): BelongsTo
    {
        return $this->belongsTo(Gallery::class);
    }

    /** The person who requested this download / export. */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ── Status Transitions ────────────────────────────────────

    /** The export has started packaging files. */
    public function markProcessing(): void
    {
        $this->update(['status' => 'processing', 'started_at' => now()]);
    }

    /** The export finished successfully -- the download is ready (expires in 7 days). */
    public function markCompleted(string $filePath, int $fileSize): void
    {
        $this->update([
            'status' => 'completed',
            'file_path' => $filePath,
            'file_size' => $fileSize,
            'completed_at' => now(),
            'expires_at' => now()->addDays(7),
        ]);
    }

    /** The export failed -- record what went wrong. */
    public function markFailed(string $error): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $error,
            'completed_at' => now(),
        ]);
    }
}
