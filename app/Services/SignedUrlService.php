<?php

namespace App\Services;

use App\Models\Photo;
use Illuminate\Support\Facades\Storage;

/**
 * Generates secure, time-limited URLs for viewing photos. When using cloud
 * storage (S3, etc.), URLs are signed and expire after a set time so photos
 * cannot be shared via direct links indefinitely. For local storage during
 * development, regular public URLs are returned instead.
 */
class SignedUrlService
{
    /**
     * URL for the gallery viewing version of the photo (1800px preview).
     * Falls back to the original if a preview has not been generated yet.
     */
    public function previewUrl(Photo $photo, int $minutes = 60): string
    {
        $path = $photo->preview_path ?? $photo->original_path;

        return $this->generateUrl($path, $minutes);
    }

    /**
     * URL for the small thumbnail used in gallery grids and selection screens.
     * Falls back through preview then original if thumbnails are still processing.
     */
    public function thumbUrl(Photo $photo, int $minutes = 60): string
    {
        $path = $photo->thumb_path ?? $photo->preview_path ?? $photo->original_path;

        return $this->generateUrl($path, $minutes);
    }

    /**
     * URL for the full-resolution original -- used for downloads and admin access.
     * Shorter expiry (30 min default) since these are high-value files.
     */
    public function originalUrl(Photo $photo, int $minutes = 30): string
    {
        return $this->generateUrl($photo->original_path, $minutes);
    }

    /**
     * URL for the watermarked version shown to clients who have not yet purchased.
     * Falls back to preview or original if no watermarked copy exists.
     */
    public function watermarkedUrl(Photo $photo, int $minutes = 60): string
    {
        $path = $photo->watermarked_path ?? $photo->preview_path ?? $photo->original_path;

        return $this->generateUrl($path, $minutes);
    }

    /**
     * Generate the actual URL. For local/public disk (development), returns a
     * plain URL. For cloud storage (production), returns a signed URL that
     * expires after the specified number of minutes.
     */
    private function generateUrl(string $path, int $minutes): string
    {
        $disk = config('filesystems.default');

        if ($disk === 'local' || $disk === 'public') {
            return Storage::disk('public')->url($path);
        }

        return Storage::temporaryUrl($path, now()->addMinutes($minutes));
    }
}
