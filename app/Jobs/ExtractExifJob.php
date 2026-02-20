<?php

namespace App\Jobs;

use App\Models\Photo;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ExtractExifJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public function __construct(public Photo $photo) {}

    public function handle(): void
    {
        try {
            $originalPath = Storage::disk('public')->path($this->photo->original_path);

            if (! file_exists($originalPath)) {
                return;
            }

            $exifRaw = @exif_read_data($originalPath, 'ANY_TAG', true);

            if (! $exifRaw) {
                return;
            }

            $exif = [
                'camera' => $exifRaw['IFD0']['Model'] ?? $exifRaw['IFD0']['Make'] ?? null,
                'lens' => $exifRaw['EXIF']['LensModel'] ?? $exifRaw['EXIF']['LensInfo'] ?? null,
                'aperture' => isset($exifRaw['EXIF']['FNumber']) ? $this->parseFraction($exifRaw['EXIF']['FNumber']) : null,
                'shutter_speed' => $exifRaw['EXIF']['ExposureTime'] ?? null,
                'iso' => $exifRaw['EXIF']['ISOSpeedRatings'] ?? null,
                'focal_length' => isset($exifRaw['EXIF']['FocalLength']) ? $this->parseFraction($exifRaw['EXIF']['FocalLength']) : null,
                'date_taken' => $exifRaw['EXIF']['DateTimeOriginal'] ?? null,
                'width' => $exifRaw['COMPUTED']['Width'] ?? null,
                'height' => $exifRaw['COMPUTED']['Height'] ?? null,
            ];

            $this->photo->update([
                'exif_data' => array_filter($exif),
                'width' => $exif['width'] ?? $this->photo->width,
                'height' => $exif['height'] ?? $this->photo->height,
            ]);

            Log::info("EXIF extracted for photo {$this->photo->id}");
        } catch (\Exception $e) {
            Log::error("EXIF extraction failed for photo {$this->photo->id}: {$e->getMessage()}");
        }
    }

    private function parseFraction(string $value): ?float
    {
        if (str_contains($value, '/')) {
            [$num, $den] = explode('/', $value);

            return $den > 0 ? round((float) $num / (float) $den, 1) : null;
        }

        return (float) $value;
    }
}
