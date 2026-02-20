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
use Intervention\Image\Laravel\Facades\Image;

class GenerateThumbnailsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 30;

    public function __construct(public Photo $photo) {}

    public function handle(): void
    {
        try {
            $originalPath = Storage::disk('public')->path($this->photo->original_path);

            if (! file_exists($originalPath)) {
                Log::warning("Original file not found for photo {$this->photo->id}: {$originalPath}");

                return;
            }

            $galleryId = $this->photo->gallery_id;
            $baseName = pathinfo($this->photo->original_path, PATHINFO_FILENAME);
            $thumbDir = "galleries/{$galleryId}/thumbnails";

            Storage::disk('public')->makeDirectory($thumbDir);

            // Generate thumbnail (300x300 crop)
            $thumbPath = "{$thumbDir}/{$baseName}_thumb.jpg";
            $image = Image::read($originalPath);
            $image->cover(300, 300);
            Storage::disk('public')->put($thumbPath, $image->toJpeg(80)->toString());

            $this->photo->update(['thumb_path' => $thumbPath]);

            Log::info("Thumbnail generated for photo {$this->photo->id}");
        } catch (\Exception $e) {
            Log::error("Thumbnail generation failed for photo {$this->photo->id}: {$e->getMessage()}");
            throw $e;
        }
    }
}
