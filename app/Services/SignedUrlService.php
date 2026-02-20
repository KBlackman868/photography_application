<?php

namespace App\Services;

use App\Models\Photo;
use Illuminate\Support\Facades\Storage;

class SignedUrlService
{
    public function previewUrl(Photo $photo, int $minutes = 60): string
    {
        $path = $photo->preview_path ?? $photo->original_path;

        return $this->generateUrl($path, $minutes);
    }

    public function thumbUrl(Photo $photo, int $minutes = 60): string
    {
        $path = $photo->thumb_path ?? $photo->preview_path ?? $photo->original_path;

        return $this->generateUrl($path, $minutes);
    }

    public function originalUrl(Photo $photo, int $minutes = 30): string
    {
        return $this->generateUrl($photo->original_path, $minutes);
    }

    public function watermarkedUrl(Photo $photo, int $minutes = 60): string
    {
        $path = $photo->watermarked_path ?? $photo->preview_path ?? $photo->original_path;

        return $this->generateUrl($path, $minutes);
    }

    private function generateUrl(string $path, int $minutes): string
    {
        $disk = config('filesystems.default');

        if ($disk === 'local' || $disk === 'public') {
            return Storage::disk('public')->url($path);
        }

        return Storage::temporaryUrl($path, now()->addMinutes($minutes));
    }
}
