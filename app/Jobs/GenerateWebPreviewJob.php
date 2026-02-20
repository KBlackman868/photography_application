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

class GenerateWebPreviewJob implements ShouldQueue
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
                Log::warning("Original file not found for photo {$this->photo->id}");

                return;
            }

            $galleryId = $this->photo->gallery_id;
            $baseName = pathinfo($this->photo->original_path, PATHINFO_FILENAME);
            $previewDir = "galleries/{$galleryId}/previews";

            Storage::disk('public')->makeDirectory($previewDir);

            // Generate web preview (max 2048px on longest side)
            $previewPath = "{$previewDir}/{$baseName}_preview.jpg";
            $image = Image::read($originalPath);
            $image->scaleDown(2048, 2048);

            $width = $image->width();
            $height = $image->height();

            Storage::disk('public')->put($previewPath, $image->toJpeg(85)->toString());

            $this->photo->update([
                'preview_path' => $previewPath,
                'width' => $width,
                'height' => $height,
            ]);

            Log::info("Web preview generated for photo {$this->photo->id}");
        } catch (\Exception $e) {
            Log::error("Preview generation failed for photo {$this->photo->id}: {$e->getMessage()}");
            throw $e;
        }
    }
}
